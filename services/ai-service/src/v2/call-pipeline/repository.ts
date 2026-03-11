/**
 * Call Pipeline Repository
 * DB operations for the generalized call AI pipeline:
 * call context fetching, transcript storage, summary storage, pipeline status.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';

const RECORDING_BUCKET = 'call-recordings';

export interface CallContext {
    call: {
        id: string;
        call_type: string;
        title: string | null;
        agenda: string | null;
        created_by: string;
        status: string;
    };
    participants: Array<{ name: string; role: string }>;
    entityContext: Array<{
        type: string;
        name: string;
        details: Record<string, string>;
    }>;
    callType: string;
}

interface SaveTranscriptInput {
    callId: string;
    fullText: string;
    segments: Array<{ start: number; end: number; text: string; speaker: string }>;
    language: string;
    whisperModel: string;
    processingTimeMs: number;
}

interface SummaryData {
    tldr: string;
    content: string;
    call_type: string;
    prompt_version: string;
    model: string;
    action_items?: string[];
    entity_context?: Record<string, unknown>;
}

export class CallPipelineRepository {
    constructor(
        private supabase: SupabaseClient,
        private logger: Logger,
    ) {}

    /**
     * Get per-call recording and AI flags, plus the call creator's user ID.
     * Returns null if the call is not found.
     */
    async getCallFlags(callId: string): Promise<{
        recording_enabled: boolean;
        transcription_enabled: boolean;
        ai_analysis_enabled: boolean;
        created_by: string;
    } | null> {
        const { data, error } = await this.supabase
            .from('calls')
            .select('recording_enabled, transcription_enabled, ai_analysis_enabled, created_by')
            .eq('id', callId)
            .maybeSingle();

        if (error) {
            throw new Error(`Failed to fetch call flags for ${callId}: ${error.message}`);
        }

        return data ?? null;
    }

    /**
     * Get the current subscription tier for a user.
     * Defaults to 'starter' if no active subscription is found.
     */
    async getCreatorTier(userId: string): Promise<'starter' | 'pro' | 'partner'> {
        const { data: sub, error } = await this.supabase
            .from('subscriptions')
            .select('plan:plans(tier)')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            throw new Error(`Failed to fetch creator tier for user ${userId}: ${error.message}`);
        }

        return (sub?.plan as any)?.tier || 'starter';
    }

    /**
     * Fetch call with full context for prompt injection:
     * participants, entity links, and entity details.
     */
    async getCallWithContext(callId: string): Promise<CallContext> {
        // 1. Get call
        const { data: call, error: callErr } = await this.supabase
            .from('calls')
            .select('id, call_type, title, agenda, created_by, status')
            .eq('id', callId)
            .single();

        if (callErr || !call) {
            throw new Error(`Call ${callId} not found: ${callErr?.message}`);
        }

        // 2. Get participants with user names
        const { data: participants, error: partErr } = await this.supabase
            .from('call_participants')
            .select('user_id, role')
            .eq('call_id', callId);

        if (partErr) throw partErr;

        const userIds = (participants || []).map((p: any) => p.user_id);
        const userMap = new Map<string, string>();

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

        // 3. Get entity links
        const { data: entityLinks, error: linkErr } = await this.supabase
            .from('call_entity_links')
            .select('entity_type, entity_id')
            .eq('call_id', callId);

        if (linkErr) throw linkErr;

        // 4. Resolve entity context for each link
        const entityContext = await this.resolveEntityContext(entityLinks || []);

        return {
            call: {
                id: call.id,
                call_type: call.call_type,
                title: call.title,
                agenda: call.agenda,
                created_by: call.created_by,
                status: call.status,
            },
            participants: enrichedParticipants,
            entityContext,
            callType: call.call_type,
        };
    }

    /**
     * Get a signed download URL for the first ready recording.
     */
    async getRecordingSignedUrl(callId: string): Promise<string> {
        const { data: recording, error: recErr } = await this.supabase
            .from('call_recordings')
            .select('blob_url')
            .eq('call_id', callId)
            .eq('recording_status', 'ready')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (recErr || !recording?.blob_url) {
            throw new Error(`No ready recording for call ${callId}`);
        }

        const storagePath = this.extractStoragePath(recording.blob_url);

        const { data, error } = await this.supabase.storage
            .from(RECORDING_BUCKET)
            .createSignedUrl(storagePath, 3600);

        if (error || !data?.signedUrl) {
            throw new Error(`Failed to generate signed URL: ${error?.message}`);
        }

        return data.signedUrl;
    }

    /**
     * Update pipeline status by upserting transcript/summary rows.
     */
    async updatePipelineStatus(
        callId: string,
        step: 'transcribing' | 'summarizing' | 'complete' | 'failed',
        error?: string,
    ): Promise<void> {
        const now = new Date().toISOString();

        switch (step) {
            case 'transcribing': {
                await this.supabase
                    .from('call_transcripts')
                    .upsert({
                        call_id: callId,
                        transcript_status: 'processing',
                        storage_url: '',
                        updated_at: now,
                    }, { onConflict: 'call_id' });
                break;
            }
            case 'summarizing': {
                await this.supabase
                    .from('call_summaries')
                    .upsert({
                        call_id: callId,
                        summary_status: 'processing',
                        summary: {},
                        updated_at: now,
                    }, { onConflict: 'call_id' });
                break;
            }
            case 'complete': {
                await this.supabase
                    .from('call_transcripts')
                    .update({ transcript_status: 'ready', updated_at: now })
                    .eq('call_id', callId);

                await this.supabase
                    .from('call_summaries')
                    .update({ summary_status: 'ready', updated_at: now })
                    .eq('call_id', callId);
                break;
            }
            case 'failed': {
                // Update whichever row exists with the error
                await this.supabase
                    .from('call_transcripts')
                    .update({
                        transcript_status: 'failed',
                        error: error || 'Unknown error',
                        updated_at: now,
                    })
                    .eq('call_id', callId)
                    .eq('transcript_status', 'processing');

                await this.supabase
                    .from('call_summaries')
                    .update({
                        summary_status: 'failed',
                        error: error || 'Unknown error',
                        updated_at: now,
                    })
                    .eq('call_id', callId)
                    .eq('summary_status', 'processing');
                break;
            }
        }

        this.logger.info({ callId, step }, 'Call pipeline status updated');
    }

    /**
     * Upload transcript JSON to storage, then upsert call_transcripts row.
     */
    async saveTranscript(input: SaveTranscriptInput): Promise<void> {
        const storagePath = `transcripts/calls/${input.callId}.json`;

        const transcriptJson = JSON.stringify({
            full_text: input.fullText,
            segments: input.segments,
            whisper_model: input.whisperModel,
            processing_time_ms: input.processingTimeMs,
        });

        const { error: uploadErr } = await this.supabase.storage
            .from(RECORDING_BUCKET)
            .upload(storagePath, transcriptJson, {
                contentType: 'application/json',
                upsert: true,
            });

        if (uploadErr) {
            throw new Error(`Failed to upload transcript: ${uploadErr.message}`);
        }

        const { error: dbErr } = await this.supabase
            .from('call_transcripts')
            .upsert({
                call_id: input.callId,
                storage_url: storagePath,
                transcript_status: 'ready',
                language: input.language,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'call_id' });

        if (dbErr) throw dbErr;

        this.logger.info({ callId: input.callId }, 'Call transcript saved');
    }

    /**
     * Upsert call_summaries row with structured JSONB summary.
     */
    async saveSummary(
        callId: string,
        summaryData: SummaryData,
        model: string,
    ): Promise<void> {
        const { error } = await this.supabase
            .from('call_summaries')
            .upsert({
                call_id: callId,
                summary: summaryData,
                summary_status: 'ready',
                model,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'call_id' });

        if (error) throw error;

        this.logger.info({ callId, model }, 'Call summary saved');
    }

    /**
     * Resolve entity context for prompt injection.
     */
    private async resolveEntityContext(
        links: Array<{ entity_type: string; entity_id: string }>,
    ): Promise<CallContext['entityContext']> {
        const results: CallContext['entityContext'] = [];

        for (const link of links) {
            try {
                const context = await this.resolveEntity(link.entity_type, link.entity_id);
                if (context) results.push(context);
            } catch (err) {
                this.logger.warn(
                    { entity_type: link.entity_type, entity_id: link.entity_id, err },
                    'Failed to resolve entity context',
                );
            }
        }

        return results;
    }

    private async resolveEntity(
        entityType: string,
        entityId: string,
    ): Promise<CallContext['entityContext'][0] | null> {
        switch (entityType) {
            case 'application': {
                const { data: app } = await this.supabase
                    .from('applications')
                    .select('id, job_id, candidate_id')
                    .eq('id', entityId)
                    .maybeSingle();

                if (!app) return null;

                const details: Record<string, string> = {};

                if (app.job_id) {
                    const { data: job } = await this.supabase
                        .from('jobs')
                        .select('title, company_id')
                        .eq('id', app.job_id)
                        .maybeSingle();

                    if (job) {
                        details.job_title = job.title || 'Unknown';
                        if (job.company_id) {
                            const { data: company } = await this.supabase
                                .from('companies')
                                .select('name')
                                .eq('id', job.company_id)
                                .maybeSingle();
                            if (company) details.company_name = company.name;
                        }
                    }
                }

                if (app.candidate_id) {
                    const { data: candidate } = await this.supabase
                        .from('candidates')
                        .select('first_name, last_name')
                        .eq('id', app.candidate_id)
                        .maybeSingle();
                    if (candidate) {
                        details.candidate_name =
                            `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim();
                    }
                }

                return {
                    type: 'application',
                    name: details.candidate_name || 'Application',
                    details,
                };
            }

            case 'job': {
                const { data: job } = await this.supabase
                    .from('jobs')
                    .select('title, company_id')
                    .eq('id', entityId)
                    .maybeSingle();

                if (!job) return null;

                const details: Record<string, string> = {
                    job_title: job.title || 'Unknown',
                };

                if (job.company_id) {
                    const { data: company } = await this.supabase
                        .from('companies')
                        .select('name')
                        .eq('id', job.company_id)
                        .maybeSingle();
                    if (company) details.company_name = company.name;
                }

                return { type: 'job', name: job.title || 'Job', details };
            }

            case 'company': {
                const { data: company } = await this.supabase
                    .from('companies')
                    .select('name')
                    .eq('id', entityId)
                    .maybeSingle();

                return company
                    ? { type: 'company', name: company.name, details: { company_name: company.name } }
                    : null;
            }

            case 'candidate': {
                const { data: candidate } = await this.supabase
                    .from('candidates')
                    .select('first_name, last_name')
                    .eq('id', entityId)
                    .maybeSingle();

                if (!candidate) return null;
                const name = `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim();
                return { type: 'candidate', name, details: { candidate_name: name } };
            }

            case 'firm': {
                const { data: firm } = await this.supabase
                    .from('firms')
                    .select('name')
                    .eq('id', entityId)
                    .maybeSingle();

                return firm
                    ? { type: 'firm', name: firm.name, details: { firm_name: firm.name } }
                    : null;
            }

            default:
                return null;
        }
    }

    /**
     * Extract storage path from a blob URL or relative path.
     */
    private extractStoragePath(blobUrl: string): string {
        if (!blobUrl.startsWith('http')) return blobUrl;

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
