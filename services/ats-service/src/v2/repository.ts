/**
 * V2 Repository - Single file for all ATS resources
 * Direct Supabase queries, no SQL functions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    RepositoryListResponse,
    JobFilters,
    CompanyFilters,
    CandidateFilters,
    ApplicationFilters,
    PlacementFilters,
    JobUpdate,
    CompanyUpdate,
    CandidateUpdate,
    ApplicationUpdate,
    PlacementUpdate,
} from './types';

export class RepositoryV2 {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    // ============================================
    // JOBS
    // ============================================

    /**
     * Find jobs with role-based scoping
     * Resolves organization from user's memberships, then filters jobs
     */
    async findJobs(
        clerkUserId: string,
        filters: JobFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Step 1: Get user's organization ID from identity.memberships
        const { data: memberships } = await this.supabase
            .schema('identity')
            .from('memberships')
            .select('organization_id')
            .eq('user_id', clerkUserId);

        const organizationIds = memberships?.map((m) => m.organization_id) || [];

        // Step 2: Build query with role-based scoping
        let query = this.supabase
            .schema('ats')
            .from('jobs')
            .select(`
                *,
                company:companies!inner(id, name, identity_organization_id)
            `, { count: 'exact' });

        // Apply organization filter if user has memberships
        if (organizationIds.length > 0) {
            query = query.in('company.identity_organization_id', organizationIds);
        }

        // Apply filters
        if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`);
        }
        if (filters.employment_type) {
            query = query.eq('employment_type', filters.employment_type);
        }
        if (filters.company_id) {
            query = query.eq('company_id', filters.company_id);
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

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

    async findJob(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('jobs')
            .select(`
                *,
                company:companies(id, name, description, website)
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createJob(job: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('jobs')
            .insert(job)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateJob(id: string, updates: JobUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
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
            .schema('ats')
            .from('jobs')
            .update({ status: 'closed', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // COMPANIES
    // ============================================

    async findCompanies(
        clerkUserId: string,
        filters: CompanyFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Get user's organization IDs
        const { data: memberships } = await this.supabase
            .schema('identity')
            .from('memberships')
            .select('organization_id')
            .eq('user_id', clerkUserId);

        const organizationIds = memberships?.map((m) => m.organization_id) || [];

        // Build query
        let query = this.supabase
            .schema('ats')
            .from('companies')
            .select('*', { count: 'exact' });

        // Apply organization filter
        if (organizationIds.length > 0) {
            query = query.in('identity_organization_id', organizationIds);
        }

        // Apply filters
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'name';
        const sortOrder = filters.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async findCompany(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('companies')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createCompany(company: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('companies')
            .insert(company)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateCompany(id: string, updates: CompanyUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('companies')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteCompany(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase
            .schema('ats')
            .from('companies')
            .update({ status: 'inactive', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // CANDIDATES
    // ============================================

    async findCandidates(
        clerkUserId: string,
        filters: CandidateFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Get user's organization IDs
        const { data: memberships } = await this.supabase
            .schema('identity')
            .from('memberships')
            .select('organization_id')
            .eq('user_id', clerkUserId);

        const organizationIds = memberships?.map((m) => m.organization_id) || [];

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
        if (filters.search) {
            query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
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
        if (organizationIds.length > 0) {
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

    // ============================================
    // APPLICATIONS
    // ============================================

    async findApplications(
        clerkUserId: string,
        filters: ApplicationFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Get user's organization IDs
        const { data: memberships } = await this.supabase
            .schema('identity')
            .from('memberships')
            .select('organization_id')
            .eq('user_id', clerkUserId);

        const organizationIds = memberships?.map((m) => m.organization_id) || [];

        // Build query with enriched data
        let query = this.supabase
            .schema('ats')
            .from('applications')
            .select(`
                *,
                candidate:candidates(id, first_name, last_name, email, phone),
                job:jobs!inner(
                    id, 
                    title, 
                    status,
                    company:companies!inner(id, name, identity_organization_id)
                )
            `, { count: 'exact' });

        // Apply organization filter
        if (organizationIds.length > 0) {
            query = query.in('job.company.identity_organization_id', organizationIds);
        }

        // Apply filters
        if (filters.search) {
            query = query.or(`notes.ilike.%${filters.search}%`);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.stage) {
            query = query.eq('stage', filters.stage);
        }
        if (filters.job_id) {
            query = query.eq('job_id', filters.job_id);
        }
        if (filters.candidate_id) {
            query = query.eq('candidate_id', filters.candidate_id);
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async findApplication(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .select(`
                *,
                candidate:candidates(id, first_name, last_name, email, phone, location),
                job:jobs(
                    id, 
                    title, 
                    description,
                    status,
                    company:companies(id, name, description)
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createApplication(application: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .insert(application)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateApplication(id: string, updates: ApplicationUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteApplication(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase
            .schema('ats')
            .from('applications')
            .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // PLACEMENTS
    // ============================================

    async findPlacements(
        clerkUserId: string,
        filters: PlacementFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Get user's organization IDs
        const { data: memberships } = await this.supabase
            .schema('identity')
            .from('memberships')
            .select('organization_id')
            .eq('user_id', clerkUserId);

        const organizationIds = memberships?.map((m) => m.organization_id) || [];

        // Build query with enriched data
        let query = this.supabase
            .schema('ats')
            .from('placements')
            .select(`
                *,
                candidate:candidates(id, first_name, last_name, email),
                job:jobs!inner(
                    id, 
                    title,
                    company:companies!inner(id, name, identity_organization_id)
                ),
                application:applications(id, stage, status)
            `, { count: 'exact' });

        // Apply organization filter
        if (organizationIds.length > 0) {
            query = query.in('job.company.identity_organization_id', organizationIds);
        }

        // Apply filters
        if (filters.search) {
            query = query.or(`notes.ilike.%${filters.search}%`);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.job_id) {
            query = query.eq('job_id', filters.job_id);
        }
        if (filters.candidate_id) {
            query = query.eq('candidate_id', filters.candidate_id);
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async findPlacement(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('placements')
            .select(`
                *,
                candidate:candidates(id, first_name, last_name, email, phone),
                job:jobs(
                    id, 
                    title,
                    company:companies(id, name)
                ),
                application:applications(id, stage, status, notes)
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createPlacement(placement: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('placements')
            .insert(placement)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updatePlacement(id: string, updates: PlacementUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('placements')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deletePlacement(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase
            .schema('ats')
            .from('placements')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
