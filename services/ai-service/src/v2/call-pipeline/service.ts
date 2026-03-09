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
import { IEventPublisher } from '../shared/events';
import { CallPipelineRepository, CallContext } from './repository';
import { getPromptForCallType, PROMPT_VERSIONS } from './prompt-templates';

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
    private model: string;

    constructor(
        private repository: CallPipelineRepository,
        private eventPublisher: IEventPublisher | undefined,
        private logger: Logger,
    ) {
        this.openaiApiKey = process.env.OPENAI_API_KEY || '';
        this.model = process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini';
    }

    /**
     * Full pipeline: download -> transcribe -> summarize -> store.
     * On failure, sets status to 'failed' and does NOT rethrow.
     */
    async processRecording(event: CallRecordingEvent): Promise<void> {
        const { call_id } = event;
        const startTime = Date.now();

        try {
            // Step 1: Set initial status
            await this.repository.updatePipelineStatus(call_id, 'transcribing');

            // Step 2: Get call context for prompt injection
            const context = await this.repository.getCallWithContext(call_id);

            // Step 3: Download and transcribe
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

            // Step 5: Summarize
            await this.repository.updatePipelineStatus(call_id, 'summarizing');

            const { systemPrompt, userPrompt } = getPromptForCallType(
                context.callType,
                context,
                whisperResult.text,
            );

            const summaryText = await this.callOpenAI(systemPrompt, userPrompt);

            // Step 6: Build and save structured summary
            const summaryData = {
                tldr: this.extractTldr(summaryText),
                content: summaryText,
                call_type: context.callType,
                prompt_version: PROMPT_VERSIONS[context.callType] || 'unknown',
                model: this.model,
                action_items: this.extractActionItems(summaryText),
                entity_context: this.buildEntityContextSnapshot(context),
            };

            await this.repository.saveSummary(call_id, summaryData, this.model);

            // Step 7: Complete
            await this.repository.updatePipelineStatus(call_id, 'complete');

            this.logger.info(
                {
                    call_id,
                    call_type: context.callType,
                    processing_time_ms: Date.now() - startTime,
                    transcript_length: whisperResult.text.length,
                    segments_count: segments.length,
                    has_action_items: !!summaryData.action_items?.length,
                },
                'Call pipeline completed',
            );

            // Step 8: Publish event (non-critical)
            if (this.eventPublisher) {
                try {
                    await this.eventPublisher.publish('call.summary_ready', {
                        call_id,
                        call_type: context.callType,
                        has_action_items: !!summaryData.action_items?.length,
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
     * Call OpenAI chat completion for summarization.
     */
    private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
        if (!this.openaiApiKey) throw new Error('OPENAI_API_KEY not configured');

        const body = JSON.stringify({
            model: this.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 1500,
        });

        const MAX_RETRIES = 2;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
                this.logger.info({ attempt }, 'Retrying summary generation');
            }

            const response = await fetch(
                'https://api.openai.com/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.openaiApiKey}`,
                    },
                    body,
                    signal: AbortSignal.timeout(60_000),
                },
            );

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                lastError = new Error(`OpenAI API error: ${response.status} ${errorText}`);
                if (response.status === 429 || response.status >= 500) continue;
                throw lastError;
            }

            let data: any;
            try {
                data = await response.json();
            } catch {
                lastError = new Error('OpenAI returned invalid JSON');
                continue;
            }

            const content = data?.choices?.[0]?.message?.content;
            if (!content) {
                lastError = new Error('OpenAI response missing content');
                continue;
            }

            this.logger.info(
                { model: this.model, tokens: data.usage?.total_tokens },
                'Call summary generated',
            );
            return content;
        }

        throw lastError || new Error('Summary generation failed after retries');
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
