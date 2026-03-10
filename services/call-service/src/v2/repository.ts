import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StandardListParams, StandardListResponse, buildPaginationResponse } from '@splits-network/shared-types';
import {
    Call,
    CallStatus,
    CallEntityLink,
    CallParticipant,
    CallWithParticipants,
    CallDetail,
    CreateCallInput,
    UpdateCallInput,
    CallListFilters,
} from './types';
import { ParticipantRepository } from './participant-repository';
import { ArtifactRepository } from './artifact-repository';
import { StatsRepository } from './stats-repository';
import { resolveCallIdFilters } from './list-helpers';

export class CallRepository {
    private supabase: SupabaseClient;
    readonly participants: ParticipantRepository;
    readonly artifacts: ArtifactRepository;
    readonly stats: StatsRepository;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.participants = new ParticipantRepository(this.supabase);
        this.artifacts = new ArtifactRepository(this.supabase);
        this.stats = new StatsRepository(this.supabase);
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    // ── Call CRUD ──────────────────────────────────────────────────────────

    async listCalls(
        params: StandardListParams,
        filters: CallListFilters,
    ): Promise<StandardListResponse<CallWithParticipants>> {
        const page = params.page || 1;
        const limit = params.limit || 25;
        const offset = (page - 1) * limit;
        const sortBy = params.sort_by || 'created_at';
        const sortOrder = params.sort_order || 'desc';

        // Pre-filter call IDs from related tables (entity, tag, search)
        const filteredCallIds = await resolveCallIdFilters(this.supabase, filters);
        if (filteredCallIds !== null && filteredCallIds.length === 0) {
            return { data: [], pagination: buildPaginationResponse(page, limit, 0) };
        }

        // Count query
        let countQuery = this.supabase
            .from('calls')
            .select('id', { count: 'exact', head: true })
            .is('deleted_at', null);

        if (filters.call_type) countQuery = countQuery.eq('call_type', filters.call_type);
        if (filters.status) countQuery = countQuery.eq('status', filters.status);
        if (filters.date_from) countQuery = countQuery.gte('scheduled_at', filters.date_from);
        if (filters.date_to) countQuery = countQuery.lte('scheduled_at', filters.date_to);
        if (filters.needs_follow_up) countQuery = countQuery.eq('needs_follow_up', true);
        if (filteredCallIds) countQuery = countQuery.in('id', filteredCallIds);

        const { count, error: countError } = await countQuery;
        if (countError) throw countError;
        const total = count || 0;

        // Data query
        let dataQuery = this.supabase
            .from('calls')
            .select('*')
            .is('deleted_at', null)
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(offset, offset + limit - 1);

        if (filters.call_type) dataQuery = dataQuery.eq('call_type', filters.call_type);
        if (filters.status) dataQuery = dataQuery.eq('status', filters.status);
        if (filters.date_from) dataQuery = dataQuery.gte('scheduled_at', filters.date_from);
        if (filters.date_to) dataQuery = dataQuery.lte('scheduled_at', filters.date_to);
        if (filters.needs_follow_up) dataQuery = dataQuery.eq('needs_follow_up', true);
        if (filteredCallIds) dataQuery = dataQuery.in('id', filteredCallIds);

        const { data: calls, error: dataError } = await dataQuery;
        if (dataError) throw dataError;
        if (!calls || calls.length === 0) {
            return { data: [], pagination: buildPaginationResponse(page, limit, total) };
        }

        const callIds = calls.map((c: Call) => c.id);
        const enriched = await this.enrichCallsWithRelations(callIds, calls as Call[]);

        return {
            data: enriched,
            pagination: buildPaginationResponse(page, limit, total),
        };
    }

    async getCall(id: string): Promise<Call | null> {
        const { data, error } = await this.supabase
            .from('calls')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle();

        if (error) throw error;
        return data as Call | null;
    }

