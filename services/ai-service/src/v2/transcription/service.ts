/**
 * Transcription Pipeline Service
 * Orchestrates: download recording -> transcribe via Whisper -> summarize via GPT -> post note.
 */

import { spawn } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, unlink, readFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { Logger } from '@splits-network/shared-logging';
import { IEventPublisher } from '../shared/events';
import { TranscriptionRepository } from './repository';
import { SummaryService } from './summarizer';

interface RecordingEvent {
    interview_id: string;
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

export class TranscriptionPipelineService {
    constructor(
        private repository: TranscriptionRepository,
        private summaryService: SummaryService,
        private eventPublisher: IEventPublisher | undefined,
        private logger: Logger,
    ) {}

    /**
     * Full pipeline: download -> transcribe -> summarize -> post note.
     * On failure, sets status to 'failed' and does NOT rethrow.
     */
    async processRecording(event: RecordingEvent): Promise<void> {
        const { interview_id } = event;
        const startTime = Date.now();

        try {
            // Step 1: Set initial status
            await this.repository.updatePipelineStatus(interview_id, 'pending');

            // Step 2: Get interview context
            const context =
                await this.repository.getInterviewWithContext(interview_id);

            // Step 3: Transcribe
            await this.repository.updatePipelineStatus(
                interview_id,
                'transcribing',
            );
            const signedUrl =
                await this.repository.getRecordingSignedUrl(interview_id);
            const audioBuffer = await this.downloadRecording(signedUrl);

            let transcriptionBuffer: Buffer;
            let filename: string;

            if (event.file_size_bytes > WHISPER_SIZE_LIMIT) {
                this.logger.info(
                    {
                        interview_id,
                        file_size: event.file_size_bytes,
                    },
                    'File exceeds 25MB, extracting audio via FFmpeg',
                );
                transcriptionBuffer =
                    await this.extractAudioWithFfmpeg(audioBuffer);
                filename = 'audio.mp3';
            } else {
                transcriptionBuffer = audioBuffer;
                filename = 'recording.mp4';
            }

            const whisperResult =
                await this.callWhisperApi(transcriptionBuffer, filename);

            // Map segments with speaker labels
            const segments = this.mapSegmentsToSpeakers(
                whisperResult.segments || [],
                context.participants,
            );

            const processingTimeMs = Date.now() - startTime;

            // Step 4: Save transcript
            await this.repository.saveTranscript({
                interview_id,
                full_text: whisperResult.text,
                segments,
                language: whisperResult.language || 'en',
                whisper_model: 'whisper-1',
                processing_time_ms: processingTimeMs,
            });

            // Step 5: Summarize
            await this.repository.updatePipelineStatus(
                interview_id,
                'summarizing',
            );
            const summary = await this.summaryService.generateSummary(
                whisperResult.text,
                context.job.title,
                context.job.description,
                context.participants,
            );

            // Step 6: Post summary note
            await this.repository.updatePipelineStatus(
                interview_id,
                'posting',
            );
            await this.repository.postSummaryNote({
                application_id: context.application_id,
                message_text: summary,
                created_by_user_id: context.interview.created_by,
            });

            // Step 7: Complete
            await this.repository.updatePipelineStatus(
                interview_id,
                'complete',
            );

            this.logger.info(
                {
                    interview_id,
                    processing_time_ms: Date.now() - startTime,
                    transcript_length: whisperResult.text.length,
                    segments_count: segments.length,
                },
                'Transcription pipeline completed',
            );

            // Step 8: Publish event (non-critical)
            if (this.eventPublisher) {
                try {
                    await this.eventPublisher.publish(
                        'interview.transcript_ready',
                        {
                            interview_id,
                            application_id: context.application_id,
                            transcript_length: whisperResult.text.length,
                            segments_count: segments.length,
                        },
                    );
                } catch {
                    // Event publish failure is non-critical
                }
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            this.logger.error(
                { error, interview_id },
                'Transcription pipeline failed',
            );

            try {
                await this.repository.updatePipelineStatus(
                    interview_id,
                    'failed',
                    errorMessage,
                );
            } catch (statusErr) {
                this.logger.error(
                    { statusErr, interview_id },
                    'Failed to update pipeline status to failed',
                );
            }
        }
    }

    private async downloadRecording(url: string): Promise<Buffer> {
        const response = await fetch(url, {
            signal: AbortSignal.timeout(300_000),
        });

        if (!response.ok) {
            throw new Error(
                `Failed to download recording: HTTP ${response.status}`,
            );
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    /**
     * Extract audio from video using FFmpeg (for files > 25MB).
     * Writes to temp file, spawns FFmpeg, reads output.
     */
    private async extractAudioWithFfmpeg(videoBuffer: Buffer): Promise<Buffer> {
        const inputPath = join(tmpdir(), `input-${randomUUID()}.mp4`);
        const outputPath = join(tmpdir(), `output-${randomUUID()}.mp3`);

        try {
            await writeFile(inputPath, videoBuffer);

            await new Promise<void>((resolve, reject) => {
                const proc = spawn('ffmpeg', [
                    '-i',
                    inputPath,
                    '-vn',
                    '-acodec',
                    'libmp3lame',
                    '-ab',
                    '64k',
                    '-ar',
                    '16000',
                    '-y',
                    outputPath,
                ]);

                let stderr = '';
                proc.stderr.on('data', (chunk) => {
                    stderr += chunk.toString();
                });
                proc.on('close', (code) => {
                    if (code === 0) resolve();
                    else
                        reject(
                            new Error(
                                `FFmpeg exited with code ${code}: ${stderr.slice(-500)}`,
                            ),
                        );
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
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

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
                const delayMs = Math.min(
                    1000 * Math.pow(2, attempt - 1),
                    8000,
                );
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }

            const response = await fetch(
                'https://api.openai.com/v1/audio/transcriptions',
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${apiKey}` },
                    body: formData,
                    signal: AbortSignal.timeout(600_000), // 10 min for long recordings
                },
            );

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                lastError = new Error(
                    `Whisper API error: ${response.status} ${errorText}`,
                );

                if (response.status === 429 || response.status >= 500) {
                    continue;
                }
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
     * Map Whisper segments to speaker labels.
     * Uses a simple alternating heuristic based on segment gaps,
     * defaulting the first speaker to the interviewer.
     */
    private mapSegmentsToSpeakers(
        segments: WhisperSegment[],
        participants: Array<{ name: string; role: string }>,
    ): Array<{ start: number; end: number; text: string; speaker: string }> {
        const interviewer = participants.find((p) => p.role === 'interviewer');
        const candidate = participants.find((p) => p.role === 'candidate');

        const interviewerName = interviewer?.name || 'Interviewer';
        const candidateName = candidate?.name || 'Candidate';

        // Simple heuristic: detect speaker changes by gaps > 1 second
        let currentSpeaker = interviewerName;

        return segments.map((seg, i) => {
            if (i > 0) {
                const gap = seg.start - segments[i - 1].end;
                if (gap > 1.0) {
                    currentSpeaker =
                        currentSpeaker === interviewerName
                            ? candidateName
                            : interviewerName;
                }
            }

            return {
                start: seg.start,
                end: seg.end,
                text: seg.text,
                speaker: currentSpeaker,
            };
        });
    }
}
