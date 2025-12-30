/**
 * Candidate Repository
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CandidateFilters, CandidateUpdate, CandidateDashboardStats, RecentCandidateApplication } from './types';
import { resolveAccessContext } from '../shared/access';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

const DEFAULT_CANDIDATE_STATS: CandidateDashboardStats = {
    applications: 0,
    interviews: 0,
    offers: 0,
    active_relationships: 0,
};

export class CandidateRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async findCandidates(
        clerkUserId: string,
        filters: CandidateFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const organizationIds = accessContext.organizationIds;
        const restrictToOrganizations = !accessContext.isPlatformAdmin && !accessContext.candidateId;

        if (restrictToOrganizations && organizationIds.length === 0) {
            return { data: [], total: 0 };
        }

        // Build query - candidates visible if they have applications to jobs in user's org
        let query = this.supabase
            .schema('ats')
            .from('candidates')
            .select(`
                *,
                applications:applications(
                    id,
                    job:jobs!inner(
                        id,
                        title,
                        company:companies!inner(identity_organization_id)
                    )
                )
            `, { count: 'exact' });

        // Apply filters
        if (accessContext.candidateId) {
            query = query.eq('id', accessContext.candidateId);
        }

        if (filters.search) {
            query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`);
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        // Filter candidates by organization
        let filteredData = data || [];
        if (restrictToOrganizations && organizationIds.length > 0) {
            filteredData = filteredData.filter((candidate: any) => {
                return candidate.applications?.some((app: any) => {
                    return organizationIds.includes(app.job?.company?.identity_organization_id);
                });
            });
        }

        return {
            data: filteredData,
            total: count || 0,
        };
    }

    async findCandidate(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidates')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createCandidate(candidate: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidates')
            .insert(candidate)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateCandidate(id: string, updates: CandidateUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidates')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteCandidate(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase
            .schema('ats')
            .from('candidates')
            .update({ status: 'archived', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    async getAccessContext(clerkUserId: string) {
        return resolveAccessContext(this.supabase, clerkUserId);
    }

    async getCandidateDashboardStats(candidateId: string): Promise<CandidateDashboardStats> {
        if (!candidateId) {
            return DEFAULT_CANDIDATE_STATS;
        }

        const interviewStages = [
            'phone_screen',
            'technical_interview',
            'onsite_interview',
            'final_interview',
        ];
        const offerStages = ['offer_extended'];

        const [applicationsResult, interviewsResult, offersResult, relationshipsResult] = await Promise.all([
            this.supabase
                .schema('ats')
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('candidate_id', candidateId),
            this.supabase
                .schema('ats')
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('candidate_id', candidateId)
                .in('stage', interviewStages),
            this.supabase
                .schema('ats')
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('candidate_id', candidateId)
                .in('stage', offerStages),
            this.supabase
                .schema('network')
                .from('recruiter_candidates')
                .select('id', { count: 'exact', head: true })
                .eq('candidate_id', candidateId)
                .eq('status', 'active'),
        ]);

        if (applicationsResult.error) throw applicationsResult.error;
        if (interviewsResult.error) throw interviewsResult.error;
        if (offersResult.error) throw offersResult.error;
        if (relationshipsResult.error) throw relationshipsResult.error;

        return {
            applications: applicationsResult.count || 0,
            interviews: interviewsResult.count || 0,
            offers: offersResult.count || 0,
            active_relationships: relationshipsResult.count || 0,
        };
    }

    async getRecentCandidateApplications(
        candidateId: string,
        limit = 5
    ): Promise<RecentCandidateApplication[]> {
        if (!candidateId) {
            return [];
        }

        const safeLimit = Math.max(1, Math.min(limit, 25));

        const { data, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .select(
                `
                id,
                job_id,
                stage,
                status,
                created_at,
                updated_at,
                job:jobs(
                    id,
                    title,
                    location,
                    company:companies(
                        id,
                        name
                    )
                )
            `
            )
            .eq('candidate_id', candidateId)
            .order('created_at', { ascending: false })
            .range(0, safeLimit - 1);

        if (error) throw error;

        return (data || []).map((app: any) => ({
            id: app.id,
            job_id: app.job_id,
            job_title: app.job?.title || 'Unknown Position',
            company: app.job?.company?.name || 'Unknown Company',
            location: app.job?.location || null,
            status: app.stage,
            stage: app.stage,
            applied_at: app.created_at,
            updated_at: app.updated_at,
        }));
    }
}