    async getCallDetail(id: string, include?: string[]): Promise<CallDetail | null> {
        const call = await this.getCall(id);
        if (!call) return null;

        const [participants, entityLinks] = await Promise.all([
            this.participants.getCallParticipants(id),
            this.artifacts.getCallEntityLinks(id),
        ]);

        // Look up call_type metadata for recording consent
        const { data: callTypeRow } = await this.supabase
            .from('call_types')
            .select('requires_recording_consent')
            .eq('slug', call.call_type)
            .maybeSingle();

        const detail: CallDetail = {
            ...call,
            participants,
            entity_links: entityLinks,
            recording_consent_required: callTypeRow?.requires_recording_consent ?? true,
        };

        if (!include || include.length === 0) return detail;

        const promises: Promise<void>[] = [];

        if (include.includes('recordings')) {
            promises.push((async () => {
                const { data, error } = await this.supabase
                    .from('call_recordings').select('*').eq('call_id', id)
                    .order('created_at', { ascending: true });
                if (error) throw error;
                detail.recordings = data || [];
            })());
        }
        if (include.includes('transcript')) {
            promises.push((async () => {
                const { data, error } = await this.supabase
                    .from('call_transcripts').select('*').eq('call_id', id)
                    .order('created_at', { ascending: false }).limit(1).maybeSingle();
                if (error) throw error;
                detail.transcript = data || null;
            })());
        }
        if (include.includes('summary')) {
            promises.push((async () => {
                const { data, error } = await this.supabase
                    .from('call_summaries').select('*').eq('call_id', id).maybeSingle();
                if (error) throw error;
                detail.summary = data || null;
            })());
        }
        if (include.includes('notes')) {
            promises.push((async () => {
                detail.notes = await this.artifacts.getCallNotes(id);
            })());
        }

        await Promise.all(promises);
        return detail;
    }

    async createCall(input: CreateCallInput, createdBy: string): Promise<Call> {
        const { data, error } = await this.supabase
            .from('calls')
            .insert({
                call_type: input.call_type,
                title: input.title || null,
                scheduled_at: input.scheduled_at || null,
                agenda: input.agenda || null,
                duration_minutes_planned: input.duration_minutes_planned || null,
                pre_call_notes: input.pre_call_notes || null,
                created_by: createdBy,
            })
            .select()
            .single();

        if (error) throw error;
        return data as Call;
    }

    async updateCall(id: string, input: UpdateCallInput): Promise<Call> {
        const { data, error } = await this.supabase
            .from('calls')
            .update({ ...input, updated_at: new Date().toISOString() })
            .eq('id', id)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;
        return data as Call;
    }

    async deleteCall(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('calls')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    async updateCallStatus(
        id: string,
        status: CallStatus,
        extraFields?: Partial<Pick<Call, 'started_at' | 'ended_at' | 'duration_minutes' | 'livekit_room_name'>>,
    ): Promise<Call> {
        const updates: Record<string, unknown> = {
            status, updated_at: new Date().toISOString(), ...extraFields,
        };

        const { data, error } = await this.supabase
            .from('calls').update(updates).eq('id', id).select().single();

        if (error) throw error;
        return data as Call;
    }

    async cancelCall(
        id: string,
        cancelledBy: string,
        cancelReason?: string,
    ): Promise<Call> {
        const updates: Record<string, unknown> = {
            status: 'cancelled',
            cancelled_by: cancelledBy,
            cancel_reason: cancelReason || null,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await this.supabase
            .from('calls')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Call;
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    async resolveUserId(clerkUserId: string): Promise<string | null> {
        const { data, error } = await this.supabase
            .from('users')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .maybeSingle();

        if (error) throw error;
        return data?.id || null;
    }

    // ── Private ───────────────────────────────────────────────────────────

    private async enrichCallsWithRelations(
        callIds: string[],
        calls: Call[],
    ): Promise<CallWithParticipants[]> {
        const [participantsResult, linksResult] = await Promise.all([
            this.supabase.from('call_participants').select('*')
                .in('call_id', callIds).order('created_at', { ascending: true }),
            this.supabase.from('call_entity_links').select('*').in('call_id', callIds),
        ]);

        if (participantsResult.error) throw participantsResult.error;
        if (linksResult.error) throw linksResult.error;

        const userIds = [...new Set(
            (participantsResult.data || []).map((p: CallParticipant) => p.user_id),
        )];
        const userMap = new Map<string, {
            first_name: string; last_name: string; avatar_url: string | null; email: string;
        }>();

        if (userIds.length > 0) {
            const { data: users, error: userError } = await this.supabase
                .from('users').select('id, first_name, last_name, profile_image_url, email')
                .in('id', userIds);

            if (userError) throw userError;
            for (const u of users || []) {
                userMap.set(u.id, {
                    first_name: u.first_name || '', last_name: u.last_name || '',
                    avatar_url: u.profile_image_url || null, email: u.email || '',
                });
            }
        }

        const defaultUser = { first_name: '', last_name: '', avatar_url: null, email: '' };

        return calls.map((call) => ({
            ...call,
            participants: (participantsResult.data || [])
                .filter((p: CallParticipant) => p.call_id === call.id)
                .map((p: CallParticipant) => ({
                    ...p, user: userMap.get(p.user_id) || defaultUser,
                })),
            entity_links: (linksResult.data || [])
                .filter((l: CallEntityLink) => l.call_id === call.id) as CallEntityLink[],
        }));
    }
}
