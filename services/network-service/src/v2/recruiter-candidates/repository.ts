/**
 * Recruiter-Candidate Repository
 * Direct Supabase queries for recruiter-candidate relationship domain
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { RecruiterCandidateFilters, RecruiterCandidateUpdate, RepositoryListResponse } from './types';
import { resolveAccessContext } from '../shared/access';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';

export class RecruiterCandidateRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    /**
     * Build select clause with optional includes
     * Supports: recruiter, candidate
     */
    private buildSelectClause(include?: string): string {
        // Base fields - always include relationship data
        const baseFields = '*,candidate:candidates!candidate_id!inner(id, user_id, email, full_name, phone, location, linkedin_url, user:users!candidates_user_id_fkey(name, email))';

        if (!include) {
            return baseFields;
        }

        const includes = include.split(',').map(i => i.trim().toLowerCase());
        let selectClause = baseFields;

        for (const inc of includes) {
            switch (inc) {
                case 'recruiter':
                    // Join with recruiters table and identity users for contact info
                    selectClause += ',recruiter:recruiters!recruiter_id(id, user_id, bio, status, user:users(name, email))';
                    break;
            }
        }

        return selectClause;
    }

    async findRecruiterCandidates(
        clerkUserId: string,
        params: StandardListParams = {}
    ): Promise<StandardListResponse<any>> {
        const page = params.page || 1;
        const limit = params.limit || 25;
        const offset = (page - 1) * limit;
        const search = params.search;
        const filters = params.filters || {};

        console.log('=== REPOSITORY DEBUG ===');
        console.log('All params:', JSON.stringify(params, null, 2));
        console.log('Search value:', search);
        console.log('params', params);

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const scopedFilters: RecruiterCandidateFilters = { ...params };
        if (!accessContext.isPlatformAdmin) {
            if (accessContext.recruiterId) {
                scopedFilters.recruiter_id = accessContext.recruiterId;
            } else if (accessContext.candidateId) {
                scopedFilters.candidate_id = accessContext.candidateId;
            } else {
                const total_pages = 0;
                return { data: [], pagination: { total: 0, page, limit, total_pages } };
            }
        }

        // Build select clause with includes
        const selectClause = this.buildSelectClause(params.include);

        // Build query with enriched data
        let query = this.supabase
            .from('recruiter_candidates')
            .select(selectClause, { count: 'exact' });

        if (scopedFilters.recruiter_id) {
            query = query.eq('recruiter_id', scopedFilters.recruiter_id);
        }
        if (scopedFilters.candidate_id) {
            query = query.eq('candidate_id', scopedFilters.candidate_id);
        }

        // Apply filters
        if (filters.status && filters.status !== '' && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        // Apply search on denormalized candidate fields (scales efficiently)
        if (search) {
            console.log('Applying search on denormalized fields:', search);
            // Search directly on recruiter_candidates table (no joins needed)
            // Uses trigram indexes for fast ILIKE performance
            query = query.or(`candidate_name.ilike.%${search}%,candidate_email.ilike.%${search}%`);
        }

        // Apply sorting
        const sortBy = scopedFilters.sort_by || 'created_at';
        const sortOrder = scopedFilters.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);
        const { data, error, count } = await query;

        if (error) throw error;
        return {
            data: data || [],
            pagination: {
                total: count || 0,
                page,
                limit,
                total_pages: Math.ceil((count || 0) / limit),
            }
        };
    }

    async findRecruiterCandidate(id: string, include?: string): Promise<any | null> {
        const selectClause = this.buildSelectClause(include);

        const { data, error } = await this.supabase

            .from('recruiter_candidates')
            .select(selectClause)
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

            .from('recruiter_candidates')
            .insert(relationship)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateRecruiterCandidate(id: string, updates: RecruiterCandidateUpdate): Promise<any> {
        const { data, error } = await this.supabase

            .from('recruiter_candidates')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteRecruiterCandidate(id: string): Promise<void> {
        // First, get the current record to check its state
        const { data: existing, error: fetchError } = await this.supabase

            .from('recruiter_candidates')
            .select('consent_given, candidate_id')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (!existing) throw new Error('Recruiter-candidate relationship not found');

        // Hard delete if invitation not accepted and no candidate relationship
        if (!existing.consent_given && !existing.candidate_id) {
            const { error } = await this.supabase

                .from('recruiter_candidates')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } else {
            // Soft delete for accepted relationships or those with candidate data
            const { error } = await this.supabase

                .from('recruiter_candidates')
                .update({ status: 'terminated', updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
        }
    }

    async findByInvitationToken(token: string): Promise<any | null> {
        const { data, error } = await this.supabase

            .from('recruiter_candidates')
            .select(`*
                ,recruiter:recruiters!recruiter_id(id, user_id, bio, status, user:users(name, email))
                ,candidate:candidates!candidate_id(id, user_id, full_name, phone, location, linkedin_url, user:users!candidates_user_id_fkey(name, email))`)
            .eq('invitation_token', token)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async resendInvitation(id: string): Promise<any> {
        const invitationToken = this.generateInvitationToken();
        const invitationExpiresAt = new Date();
        invitationExpiresAt.setDate(invitationExpiresAt.getDate() + 7);

        const { data, error } = await this.supabase

            .from('recruiter_candidates')
            .update({
                invitation_token: invitationToken,
                invitation_expires_at: invitationExpiresAt.toISOString(),
                invited_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    private generateInvitationToken(): string {
        return randomBytes(32).toString('hex');
    }
}
