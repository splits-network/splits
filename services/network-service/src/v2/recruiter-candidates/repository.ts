/**
 * Recruiter-Candidate Repository
 * Direct Supabase queries for recruiter-candidate relationship domain
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { RecruiterCandidateFilters, RecruiterCandidateUpdate, RepositoryListResponse } from './types';
import { resolveAccessContext } from '../shared/access';

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
        const baseFields = '*';

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
                case 'candidate':
                    // Join with candidates table and identity users for contact info
                    selectClause += ',candidate:candidates!candidate_id(id, user_id, full_name, phone, location, linkedin_url, user:users!candidates_user_id_fkey(name, email))';
                    break;
            }
        }

        return selectClause;
    }

    async findRecruiterCandidates(
        clerkUserId: string,
        filters: RecruiterCandidateFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const scopedFilters: RecruiterCandidateFilters = { ...filters };
        if (!accessContext.isPlatformAdmin) {
            if (accessContext.recruiterId) {
                scopedFilters.recruiter_id = accessContext.recruiterId;
            } else if (accessContext.candidateId) {
                scopedFilters.candidate_id = accessContext.candidateId;
            } else {
                return { data: [], total: 0 };
            }
        }

        // Build select clause with includes
        const selectClause = this.buildSelectClause(filters.include);

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
        if (scopedFilters.status) {
            query = query.eq('status', scopedFilters.status);
        }

        // Apply sorting
        const sortBy = scopedFilters.sort_by || 'created_at';
        const sortOrder = scopedFilters.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        console.log('findRecruiterCandidates error:', error);
        if (error) throw error;
        return {
            data: data || [],
            total: count || 0,
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
            .select('*')
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
