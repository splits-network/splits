/**
 * Jobs Domain Repository
 * 
 * Data access layer for jobs resource.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { JobFilters, JobUpdate } from './types';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export class JobRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

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
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
