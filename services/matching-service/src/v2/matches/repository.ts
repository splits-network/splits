import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CandidateRoleMatch, EnrichedCandidateRoleMatch, MatchListFilters, MatchUpsert } from './types';

export class MatchRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    private readonly ENRICHED_SELECT = `
        *,
        candidates(id, full_name),
        jobs(id, title, location, salary_min, salary_max, employment_type, job_level, companies(id, name, logo_url))
    `;

    private mapRow(row: any): EnrichedCandidateRoleMatch {
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
            invited_by: row.invited_by ?? null,
            invited_at: row.invited_at ?? null,
            invite_status: row.invite_status ?? null,
            created_at: row.created_at,
            updated_at: row.updated_at,
            candidate: row.candidates ?? null,
            job: row.jobs ?? null,
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

    async findMatches(filters: MatchListFilters): Promise<{ data: EnrichedCandidateRoleMatch[]; total: number }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase.from('candidate_role_matches').select(this.ENRICHED_SELECT, { count: 'exact' });
        query = this.applyFilters(query, filters);

        const { data, error, count } = await query
            .order('match_score', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { data: (data || []).map(r => this.mapRow(r)), total: count || 0 };
    }

    async findMatchesForRecruiter(
        recruiterJobIds: string[],
        recruiterCandidateIds: string[],
        filters: MatchListFilters,
        tierLimit?: 'standard',
    ): Promise<{ data: EnrichedCandidateRoleMatch[]; total: number }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        // Build OR conditions on main table columns only
        const orConditions: string[] = [];

        if (recruiterJobIds.length > 0) {
            orConditions.push(`job_id.in.(${recruiterJobIds.join(',')})`);
        }

        if (recruiterCandidateIds.length > 0) {
            orConditions.push(`candidate_id.in.(${recruiterCandidateIds.join(',')})`);
        }

        if (orConditions.length === 0) {
            return { data: [], total: 0 };
        }

        let query = this.supabase
            .from('candidate_role_matches')
            .select(this.ENRICHED_SELECT, { count: 'exact' })
            .or(orConditions.join(','));

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
    ): Promise<{ data: EnrichedCandidateRoleMatch[]; total: number }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('candidate_role_matches')
            .select(this.ENRICHED_SELECT, { count: 'exact' })
            .eq('candidate_id', candidateId)
            .eq('match_tier', 'standard');

        query = this.applyFilters(query, filters);

        const { data, error, count } = await query
            .order('match_score', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { data: (data || []).map(r => this.mapRow(r)), total: count || 0 };
    }

    async findMatchesForCompany(
        companyIds: string[],
        filters: MatchListFilters,
    ): Promise<{ data: EnrichedCandidateRoleMatch[]; total: number }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('candidate_role_matches')
            .select(`
                *,
                candidates(id, full_name),
                jobs!inner(id, title, location, salary_min, salary_max, employment_type, job_level, company_id, companies(id, name, logo_url))
            `, { count: 'exact' })
            .in('jobs.company_id', companyIds);

        query = this.applyFilters(query, filters);

        const { data, error, count } = await query
            .order('match_score', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { data: (data || []).map(r => this.mapRow(r)), total: count || 0 };
    }

    async findById(id: string): Promise<EnrichedCandidateRoleMatch | null> {
        const { data, error } = await this.supabase
            .from('candidate_role_matches')
            .select(this.ENRICHED_SELECT)
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
