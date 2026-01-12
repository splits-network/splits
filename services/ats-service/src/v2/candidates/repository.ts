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

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    /**
     * Build select clause with optional includes
     * Supports: applications, recruiter_candidates, documents, user
     */
    private buildSelectClause(include?: string): string {
        // Base fields - always include recruiter relationships for access control
        const baseFields = `*,
            recruiter_relationships:recruiter_candidates(
                id,
                recruiter_id,
                status
            )`;

        if (!include) {
            return baseFields;
        }

        const includes = include.split(',').map(i => i.trim());
        let selectClause = baseFields;

        for (const inc of includes) {
            if (inc === 'applications') {
                selectClause += `,
                    applications:applications(
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
                                name,
                                identity_organization_id
                            )
                        )
                    )`;
            } else if (inc === 'recruiter_candidates') {
                // Enhanced recruiter relationship data
                selectClause += `,
                    recruiter_candidates(
                        id,
                        recruiter_id,
                        relationship_start_date,
                        relationship_end_date,
                        status,
                        recruiter:recruiters(
                            id,
                            user_id,
                            name,
                            email
                        )
                    )`;
            } else if (inc === 'documents') {
                // Note: documents use polymorphic entity_type/entity_id
                // Must be fetched separately or via subquery
                console.warn('Documents include requires separate query due to polymorphic association');
            } else if (inc === 'user') {
                selectClause += `,
                    user:users!user_id(
                        id,
                        email,
                        name,
                        clerk_user_id
                    )`;
            }
        }

        return selectClause;
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

        // Build select clause with optional includes
        const selectClause = this.buildSelectClause(params.include);

        let query = this.supabase
            .from('candidates')
            .select(selectClause, { count: 'exact' });

        filters = typeof params.filters === 'string' ? parseFilters(params.filters) : (params.filters || {});

        // Extract special filters that are NOT database columns
        // scope can come from either filters object or direct query parameter
        const scope = filters.scope || (params as any).scope || 'all';
        const { scope: _scope, ...columnFilters } = filters;

        // Apply role-based access control FIRST
        // Candidates can ONLY see their own candidate record
        if (accessContext.candidateId && !accessContext.recruiterId) {
            // User is a candidate (no recruiter role) - filter to only their own candidate
            query = query.eq('user_id', accessContext.identityUserId);
        }

        // Apply column-based filters (actual database columns only)
        for (const key of Object.keys(columnFilters)) {
            const value = columnFilters[key];
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        }

        // Handle scope-based filtering
        // CRITICAL: Apply filtering BEFORE pagination to ensure consistent page sizes
        // scope="mine" means only candidates the recruiter sourced/has relationships with
        // scope="all" means all accessible candidates (still respects role-based access)

        // For recruiters with scope="mine": filter to candidates they have relationships with
        if (accessContext.recruiterId && scope === 'mine') {
            // Get IDs of candidates this recruiter has relationships with
            const { data: relationships, error: relError } = await this.supabase

                .from('recruiter_candidates')
                .select('candidate_id')
                .eq('recruiter_id', accessContext.recruiterId)
                .eq('status', 'active');

            if (relError) {
                console.error('Error fetching recruiter relationships for filtering:', relError);
                throw relError;
            }

            const candidateIds = (relationships || []).map(r => r.candidate_id);
            if (candidateIds.length === 0) {
                // No candidates for this recruiter - return empty result
                return {
                    data: [],
                    pagination: {
                        page: page,
                        limit: limit,
                        total: 0,
                        total_pages: 0,
                    },
                };
            }

            // Filter query to only these candidates BEFORE pagination
            query = query.in('id', candidateIds);
        }

        // Apply sorting
        const sortBy1 = params.sort_by || 'created_at';
        const sortOrder1 = params.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy1, { ascending: sortOrder1 });

        // Apply pagination (NOW the total count reflects filtered candidates)
        query = query.range(offset, offset + limit - 1);

        const { data: data, error: error, count: count } = await query;
        if (error) {
            console.error('Error fetching candidates:', error);
            throw error;
        }

        // Enrich candidates with relationship data from JOINed recruiter_relationships
        // Now WITHOUT filtering - that's already done in the SQL query above
        const enrichedData = this.enrichCandidatesFromJoin(
            data || [],
            accessContext.recruiterId ?? undefined,
            undefined // Pass undefined to skip post-processing filter
        );

        return {
            data: enrichedData,
            pagination: {
                page: page,
                limit: limit,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / limit),
            },
        };
    }

    async findCandidate(id: string, clerkUserId?: string, include?: string): Promise<any | null> {
        // Build select clause with optional includes
        const selectClause = this.buildSelectClause(include);

        const { data, error } = await this.supabase
            .from('candidates')
            .select(selectClause)
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

        // Use consistent select clause for applications
        const selectClause = `
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
            )`;

        const { data, error } = await this.supabase

            .from('applications')
            .select(selectClause)
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
     * Enrich candidates with recruiter relationship data from JOINed data
     * This processes the recruiter_relationships array that comes from the JOIN
     * Filtering is already done in SQL - no post-processing filtering here
     */
    private enrichCandidatesFromJoin(candidates: any[], currentRecruiterId?: string, scope?: string): any[] {
        // Get current date for "new" badge logic (7 days ago)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return candidates
            .map(candidate => {
                // Extract relationships from the JOIN
                const relationships = candidate.recruiter_relationships || [];

                // Check if current recruiter has an active relationship
                const hasActiveRelationship = currentRecruiterId &&
                    relationships.some((rel: any) =>
                        rel.recruiter_id === currentRecruiterId && rel.status === 'active'
                    );

                // Count other active recruiters
                const otherRecruiters = new Set(
                    relationships
                        .filter((rel: any) => rel.status === 'active' && (!currentRecruiterId || rel.recruiter_id !== currentRecruiterId))
                        .map((rel: any) => rel.recruiter_id)
                );

                return {
                    ...candidate,
                    recruiter_relationships: undefined, // Remove the JOIN array to keep response clean
                    is_sourcer: currentRecruiterId && candidate.sourcer_recruiter_id === currentRecruiterId,
                    has_active_relationship: hasActiveRelationship,
                    has_other_active_recruiters: otherRecruiters.size > 0,
                    other_active_recruiters_count: otherRecruiters.size,
                    is_new: new Date(candidate.created_at) > sevenDaysAgo,
                };
            });
        // NO filtering here - filtering is done in the SQL query before pagination
    }

    /**
     * Enrich candidates with recruiter relationship data and status badges
     * DEPRECATED: Use enrichCandidatesFromJoin instead for better performance
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
