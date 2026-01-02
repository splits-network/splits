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
        this.supabase = createClient(supabaseUrl, supabaseKey);
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

        // Build query with enriched data
        let query = this.supabase
            .schema('network')
            .from('recruiter_candidates')
            .select('*', { count: 'exact' });

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

        if (error) throw error;

        const relationships = data || [];
        await this.enrichRecruiterDetails(relationships);

        return {
            data: relationships,
            total: count || 0,
        };
    }

    async findRecruiterCandidate(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('recruiter_candidates')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        if (!data) {
            return null;
        }

        await this.enrichRecruiterDetails([data]);
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

    async findByInvitationToken(token: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('network')
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
            .schema('network')
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

    async enrichSingleRelationship(relationship: any): Promise<any> {
        if (!relationship) {
            return relationship;
        }
        const records = [relationship];
        await this.enrichRecruiterDetails(records);
        return records[0];
    }

    private async enrichRecruiterDetails(records: any[]): Promise<void> {
        if (!records.length) {
            return;
        }

        const recruiterIds = Array.from(
            new Set(
                records
                    .map((rel) => rel.recruiter_id)
                    .filter((id): id is string => Boolean(id))
            )
        );

        if (!recruiterIds.length) {
            return;
        }

        const { data: recruiters } = await this.supabase
            .schema('network')
            .from('recruiters')
            .select('id, user_id, bio, status')
            .in('id', recruiterIds);

        if (!recruiters || recruiters.length === 0) {
            return;
        }

        const recruiterMap = new Map<string, (typeof recruiters)[number]>();
        const userIds = new Set<string>();
        recruiters.forEach((recruiter) => {
            recruiterMap.set(recruiter.id, recruiter);
            if (recruiter.user_id) {
                userIds.add(recruiter.user_id);
            }
        });

        const userMap = new Map<string, { id: string; name?: string; email?: string }>();
        if (userIds.size > 0) {
            const { data: users } = await this.supabase
                .schema('identity')
                .from('users')
                .select('id, name, email')
                .in('id', Array.from(userIds));

            users?.forEach((user) => userMap.set(user.id, user));
        }

        records.forEach((rel) => {
            const recruiter = recruiterMap.get(rel.recruiter_id);
            if (!recruiter) {
                return;
            }

            const recruiterUser = recruiter.user_id ? userMap.get(recruiter.user_id) : undefined;

            if (!rel.recruiter_name && recruiterUser?.name) {
                rel.recruiter_name = recruiterUser.name;
            }

            if (!rel.recruiter_email && recruiterUser?.email) {
                rel.recruiter_email = recruiterUser.email;
            }

            if (!rel.recruiter_bio && recruiter.bio) {
                rel.recruiter_bio = recruiter.bio;
            }

            if (!rel.recruiter_status && recruiter.status) {
                rel.recruiter_status = recruiter.status;
            }
        });
    }
}
