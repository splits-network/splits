/**
 * Recruiter-Candidate Repository
 * Direct Supabase queries for recruiter-candidate relationship domain
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCandidateFilters, RecruiterCandidateUpdate, RepositoryListResponse } from './types';

export class RecruiterCandidateRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async findRecruiterCandidates(
        clerkUserId: string,
        filters: RecruiterCandidateFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Build query with enriched data
        let query = this.supabase
            .schema('network')
            .from('recruiter_candidates')
            .select(`
                *,
                recruiter:recruiters(id, name, email),
                candidate:ats.candidates(id, first_name, last_name, email)
            `, { count: 'exact' });

        // Apply filters
        if (filters.recruiter_id) {
            query = query.eq('recruiter_id', filters.recruiter_id);
        }
        if (filters.candidate_id) {
            query = query.eq('candidate_id', filters.candidate_id);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
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

    async findRecruiterCandidate(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('recruiter_candidates')
            .select(`
                *,
                recruiter:recruiters(id, name, email),
                candidate:ats.candidates(id, first_name, last_name, email, phone)
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createRecruiterCandidate(relationship: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('recruiter_candidates')
            .insert(relationship)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateRecruiterCandidate(id: string, updates: RecruiterCandidateUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('recruiter_candidates')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteRecruiterCandidate(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase
            .schema('network')
            .from('recruiter_candidates')
            .update({ status: 'inactive', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
