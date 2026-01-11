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
                console.log('[JobRepository] User is platform admin - showing all jobs');
            } else if (accessContext.recruiterId && accessContext.roles.includes('recruiter')) {
                // Recruiters see all active jobs (marketplace model)
                // OR only jobs where they have active involvement if job_owner_filter is 'assigned'
                // NOTE: Check recruiter FIRST before company roles, even if they have both
                console.log('[JobRepository] User is recruiter - applying recruiter filters');
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
                        console.log('[JobRepository] No involved jobs found, returning empty');
                        return { data: [], total: 0 };
                    }
                }
            } else if (accessContext.organizationIds.length > 0) {
                // Company users (company_admin, hiring_manager) see only their organization's jobs
                console.log('[JobRepository] User is company user with org IDs:', accessContext.organizationIds);
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

        // Apply filters with multi-criteria search parsing
        let useRelevanceSort = false;
        if (filters.search) {
            const searchTerms = this.parseSearchQuery(filters.search);

            // Build multi-field search with relevance scoring
            const searchConditions: string[] = [];

            // Search in title (highest weight)
            searchConditions.push(`title.ilike.%${filters.search}%`);

            // Search in description
            searchConditions.push(`description.ilike.%${filters.search}%`);

            // Search in location
            if (searchTerms.location) {
                searchConditions.push(`location.ilike.%${searchTerms.location}%`);
            }

            // Search in requirements and skills
            if (searchTerms.skills && searchTerms.skills.length > 0) {
                searchTerms.skills.forEach(skill => {
                    searchConditions.push(`title.ilike.%${skill}%`);
                    searchConditions.push(`description.ilike.%${skill}%`);
                });
            }

            query = query.or(searchConditions.join(','));

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

    /**
     * Parse search query into structured search terms
     * Extracts: skills/keywords, years of experience, location, salary
     */
    private parseSearchQuery(search: string): {
        skills: string[];
        years?: number;
        location?: string;
        salaryMin?: number;
        salaryMax?: number;
    } {
        const terms = search.toLowerCase().trim();
        const result: any = {
            skills: []
        };

        // Extract years of experience (e.g., "5 years", "10+ years")
        const yearsMatch = terms.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
        if (yearsMatch) {
            result.years = parseInt(yearsMatch[1]);
        }

        // Extract salary range (e.g., "100k", "150k-200k", "$120,000")
        const salaryMatch = terms.match(/\$?(\d+)(?:,\d{3})*(?:k)?(?:\s*-\s*\$?(\d+)(?:,\d{3})*(?:k)?)?/i);
        if (salaryMatch) {
            const min = parseInt(salaryMatch[1].replace(/,/g, ''));
            result.salaryMin = min < 1000 ? min * 1000 : min; // Handle "100k" vs "100000"
            if (salaryMatch[2]) {
                const max = parseInt(salaryMatch[2].replace(/,/g, ''));
                result.salaryMax = max < 1000 ? max * 1000 : max;
            }
        }

        // Extract location keywords (common cities/states/remote)
        const locationKeywords = ['california', 'ca', 'san francisco', 'sf', 'new york', 'ny', 'nyc',
            'texas', 'tx', 'austin', 'seattle', 'boston', 'chicago', 'remote',
            'hybrid', 'onsite', 'los angeles', 'la', 'denver', 'portland'];
        for (const location of locationKeywords) {
            if (terms.includes(location)) {
                result.location = location;
                break;
            }
        }

        // Split into individual skill keywords (filter out stop words)
        const stopWords = ['the', 'and', 'or', 'for', 'with', 'years', 'year', 'yrs', 'yr',
            'remote', 'hybrid', 'onsite', 'position', 'job', 'role'];
        const words = terms.split(/\s+/).filter(word =>
            word.length > 2 &&
            !stopWords.includes(word) &&
            !word.match(/^[\$\d,k-]+$/) // Filter out salary/number patterns
        );
        result.skills = words;

        return result;
    }
}
