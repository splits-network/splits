/**
 * Candidate Repository
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CandidateFilters, CandidateUpdate, CandidateDashboardStats, RecentCandidateApplication } from './types';
import { StandardListParams, StandardListResponse, parseFilters } from '@splits-network/shared-types';
import { resolveAccessContext } from '../shared/access';

const DEFAULT_CANDIDATE_STATS: CandidateDashboardStats = {
    applications: 0,
    interviews: 0,
    offers: 0,
    active_relationships: 0,
};

export class CandidateRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: {
                schema: 'public'
            }
        });
    }

    async findCandidates(
        clerkUserId: string,
        params: StandardListParams = {}
    ): Promise<StandardListResponse<any>> {

        const page = params.page || 1;
        const limit = params.limit || 25;
        const offset = (page - 1) * limit;
        let filters: Record<string, any> = {};

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        // For recruiters, pre-fetch candidate IDs they have relationships with
        let recruiterCandidateIds: string[] = [];
        if (accessContext.recruiterId) {
            const { data: relationships } = await this.supabase
                .from('recruiter_candidates')
                .select('candidate_id')
                .eq('recruiter_id', accessContext.recruiterId);
            recruiterCandidateIds = relationships?.map(r => r.candidate_id) || [];
        }

        // ***********************************************
        // NEW WAY - SIMPLER, USING INCLUDES ONLY
        // ***********************************************
        let select = '*';
        if (params.include) {
            const tables = params.include.split(',');
            const relations = tables.map(table => {
                if (table === 'applications') {
                    return `
                        ,applications:applications(
                            id,
                            job:jobs(
                                id,
                                title,
                                company:companies(identity_organization_id)
                            )
                        )
                    `;
                } else if (table === 'recruiter_candidates') {
                    return `
                        ,recruiter_candidates(
                            id,
                            recruiter_id,
                            relationship_start_date,
                            relationship_end_date,
                            status
                        )
                    `;
                }
                return table;
            });
            select = ['*', ...relations].join(',');
        }


        let query = this.supabase
            .from('candidates')
            .select(select, { count: 'exact' });

        filters = typeof params.filters === 'string' ? parseFilters(params.filters) : (params.filters || {});

        // Extract special filters that are NOT database columns
        const { scope, ...columnFilters } = filters;

        // Apply column-based filters (actual database columns only)
        for (const key of Object.keys(columnFilters)) {
            const value = columnFilters[key];
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        }

        // Handle scope-based filtering
        // scope="mine" means only candidates the recruiter sourced/has relationships with
        // scope="all" means all accessible candidates (still respects role-based access)

        // For recruiters: filter to candidates they sourced OR have relationships with
        if (accessContext.recruiterId) {
            // Build list of candidate IDs the recruiter can access
            const accessibleCandidateIds = [...new Set(recruiterCandidateIds)];

            // If scope is "mine" or not specified, apply recruiter filtering
            // If scope is "all", skip recruiter filtering (show all accessible to their role)
            if (scope !== 'all') {
                // If recruiter has relationship candidates, filter by those OR by recruiter_id (who sourced them)
                if (accessibleCandidateIds.length > 0) {
                    query = query.or(`recruiter_id.eq.${accessContext.recruiterId},id.in.(${accessibleCandidateIds.join(',')})`);
                } else {
                    // No relationships - only show candidates they sourced
                    query = query.eq('recruiter_id', accessContext.recruiterId);
                }
            }
        }


        // Apply sorting

        const sortBy1 = params.sort_by || 'created_at';
        const sortOrder1 = params.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy1, { ascending: sortOrder1 });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: data, error: error, count: count } = await query;
        if (error) {
            console.error('Error fetching candidates:', error);
            throw error;
        }

        return {
            data: data || [],
            pagination: {
                page: page,
                limit: limit,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / limit),
            },
        };
    }

    async findCandidate(id: string, clerkUserId?: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('candidates')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        // Enrich single candidate with relationship data
        if (data && clerkUserId) {
            const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
            const enriched = await this.enrichWithRecruiterRelationships([data], accessContext.recruiterId ?? undefined);
            return enriched[0];
        }

        return data;
    }

    async createCandidate(candidate: any): Promise<any> {
        const { data, error } = await this.supabase
            .from('candidates')
            .insert({ ...candidate, verification_status: 'unverified' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateCandidate(id: string, updates: CandidateUpdate): Promise<any> {
        const { data, error } = await this.supabase
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
        throw new Error('Soft delete not implemented yet');
        const { error } = await this.supabase
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

                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('candidate_id', candidateId),
            this.supabase
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('candidate_id', candidateId)
                .in('stage', interviewStages),
            this.supabase
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('candidate_id', candidateId)
                .in('stage', offerStages),
            this.supabase
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

    /**
     * Enrich candidates with recruiter relationship data and status badges
     */
    private async enrichWithRecruiterRelationships(candidates: any[], currentRecruiterId?: string): Promise<any[]> {
        if (candidates.length === 0) return candidates;

        const candidateIds = candidates.map(c => c.id);

        // Get all recruiter relationships for these candidates
        const { data: allRelationships, error: relError } = await this.supabase

            .from('recruiter_candidates')
            .select('candidate_id, recruiter_id, status')
            .in('candidate_id', candidateIds)
            .eq('status', 'active');

        if (relError) {
            console.error('Error fetching recruiter relationships:', relError);
            // Continue without relationship data rather than failing
        }

        // Create maps for relationship data
        const currentRecruiterRelationships = new Map<string, any>();
        const otherActiveRecruiters = new Map<string, number>();

        allRelationships?.forEach(rel => {
            if (currentRecruiterId && rel.recruiter_id === currentRecruiterId) {
                currentRecruiterRelationships.set(rel.candidate_id, rel);
            } else {
                // Count other active recruiters for this candidate
                const current = otherActiveRecruiters.get(rel.candidate_id) || 0;
                otherActiveRecruiters.set(rel.candidate_id, current + 1);
            }
        });

        // Get current date for "new" badge logic (7 days ago)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Enrich candidates with relationship data and badge flags
        return candidates.map(candidate => ({
            ...candidate,
            is_sourcer: currentRecruiterId && candidate.sourcer_recruiter_id === currentRecruiterId,
            has_active_relationship: currentRecruiterId && currentRecruiterRelationships.get(candidate.id)?.status === 'active',
            has_other_active_recruiters: (otherActiveRecruiters.get(candidate.id) || 0) > 0,
            other_active_recruiters_count: otherActiveRecruiters.get(candidate.id) || 0,
            is_new: new Date(candidate.created_at) > sevenDaysAgo,
        }));
    }
}
