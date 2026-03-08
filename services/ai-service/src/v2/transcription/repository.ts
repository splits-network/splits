/**
 * Transcription Repository
 * DB operations for the AI transcription pipeline:
 * interview context, transcript storage, pipeline status, summary posting.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';

const RECORDING_BUCKET = 'interview-recordings';

interface InterviewContext {
    interview: {
        id: string;
        application_id: string;
        recording_blob_url: string | null;
        created_by: string;
    };
    participants: Array<{ name: string; role: string }>;
    job: { title: string; description: string };
    application_id: string;
}

interface TranscriptSegment {
    start: number;
    end: number;
    text: string;
    speaker: string;
}

interface SaveTranscriptInput {
    interview_id: string;
    full_text: string;
    segments: TranscriptSegment[];
    language: string;
    whisper_model: string;
    processing_time_ms: number;
}

export class TranscriptionRepository {
    constructor(
        private supabase: SupabaseClient,
        private logger: Logger,
    ) {}

    /**
     * Fetch interview with participants (names + roles) and job context.
     */
    async getInterviewWithContext(interviewId: string): Promise<InterviewContext> {
        // 1. Get interview
        const { data: interview, error: intErr } = await this.supabase
            .from('interviews')
            .select('id, application_id, recording_blob_url, created_by')
            .eq('id', interviewId)
            .single();

        if (intErr || !interview) {
            throw new Error(`Interview ${interviewId} not found: ${intErr?.message}`);
        }

        // 2. Get participants with user names
        const { data: participants, error: partErr } = await this.supabase
            .from('interview_participants')
            .select('user_id, role')
            .eq('interview_id', interviewId);

        if (partErr) throw partErr;

        const userIds = (participants || []).map((p: any) => p.user_id);
        let userMap = new Map<string, string>();

        if (userIds.length > 0) {
            const { data: users, error: usersErr } = await this.supabase
                .from('users')
                .select('id, name')
                .in('id', userIds);

            if (usersErr) throw usersErr;
            for (const u of users || []) {
                userMap.set(u.id, u.name || 'Unknown');
            }
        }

        const enrichedParticipants = (participants || []).map((p: any) => ({
            name: userMap.get(p.user_id) || 'Unknown',
            role: p.role as string,
        }));

        // 3. Get job context via application
        const { data: application, error: appErr } = await this.supabase
            .from('applications')
            .select('id, job_id')
            .eq('id', interview.application_id)
            .single();

        if (appErr || !application) {
            throw new Error(`Application not found for interview ${interviewId}`);
        }

        let jobTitle = 'Unknown Position';
        let jobDescription = '';

        if (application.job_id) {
            const { data: job, error: jobErr } = await this.supabase
                .from('jobs')
                .select('title, description, recruiter_description')
                .eq('id', application.job_id)
                .maybeSingle();

            if (!jobErr && job) {
                jobTitle = job.title || 'Unknown Position';
                jobDescription = job.recruiter_description || job.description || '';
            }
        }

        return {
            interview: {
                id: interview.id,
                application_id: interview.application_id,
                recording_blob_url: interview.recording_blob_url,
                created_by: interview.created_by,
            },
            participants: enrichedParticipants,
            job: { title: jobTitle, description: jobDescription },
            application_id: interview.application_id,
        };
    }

    /**
     * Update pipeline status on the interviews row.
     */
    async updatePipelineStatus(
        interviewId: string,
        status: string,
        error?: string,
    ): Promise<void> {
        const updates: Record<string, any> = {
            transcript_status: status,
            updated_at: new Date().toISOString(),
        };
        if (error !== undefined) {
            updates.transcript_error = error;
        }

        const { error: dbErr } = await this.supabase
            .from('interviews')
            .update(updates)
            .eq('id', interviewId);

        if (dbErr) throw dbErr;
        this.logger.info({ interviewId, status }, 'Pipeline status updated');
    }

    /**
     * Save transcript to interview_transcripts table.
     */
    async saveTranscript(input: SaveTranscriptInput): Promise<any> {
        const { data, error } = await this.supabase
            .from('interview_transcripts')
            .insert({
                interview_id: input.interview_id,
                full_text: input.full_text,
                segments: input.segments,
                language: input.language,
                whisper_model: input.whisper_model,
                processing_time_ms: input.processing_time_ms,
            })
            .select()
            .single();

        if (error) throw error;
        this.logger.info({ interview_id: input.interview_id }, 'Transcript saved');
        return data;
    }

    /**
     * Post an AI-generated summary as an application note.
     * Uses the interview creator as the note author (valid FK).
     */
    async postSummaryNote(data: {
        application_id: string;
        message_text: string;
        created_by_user_id: string;
    }): Promise<void> {
        const { error } = await this.supabase
            .from('application_notes')
            .insert({
                application_id: data.application_id,
                created_by_user_id: data.created_by_user_id,
                created_by_type: 'platform_admin',
                note_type: 'interview_summary',
                message_text: data.message_text,
                visibility: 'shared',
            });

        if (error) throw error;
        this.logger.info({ application_id: data.application_id }, 'Summary note posted');
    }

    /**
     * Generate a signed download URL for the recording.
     * Extracts storage path from the blob URL stored on the interview.
     */
    async getRecordingSignedUrl(interviewId: string): Promise<string> {
        const { data: interview, error: intErr } = await this.supabase
            .from('interviews')
            .select('recording_blob_url')
            .eq('id', interviewId)
            .single();

        if (intErr || !interview?.recording_blob_url) {
            throw new Error(`No recording URL for interview ${interviewId}`);
        }

        const storagePath = this.extractStoragePath(interview.recording_blob_url);

        const { data, error } = await this.supabase.storage
            .from(RECORDING_BUCKET)
            .createSignedUrl(storagePath, 3600);

        if (error || !data?.signedUrl) {
            throw new Error(`Failed to generate signed URL: ${error?.message}`);
        }

        return data.signedUrl;
    }

    /**
     * Extract storage path from a blob URL or relative path.
     */
    private extractStoragePath(blobUrl: string): string {
        if (!blobUrl.startsWith('http')) {
            return blobUrl;
        }

        try {
            const parsed = new URL(blobUrl);
            const pathParts = parsed.pathname.split('/');
            const bucketIndex = pathParts.indexOf(RECORDING_BUCKET);
            if (bucketIndex !== -1) {
                return pathParts.slice(bucketIndex + 1).join('/');
            }
            return pathParts.slice(-3).join('/');
        } catch {
            return blobUrl;
        }
    }
}
