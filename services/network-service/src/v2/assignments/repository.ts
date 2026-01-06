/**
 * Assignment Repository
 * Direct Supabase queries for assignment domain
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AssignmentFilters, AssignmentUpdate, RepositoryListResponse } from './types';
import { resolveAccessContext } from '../shared/access';

export class AssignmentRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async findAssignments(
        clerkUserId: string,
        filters: AssignmentFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const organizationIds = accessContext.organizationIds;

        // Build query with enriched data
        let query = this.supabase
            
            .from('role_assignments')
            .select(`
                *,
                recruiter:recruiters(id, name, email),
                job:jobs(
                    id,
                    title,
                    company:companies!inner(id, name, identity_organization_id)
                )
            `, { count: 'exact' });

        if (accessContext.recruiterId) {
            query = query.eq('recruiter_id', accessContext.recruiterId);
        } else if (!accessContext.isPlatformAdmin) {
            if (organizationIds.length === 0) {
                return { data: [], total: 0 };
            }
            query = query.in('job.company.identity_organization_id', organizationIds);
        }

        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.recruiter_id) {
            query = query.eq('recruiter_id', filters.recruiter_id);
        }
        if (filters.job_id) {
            query = query.eq('job_id', filters.job_id);
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

    async findAssignment(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            
            .from('role_assignments')
            .select(`
                *,
                recruiter:recruiters(id, name, email),
                job:jobs(
                    id,
                    title,
                    company:companies(id, name)
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

    async createAssignment(assignment: any): Promise<any> {
        const { data, error } = await this.supabase
            
            .from('role_assignments')
            .insert(assignment)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateAssignment(id: string, updates: AssignmentUpdate): Promise<any> {
        const { data, error } = await this.supabase
            
            .from('role_assignments')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteAssignment(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase
            
            .from('role_assignments')
            .update({ status: 'inactive', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
