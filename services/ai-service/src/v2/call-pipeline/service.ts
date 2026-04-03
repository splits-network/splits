/**
 * Call Pipeline Service
 * Orchestrates: download recording -> transcribe via Whisper -> summarize via GPT -> store.
 */

import { spawn } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, unlink, readFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { Logger } from '@splits-network/shared-logging';
import type { IAiClient } from '@splits-network/shared-ai-client';
import { IEventPublisher } from '../shared/events.js';
import { CallPipelineRepository, CallContext } from './repository.js';
import { getPromptForCallType, PROMPT_VERSIONS } from './prompt-templates.js';

interface CallRecordingEvent {
    call_id: string;
    recording_url: string;
    duration_seconds: number;
    file_size_bytes: number;
}

interface WhisperSegment {
    start: number;
    end: number;
    text: string;
}

const WHISPER_SIZE_LIMIT = 25 * 1024 * 1024; // 25 MB

export class CallPipelineService {
    private openaiApiKey: string;

    constructor(
        private repository: CallPipelineRepository,
        private eventPublisher: IEventPublisher | undefined,
        private logger: Logger,
        private aiClient?: IAiClient,
    ) {
        // Whisper API still needs a direct API key (not abstracted)
        this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    }

    /**
     * Full pipeline: download -> transcribe -> summarize -> store.
     * Respects per-call flags (recording_enabled, transcription_enabled, ai_analysis_enabled)
     * and the creator's current subscription tier before processing.
     *
     * Decision tree:
     *   if (!recording_enabled) return
     *   if (tier === 'starter') return
     *   if (transcription_enabled) transcribe()
     *   if (tier === 'partner' && ai_analysis_enabled && transcription_enabled) summarize()
     *   complete()
     *
     * On failure, sets status to 'failed' and does NOT rethrow.
     */
    async processRecording(event: CallRecordingEvent): Promise<void> {
        const { call_id } = event;
        const startTime = Date.now();

        try {
            // Step 0: Check call flags before doing any work
            const flags = await this.repository.getCallFlags(call_id);

            if (!flags) {
                this.logger.warn({ call_id }, 'Call not found, skipping pipeline');
                return;
            }

            if (!flags.recording_enabled) {
                this.logger.info({ call_id }, 'Recording not enabled for call, skipping pipeline');
                return;
            }

            // Step 0b: Check creator tier — graceful skip on billing DB failure
            let tier: 'starter' | 'pro' | 'partner';
            try {
                tier = await this.repository.getCreatorTier(flags.created_by);
            } catch (tierErr) {
                this.logger.error(
                    { tierErr, call_id, user_id: flags.created_by },
                    'Failed to check creator tier, skipping for retry',
                );
                return;
            }

            if (tier === 'starter') {
                this.logger.info({ call_id, tier }, 'Starter tier — skipping transcription and summarization');
                return;
            }

            // Step 1: Set initial status
            await this.repository.updatePipelineStatus(call_id, 'transcribing');

            // Step 2: Get call context for prompt injection
            const context = await this.repository.getCallWithContext(call_id);

            // Step 3: Transcription (gated on transcription_enabled)
            if (!flags.transcription_enabled) {
                this.logger.info({ call_id }, 'Transcription not enabled for call, skipping');
                await this.repository.updatePipelineStatus(call_id, 'complete');
                return;
            }

            const signedUrl = await this.repository.getRecordingSignedUrl(call_id);
            const audioBuffer = await this.downloadRecording(signedUrl);

            let transcriptionBuffer: Buffer;
            let filename: string;

            if (event.file_size_bytes > WHISPER_SIZE_LIMIT) {
                this.logger.info(
                    { call_id, file_size: event.file_size_bytes },
                    'File exceeds 25MB, extracting audio via FFmpeg',
                );
                transcriptionBuffer = await this.extractAudioWithFfmpeg(audioBuffer);
                filename = 'audio.mp3';
            } else {
                transcriptionBuffer = audioBuffer;
                filename = 'recording.mp4';
            }

            const whisperResult = await this.callWhisperApi(transcriptionBuffer, filename);

            // Map segments with participant names
            const segments = this.mapSegmentsToSpeakers(
                whisperResult.segments || [],
                context.participants,
            );

            const processingTimeMs = Date.now() - startTime;

            // Step 4: Save transcript
            await this.repository.saveTranscript({
                callId: call_id,
                fullText: whisperResult.text,
                segments,
                language: whisperResult.language || 'en',
                whisperModel: 'whisper-1',
                processingTimeMs,
            });

            // Step 5: Summarization (gated on Partner tier + ai_analysis_enabled)
            let hasSummary = false;

            if (tier === 'partner' && flags.ai_analysis_enabled) {
                await this.repository.updatePipelineStatus(call_id, 'summarizing');

                const { systemPrompt, userPrompt } = getPromptForCallType(
                    context.callType,
                    context,
                    whisperResult.text,
                );

                const summaryResult = await this.callOpenAI(systemPrompt, userPrompt);
                const modelLabel = `${summaryResult.provider}/${summaryResult.model}`;

                // Step 6: Build and save structured summary
                const summaryData = {
                    tldr: this.extractTldr(summaryResult.content),
                    content: summaryResult.content,
                    call_type: context.callType,
                    prompt_version: PROMPT_VERSIONS[context.callType] || 'unknown',
                    model: modelLabel,
                    action_items: this.extractActionItems(summaryResult.content),
                    entity_context: this.buildEntityContextSnapshot(context),
                };

                await this.repository.saveSummary(call_id, summaryData, modelLabel);
                hasSummary = true;

                this.logger.info(
                    {
                        call_id,
                        call_type: context.callType,
                        processing_time_ms: Date.now() - startTime,
                        transcript_length: whisperResult.text.length,
                        segments_count: segments.length,
                        has_action_items: !!summaryData.action_items?.length,
                    },
                    'Call pipeline completed with summarization',
                );
            } else {
                this.logger.info(
                    { call_id, tier, ai_analysis_enabled: flags.ai_analysis_enabled },
                    `Skipping AI summarization (tier=${tier}, ai_analysis_enabled=${flags.ai_analysis_enabled})`,
                );

                this.logger.info(
                    {
                        call_id,
                        call_type: context.callType,
                        processing_time_ms: Date.now() - startTime,
                        transcript_length: whisperResult.text.length,
                        segments_count: segments.length,
                    },
                    'Call pipeline completed with transcription only',
                );
            }

            // Step 7: Complete (always fires after transcription, with or without summary)
            await this.repository.updatePipelineStatus(call_id, 'complete');

            // Step 8: Publish event (non-critical)
            if (this.eventPublisher) {
                try {
                    await this.eventPublisher.publish('call.summary_ready', {
                        call_id,
                        call_type: context.callType,
                        has_action_items: hasSummary,
                    });
                } catch {
                    // Event publish failure is non-critical
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error({ error, call_id }, 'Call pipeline failed');

            try {
                await this.repository.updatePipelineStatus(call_id, 'failed', errorMessage);
            } catch (statusErr) {
                this.logger.error(
                    { statusErr, call_id },
                    'Failed to update pipeline status to failed',
                );
            }
        }
    }

    /**
     * Extract TL;DR from summary markdown.
     * Looks for "**TL;DR:**" or "TL;DR:" pattern.
     */
    private extractTldr(markdown: string): string {
        const lines = markdown.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            // Match **TL;DR:** text or TL;DR: text
            const match = trimmed.match(/^\*?\*?TL;DR:\*?\*?\s*(.+)/i);
            if (match) return match[1].trim();
        }
        // Fallback: first non-empty line
        const firstLine = lines.find((l) => l.trim().length > 0);
        return firstLine?.trim() || 'Summary generated';
    }

    /**
     * Extract action items from "## Action Items" section.
     */
    private extractActionItems(markdown: string): string[] | undefined {
        const lines = markdown.split('\n');
        const actionIdx = lines.findIndex((l) =>
            /^##\s*action\s*items/i.test(l.trim()),
        );
        if (actionIdx === -1) return undefined;

        const items: string[] = [];
        for (let i = actionIdx + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('## ')) break; // Next section
            if (line.startsWith('- ') || line.startsWith('* ')) {
                items.push(line.substring(2).trim());
            }
        }

        return items.length > 0 ? items : undefined;
    }

