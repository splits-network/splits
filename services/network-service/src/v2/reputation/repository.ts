/**
 * Reputation Repository
 * Direct Supabase queries for reputation domain
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ReputationFilters, ReputationUpdate, RepositoryListResponse } from './types';

export class ReputationRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async findReputations(
        clerkUserId: string,
        filters: ReputationFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Build query
        let query = this.supabase
            
            .from('recruiter_reputation')
            .select(`
                *,
                recruiter:recruiters(id, name, email)
            `, { count: 'exact' });

        // Apply filters
        if (filters.recruiter_id) {
            query = query.eq('recruiter_id', filters.recruiter_id);
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'rating';
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

    async findReputation(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            
            .from('recruiter_reputation')
            .select(`
                *,
                recruiter:recruiters(id, name, email)
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async findReputationByRecruiterId(recruiterId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            
            .from('recruiter_reputation')
            .select('*')
            .eq('recruiter_id', recruiterId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createReputation(reputation: any): Promise<any> {
        const { data, error } = await this.supabase
            
            .from('recruiter_reputation')
            .insert(reputation)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateReputation(id: string, updates: ReputationUpdate): Promise<any> {
        const { data, error } = await this.supabase
            
            .from('recruiter_reputation')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteReputation(id: string): Promise<void> {
        // Hard delete for reputation (or could soft delete)
        const { error } = await this.supabase
            
            .from('recruiter_reputation')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
