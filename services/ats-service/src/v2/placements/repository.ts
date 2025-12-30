/**
 * Placement Repository
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PlacementFilters, PlacementUpdate } from './types';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export class PlacementRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

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
