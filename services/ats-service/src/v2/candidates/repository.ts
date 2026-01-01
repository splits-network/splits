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
        const restrictToOrganizations = !accessContext.isPlatformAdmin && !accessContext.candidateId && !accessContext.recruiterId;

        if (restrictToOrganizations && organizationIds.length === 0) {
            return { data: [], total: 0 };
        }

        // Build query based on user role and scope
        let query = this.supabase
            .schema('ats')
            .from('candidates')
            .select(`
                *,
                applications:applications(
                    id,
                    job:jobs(
                        id,
                        title,
                        company:companies(identity_organization_id)
                    )
                )
            `, { count: 'exact' });

        // Apply filters
        if (accessContext.candidateId) {
            query = query.eq('id', accessContext.candidateId);
        }

        // Handle recruiter filtering when scope is "mine" - use view to avoid cross-schema join issues
        if (accessContext.recruiterId && filters.scope === 'mine') {
            // Use the candidates_with_recruiters view for efficient filtering
            query = this.supabase
                .schema('ats')
                .from('candidates_with_recruiters')
                .select(`
                    *,
                    applications:applications(
                        id,
                        job:jobs(
                            id,
                            title,
                            company:companies(identity_organization_id)
                        )
                    )
                `, { count: 'exact' })
                .eq('active_recruiter_id', accessContext.recruiterId);
        }

        // For recruiters with scope != 'mine', we need a broader initial query
        // Get all candidate IDs they should see first
        let allowedCandidateIds: Set<string> | null = null;
        if (accessContext.recruiterId && filters.scope !== 'mine') {
            allowedCandidateIds = new Set();

            // 1. Get organization candidate IDs (if recruiter is part of organizations)
            if (organizationIds.length > 0) {
                const { data: orgCandidates, error: orgError } = await this.supabase
                    .schema('ats')
                    .from('candidates')
                    .select(`
                        id,
                        applications:applications(
                            job:jobs(
                                company:companies(identity_organization_id)
                            )
                        )
                    `);
                
                if (orgError) throw orgError;
                
                orgCandidates?.forEach((candidate: any) => {
                    const hasOrgApp = candidate.applications?.some((app: any) => {
                        return organizationIds.includes(app.job?.company?.identity_organization_id);
                    });
                    if (hasOrgApp) {
                        allowedCandidateIds!.add(candidate.id);
                    }
                });
            }

            // 2. Get relationship candidate IDs
            const { data: recruiterRelationships, error: relError } = await this.supabase
                .schema('network')
                .from('recruiter_candidates')
                .select('candidate_id')
                .eq('recruiter_id', accessContext.recruiterId)
                .eq('status', 'active');
            
            if (relError) throw relError;
            
            recruiterRelationships?.forEach(rel => {
                allowedCandidateIds!.add(rel.candidate_id);
            });

            // Filter the main query to only include allowed candidates
            if (allowedCandidateIds.size === 0) {
                return { data: [], total: 0 };
            }

            const candidateIdArray = Array.from(allowedCandidateIds);
            query = query.in('id', candidateIdArray);
        }

        if (filters.search) {
            query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
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

        // Filter candidates by access rules
        let filteredData = data || [];
        
        // For recruiters with scope != 'mine', we already filtered in the query above
        // For other users, apply organization filtering
        if (!accessContext.recruiterId && restrictToOrganizations && organizationIds.length > 0) {
            filteredData = filteredData.filter((candidate: any) => {
                return candidate.applications?.some((app: any) => {
                    return organizationIds.includes(app.job?.company?.identity_organization_id);
                });
            });
        }

        // Enrich with recruiter relationship data
        if (filteredData.length > 0) {
            filteredData = await this.enrichWithRecruiterRelationships(filteredData, accessContext.recruiterId ?? undefined);
        }

        return {
            data: filteredData,
            total: count || 0,
        };
    }

    async findCandidate(id: string, clerkUserId?: string): Promise<any | null> {
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
            .schema('ats')
            .from('candidates')
            .insert({...candidate, verification_status: 'verified' })
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
        throw new Error('Soft delete not implemented yet');
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

    /**
     * Enrich candidates with recruiter relationship data and status badges
     */
    private async enrichWithRecruiterRelationships(candidates: any[], currentRecruiterId?: string): Promise<any[]> {
        if (candidates.length === 0) return candidates;

        const candidateIds = candidates.map(c => c.id);

        // Get all recruiter relationships for these candidates
        const { data: allRelationships, error: relError } = await this.supabase
            .schema('network')
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
