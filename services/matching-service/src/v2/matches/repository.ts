import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CandidateRoleMatch, MatchListFilters, MatchUpsert } from './types';

export class MatchRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    private mapRow(row: any): CandidateRoleMatch {
        return {
            id: row.id,
            candidate_id: row.candidate_id,
            job_id: row.job_id,
            match_score: Number(row.match_score),
            rule_score: Number(row.rule_score),
            skills_score: Number(row.skills_score),
            ai_score: row.ai_score != null ? Number(row.ai_score) : null,
            match_factors: row.match_factors || {},
            match_tier: row.match_tier,
            status: row.status,
            generated_at: row.generated_at,
            generated_by: row.generated_by,
            dismissed_by: row.dismissed_by,
            dismissed_at: row.dismissed_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    async upsertMatch(data: MatchUpsert): Promise<CandidateRoleMatch> {
        const { data: row, error } = await this.supabase
            .from('candidate_role_matches')
            .upsert(
                {
                    candidate_id: data.candidate_id,
                    job_id: data.job_id,
                    match_score: data.match_score,
                    rule_score: data.rule_score,
                    skills_score: data.skills_score,
                    ai_score: data.ai_score ?? null,
                    match_factors: data.match_factors,
                    match_tier: data.match_tier,
                    generated_at: new Date().toISOString(),
                    generated_by: data.generated_by || 'system',
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'candidate_id,job_id' },
            )
            .select()
            .single();

        if (error) throw error;
        return this.mapRow(row);
    }

    async findMatches(filters: MatchListFilters): Promise<{ data: CandidateRoleMatch[]; total: number }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase.from('candidate_role_matches').select('*', { count: 'exact' });
        query = this.applyFilters(query, filters);

        const { data, error, count } = await query
            .order('match_score', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { data: (data || []).map(r => this.mapRow(r)), total: count || 0 };
    }

    async findMatchesForRecruiter(
        recruiterId: string,
        filters: MatchListFilters,
        tierLimit?: 'standard',
    ): Promise<{ data: CandidateRoleMatch[]; total: number }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('candidate_role_matches')
            .select('*, jobs!inner(job_owner_recruiter_id)', { count: 'exact' })
            .eq('jobs.job_owner_recruiter_id', recruiterId);

        if (tierLimit) query = query.eq('match_tier', tierLimit);
        query = this.applyFilters(query, filters);

        const { data, error, count } = await query
            .order('match_score', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { data: (data || []).map(r => this.mapRow(r)), total: count || 0 };
    }

    async findMatchesForCandidate(
        candidateId: string,
        filters: MatchListFilters,
    ): Promise<{ data: CandidateRoleMatch[]; total: number }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('candidate_role_matches')
            .select('*', { count: 'exact' })
            .eq('candidate_id', candidateId)
            .eq('match_tier', 'standard');

        query = this.applyFilters(query, filters);

        const { data, error, count } = await query
            .order('match_score', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { data: (data || []).map(r => this.mapRow(r)), total: count || 0 };
    }

    async findById(id: string): Promise<CandidateRoleMatch | null> {
        const { data, error } = await this.supabase
            .from('candidate_role_matches')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? this.mapRow(data) : null;
    }

    async updateMatch(id: string, updates: Partial<CandidateRoleMatch>): Promise<CandidateRoleMatch> {
        const { data, error } = await this.supabase
            .from('candidate_role_matches')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapRow(data);
    }

    private applyFilters(query: any, filters: MatchListFilters): any {
        if (filters.candidate_id) query = query.eq('candidate_id', filters.candidate_id);
        if (filters.job_id) query = query.eq('job_id', filters.job_id);
        if (filters.match_tier) query = query.eq('match_tier', filters.match_tier);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.min_score) query = query.gte('match_score', filters.min_score);
        return query;
    }
}
