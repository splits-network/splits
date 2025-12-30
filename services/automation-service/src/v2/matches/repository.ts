import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CandidateJobMatch, MatchFilters, MatchUpdate } from '../types';

export interface CreateMatchInput {
    candidate_id: string;
    job_id: string;
    match_score: number;
    match_reason: string;
    skills_match?: Record<string, any>;
    experience_match?: Record<string, any>;
    location_match?: Record<string, any>;
    status?: CandidateJobMatch['status'];
}

export class CandidateMatchRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    private mapRow(row: any): CandidateJobMatch {
        return {
            id: row.id,
            candidate_id: row.candidate_id,
            job_id: row.job_id,
            match_score: row.match_score,
            match_reason: row.match_reason,
            skills_match: row.skills_match || {},
            experience_match: row.experience_match || {},
            location_match: row.location_match || {},
            status: row.status,
            reviewed_by: row.reviewed_by,
            reviewed_at: row.reviewed_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    async findMatches(filters: MatchFilters = {}): Promise<{
        data: CandidateJobMatch[];
        total: number;
    }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .schema('platform')
            .from('candidate_role_matches')
            .select('*', { count: 'exact' });

        if (filters.candidate_id) {
            query = query.eq('candidate_id', filters.candidate_id);
        }
        if (filters.job_id) {
            query = query.eq('job_id', filters.job_id);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (typeof filters.min_score === 'number') {
            query = query.gte('match_score', filters.min_score);
        }

        const { data, error, count } = await query
            .order('match_score', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return {
            data: (data || []).map((row) => this.mapRow(row)),
            total: count || 0,
        };
    }

    async findMatch(id: string): Promise<CandidateJobMatch | null> {
        const { data, error } = await this.supabase
            .schema('platform')
            .from('candidate_role_matches')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data ? this.mapRow(data) : null;
    }

    async createMatch(input: CreateMatchInput): Promise<CandidateJobMatch> {
        const { data, error } = await this.supabase
            .schema('platform')
            .from('candidate_role_matches')
            .insert({
                candidate_id: input.candidate_id,
                job_id: input.job_id,
                match_score: input.match_score,
                match_reason: input.match_reason,
                skills_match: input.skills_match || {},
                experience_match: input.experience_match || {},
                location_match: input.location_match || {},
                status: input.status || 'pending_review',
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async updateMatch(id: string, updates: MatchUpdate): Promise<CandidateJobMatch> {
        const payload: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (typeof updates.match_score !== 'undefined') {
            payload.match_score = updates.match_score;
        }
        if (typeof updates.match_reason !== 'undefined') {
            payload.match_reason = updates.match_reason;
        }
        if (typeof updates.skills_match !== 'undefined') {
            payload.skills_match = updates.skills_match;
        }
        if (typeof updates.experience_match !== 'undefined') {
            payload.experience_match = updates.experience_match;
        }
        if (typeof updates.location_match !== 'undefined') {
            payload.location_match = updates.location_match;
        }
        if (typeof updates.status !== 'undefined') {
            payload.status = updates.status;
        }
        if (typeof updates.reviewed_by !== 'undefined') {
            payload.reviewed_by = updates.reviewed_by;
            payload.reviewed_at = updates.reviewed_by ? new Date().toISOString() : null;
        }

        const { data, error } = await this.supabase
            .schema('platform')
            .from('candidate_role_matches')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async deleteMatch(id: string): Promise<void> {
        const { error } = await this.supabase
            .schema('platform')
            .from('candidate_role_matches')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    }
}
