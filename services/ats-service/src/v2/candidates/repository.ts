/**
 * Candidate Repository
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CandidateFilters, CandidateUpdate } from './types';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

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
}
