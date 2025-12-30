/**
 * Application Repository
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApplicationFilters, ApplicationUpdate } from './types';
import { resolveAccessContext } from '../shared/access';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export class ApplicationRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async findApplications(
        clerkUserId: string,
        filters: ApplicationFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        // Build query with enriched data
        let query = this.supabase
            .schema('ats')
            .from('applications')
            .select(`
                *,
                candidate:candidates(id, full_name, email, phone),
                job:jobs!inner(
                    id, 
                    title, 
                    status,
                    company:companies!inner(id, name, identity_organization_id)
                )
            `, { count: 'exact' });
        if (accessContext.candidateId) {
            query = query.eq('candidate_id', accessContext.candidateId);
        } else if (accessContext.recruiterId) {
            query = query.eq('recruiter_id', accessContext.recruiterId);
        } else if (!accessContext.isPlatformAdmin) {
            if (accessContext.organizationIds.length > 0) {
                query = query.in('job.company.identity_organization_id', accessContext.organizationIds);
            } else {
                return {
                    data: [],
                    total: 0,
                };
            }
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

        if (error) {
            throw error;
        }

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async findApplication(id: string, clerkUserId?: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .select(`
                *,
                candidate:candidates(id, full_name, email, phone, location),
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

        if (!data || !clerkUserId) {
            return data;
        }

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        if (accessContext.isPlatformAdmin) {
            return data;
        }

        if (accessContext.candidateId && data.candidate_id === accessContext.candidateId) {
            return data;
        }

        if (accessContext.recruiterId && data.recruiter_id === accessContext.recruiterId) {
            return data;
        }

        const companyOrgId = data.job?.company?.identity_organization_id;
        if (
            companyOrgId &&
            accessContext.organizationIds.length > 0 &&
            accessContext.organizationIds.includes(companyOrgId)
        ) {
            return data;
        }

        return null;
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
}
