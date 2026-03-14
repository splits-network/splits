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
    private buildSelectClause(_include?: string): string {
        // Always include both candidate and recruiter joins — these are fundamental
        // relationship data, not optional enrichment. The recruiter's name/email are
        // needed by every consumer (dashboard, list views, etc.).
        return [
            '*',
            'candidate:candidates!candidate_id!inner(id, user_id, email, full_name, phone, location, linkedin_url, user:users!candidates_user_id_fkey(name, email))',
            'recruiter:recruiters!recruiter_id(id, user_id, bio, status, user:users!recruiters_user_id_fkey(name, email))',
        ].join(',');
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

        // Consent status filter
        if (filters.consent_status === 'given') {
            query = query.eq('consent_given', true);
        } else if (filters.consent_status === 'pending') {
            query = query.eq('consent_given', false).is('declined_at', null);
        } else if (filters.consent_status === 'declined') {
            query = query.not('declined_at', 'is', null);
        }
        // Expiry status filter
        if (filters.expiry_status === 'active') {
            query = query.gte('invitation_expires_at', new Date().toISOString());
        } else if (filters.expiry_status === 'expired') {
            query = query.lt('invitation_expires_at', new Date().toISOString()).not('invitation_expires_at', 'is', null);
        } else if (filters.expiry_status === 'no_expiry') {
            query = query.is('invitation_expires_at', null);
        }


        // Apply full-text search across all indexed fields
        // Searches: name, email, location, status with intelligent ranking
        // Example: "brandon active engineer" matches any Brandon who is active or has engineering keywords
        if (search) {
            // Use PostgreSQL full-text search with tsquery
            // Normalize special chars to match indexing, then AND-join for tsquery
            const tsquery = search.replace(/[@+._\-\/:]/g, ' ').trim().split(/\s+/).filter(t => t).join(' & ');
            query = query.textSearch('search_vector', tsquery, {
                type: 'websearch',
                config: 'english'
            });
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

    async findExistingRelationship(recruiterId: string, candidateId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('recruiter_candidates')
            .select('*')
            .eq('recruiter_id', recruiterId)
            .eq('candidate_id', candidateId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
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
                ,recruiter:recruiters!recruiter_id(id, user_id, bio, status, user:users!recruiters_user_id_fkey(name, email))
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