    /**
     * Build a snapshot of entity context for storage in the summary JSONB.
     */
    private buildEntityContextSnapshot(
        context: CallContext,
    ): Record<string, unknown> {
        return {
            participants: context.participants.map((p) => ({
                name: p.name,
                role: p.role,
            })),
            entities: context.entityContext.map((e) => ({
                type: e.type,
                name: e.name,
            })),
            call_title: context.call.title,
        };
    }

    private async downloadRecording(url: string): Promise<Buffer> {
        const response = await fetch(url, {
            signal: AbortSignal.timeout(300_000),
        });

        if (!response.ok) {
            throw new Error(`Failed to download recording: HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    /**
     * Extract audio from video using FFmpeg (for files > 25MB).
     */
    private async extractAudioWithFfmpeg(videoBuffer: Buffer): Promise<Buffer> {
        const inputPath = join(tmpdir(), `input-${randomUUID()}.mp4`);
        const outputPath = join(tmpdir(), `output-${randomUUID()}.mp3`);

        try {
            await writeFile(inputPath, videoBuffer);

            await new Promise<void>((resolve, reject) => {
                const proc = spawn('ffmpeg', [
                    '-i', inputPath,
                    '-vn', '-acodec', 'libmp3lame',
                    '-ab', '64k', '-ar', '16000',
                    '-y', outputPath,
                ]);

                let stderr = '';
                proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
                proc.on('close', (code) => {
                    if (code === 0) resolve();
                    else reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-500)}`));
                });
                proc.on('error', reject);
            });

            return await readFile(outputPath);
        } finally {
            await unlink(inputPath).catch(() => {});
            await unlink(outputPath).catch(() => {});
        }
    }

    private async callWhisperApi(
        audioBuffer: Buffer,
        filename: string,
    ): Promise<{ text: string; language: string; segments: WhisperSegment[] }> {
        if (!this.openaiApiKey) throw new Error('OPENAI_API_KEY not configured');

        const formData = new FormData();
        const blob = new Blob([audioBuffer]);
        formData.append('file', blob, filename);
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'verbose_json');
        formData.append('timestamp_granularities[]', 'segment');

        const MAX_RETRIES = 2;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }

            const response = await fetch(
                'https://api.openai.com/v1/audio/transcriptions',
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${this.openaiApiKey}` },
                    body: formData,
                    signal: AbortSignal.timeout(600_000),
                },
            );

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                lastError = new Error(`Whisper API error: ${response.status} ${errorText}`);
                if (response.status === 429 || response.status >= 500) continue;
                throw lastError;
            }

            const data: any = await response.json();
            return {
                text: data.text || '',
                language: data.language || 'en',
                segments: (data.segments || []).map((s: any) => ({
                    start: s.start,
                    end: s.end,
                    text: s.text?.trim() || '',
                })),
            };
        }

        throw lastError || new Error('Whisper request failed after retries');
    }

    /**
     * Call AI for summarization (provider-agnostic via shared AI client).
     */
    private async callOpenAI(systemPrompt: string, userPrompt: string) {
        if (!this.aiClient) throw new Error('AI client is not configured');

        const messages = [
            { role: 'system' as const, content: systemPrompt },
            { role: 'user' as const, content: userPrompt },
        ];

        const result = await this.aiClient.chatCompletion('call_summarization', messages);

        this.logger.info(
            { model: result.model, tokens: result.inputTokens + result.outputTokens },
            'Call summary generated',
        );

        return result;
    }

    /**
     * Map Whisper segments to speaker labels using participant names.
     * Alternates speakers on gaps > 1 second.
     */
    private mapSegmentsToSpeakers(
        segments: WhisperSegment[],
        participants: Array<{ name: string; role: string }>,
    ): Array<{ start: number; end: number; text: string; speaker: string }> {
        // Use participant names in order; first participant = first speaker
        const speakerNames = participants.length > 0
            ? participants.map((p) => p.name)
            : ['Speaker 1', 'Speaker 2'];

        let currentIndex = 0;

        return segments.map((seg, i) => {
            if (i > 0) {
                const gap = seg.start - segments[i - 1].end;
                if (gap > 1.0) {
                    currentIndex = (currentIndex + 1) % speakerNames.length;
                }
            }

            return {
                start: seg.start,
                end: seg.end,
                text: seg.text,
                speaker: speakerNames[currentIndex] || 'Unknown',
            };
        });
    }
}
