/**
 * Jobs Domain Repository
 * 
 * Data access layer for jobs resource.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { JobFilters, JobUpdate } from './types';
import { resolveAccessContext } from '../shared/access';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export class JobRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    /**
     * Find jobs with role-based scoping
     * Resolves organization from user's memberships, then filters jobs
     */
    async findJobs(
        clerkUserId: string | undefined,
        filters: JobFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        let query = this.supabase

            .from('jobs')
            .select(
                `
                *,
                company:companies!inner(id, name, industry, headquarters_location, logo_url, identity_organization_id)
            `,
                { count: 'exact' }
            );

        if (clerkUserId) {
            const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

            if (accessContext.isPlatformAdmin) {
                // Platform admins see all jobs
            } else if (accessContext.recruiterId && accessContext.roles.includes('recruiter')) {
                // Recruiters see all active jobs (marketplace model)
                // OR only jobs where they have active involvement if job_owner_filter is 'assigned'
                // NOTE: Check recruiter FIRST before company roles, even if they have both
                query = query.eq('status', 'active');
                // Recruiters see all active jobs (marketplace model)
                // OR only jobs where they have active involvement if job_owner_filter is 'assigned'
                query = query.eq('status', 'active');

                if (filters.job_owner_filter === 'assigned') {

                    // Filter to jobs where recruiter has:
                    // 1. Applications in active stages (recruiter_proposed, draft, ai_review, screen, submitted, interview, offer)
                    // 2. OR placements (hired candidates)

                    // Get job IDs from applications with active stages
                    const { data: applications, error: appsError } = await this.supabase

                        .from('applications')
                        .select('job_id, stage, candidate_id')
                        .eq('recruiter_id', accessContext.recruiterId)
                        .in('stage', ['recruiter_proposed', 'draft', 'recruiter_request', 'ai_review', 'screen', 'submitted', 'interview', 'offer']);

                    // Get job IDs from placements
                    const { data: placements, error: placementsError } = await this.supabase

                        .from('placements')
                        .select('job_id, candidate_id')
                        .eq('recruiter_id', accessContext.recruiterId);


                    // Combine unique job IDs
                    const applicationJobIds = applications?.map(a => a.job_id) || [];
                    const placementJobIds = placements?.map(p => p.job_id) || [];
                    const involvedJobIds = [...new Set([...applicationJobIds, ...placementJobIds])];


                    if (involvedJobIds.length > 0) {
                        query = query.in('id', involvedJobIds);
                    } else {
                        // No involved jobs - return empty
                        return { data: [], total: 0 };
                    }
                }
            } else if (accessContext.organizationIds.length > 0) {
                // Company users (company_admin, hiring_manager) see only their organization's jobs

                query = query.in('company.identity_organization_id', accessContext.organizationIds);

                if (filters.job_owner_filter === 'assigned' && accessContext.identityUserId) {
                    // Further filter to only jobs where this user is the job_owner_id
                    query = query.eq('job_owner_id', accessContext.identityUserId);
                }
            } else if (accessContext.candidateId) {
                // Candidates see all active jobs
                query = query.eq('status', 'active');
            } else {
                // No role found - return empty
                return { data: [], total: 0 };
            }
        } else {
            // Unauthenticated - show active jobs only
            query = query.eq('status', 'active');
        }

        // Apply full-text search
        let useRelevanceSort = false;
        if (filters.search) {
            // Convert search query to tsquery format (AND logic for multiple words)
            const tsquery = filters.search.split(/\s+/).filter(t => t.trim()).join(' & ');

            // Use PostgreSQL full-text search with search_vector column
            query = query.textSearch('search_vector', tsquery, {
                type: 'websearch',
                config: 'english'
            });

            // Use relevance-based sorting when search is active (unless explicitly overridden)
            if (!filters.sort_by) {
                useRelevanceSort = true;
            }
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.location && !filters.search) {
            query = query.ilike('location', `%${filters.location}%`);
        }
        if (filters.employment_type) {
            query = query.eq('employment_type', filters.employment_type);
        }
        if (filters.company_id) {
            query = query.eq('company_id', filters.company_id);
        }

        // Apply sorting - relevance-based when searching, otherwise by sort_by parameter
        if (useRelevanceSort) {
            // For now, sort by created_at desc as proxy for relevance
            // In future, implement proper ts_rank with tsvector indexes
            query = query.order('created_at', { ascending: false });
        } else {
            const sortBy = filters.sort_by || 'created_at';
            const sortOrder = filters.sort_order?.toLowerCase() === 'asc' ? true : false;
            query = query.order(sortBy, { ascending: sortOrder });
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        // Execute query
        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async findJob(id: string, clerkUserId?: string, include: string[] = []): Promise<any | null> {
        let query = this.supabase

            .from('jobs')
            .select(
                `
                *,
                company:companies(id, name, industry, headquarters_location, logo_url, description, website)
            `
            )
            .eq('id', id);

        if (!clerkUserId) {
            query = query.eq('status', 'active');
        }

        const { data, error } = await query.single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        // Fetch related data based on include parameter
        if (include.includes('requirements')) {
            const { data: requirements } = await this.supabase

                .from('job_requirements')
                .select('*')
                .eq('job_id', id)
                .order('requirement_type')
                .order('created_at');
            data.requirements = requirements || [];
        }

        if (include.includes('pre_screen_questions')) {
            const { data: preScreenQuestions } = await this.supabase

                .from('job_pre_screen_questions')
                .select('*')
                .eq('job_id', id)
                .order('created_at');
            data.pre_screen_questions = preScreenQuestions || [];
        }

        if (include.includes('applications')) {
            const { data: applications } = await this.supabase

                .from('applications')
                .select('*')
                .eq('job_id', id)
                .order('created_at', { ascending: false });
            data.applications = applications || [];
        }

        return data;
    }

    async createJob(job: any): Promise<any> {
        const { data, error } = await this.supabase
            .from('jobs')
            .insert(job)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateJob(id: string, updates: JobUpdate): Promise<any> {
        const { data, error } = await this.supabase

            .from('jobs')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteJob(id: string): Promise<void> {
        // Soft delete by default
        const { error } = await this.supabase

            .from('jobs')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
