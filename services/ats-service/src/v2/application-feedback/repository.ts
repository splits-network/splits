/**
 * Application Feedback Repository - V2
 * Direct Supabase queries with role-based access control
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { ApplicationFeedbackFilters, ApplicationFeedbackCreate, ApplicationFeedbackUpdate } from './types';
import { ApplicationFeedback } from '@splits-network/shared-types';
import { StandardListResponse, PaginationResponse } from '@splits-network/shared-types';

export class ApplicationFeedbackRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * List feedback for an application with role-based filtering
     */
    async list(
        clerkUserId: string,
        filters: ApplicationFeedbackFilters
    ): Promise<StandardListResponse<ApplicationFeedback>> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        const { page = 1, limit = 50 } = filters;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('application_feedback')
            .select('*, created_by:users!created_by_user_id(id, name, email)', { count: 'exact' });

        // Filter by application_id if provided
        if (filters.application_id) {
            query = query.eq('application_id', filters.application_id);
        }

        // Role-based filtering
        if (context.roles.includes('candidate')) {
            // Candidates can see feedback on their own applications
            const { data: applications } = await this.supabase
                .from('applications')
                .select('id')
                .eq('candidate_id', context.candidateId!);

            const applicationIds = applications?.map(a => a.id) || [];
            if (applicationIds.length === 0) {
                return {
                    data: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        total_pages: 0
                    }
                };
            }
            query = query.in('application_id', applicationIds);
        } else if (context.roles.includes('recruiter')) {
            // Recruiters can see feedback on their candidates' applications
            const { data: applications } = await this.supabase
                .from('applications')
                .select('id, candidate_id')
                .eq('candidate_recruiter_id', context.recruiterId!);

            const applicationIds = applications?.map(a => a.id) || [];
            if (applicationIds.length === 0) {
                return {
                    data: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        total_pages: 0
                    }
                };
            }
            query = query.in('application_id', applicationIds);
        }
        // Platform admins see all (no filter)

        // Apply additional filters
        if (filters.feedback_type) {
            query = query.eq('feedback_type', filters.feedback_type);
        }
        if (filters.created_by_type) {
            query = query.eq('created_by_type', filters.created_by_type);
        }
        if (filters.in_response_to_id) {
            query = query.eq('in_response_to_id', filters.in_response_to_id);
        }

        // Pagination and sorting
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            throw new Error(`Failed to fetch application feedback: ${error.message}`);
        }

        return {
            data: data || [],
            pagination: {
                total: count || 0,
                page,
                limit,
                total_pages: Math.ceil((count || 0) / limit)
            }
        };
    }

    /**
     * Get single feedback by ID with role-based access control
     */
    async getById(
        id: string,
        clerkUserId: string
    ): Promise<ApplicationFeedback | null> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .from('application_feedback')
            .select('*, created_by:users!created_by_user_id(id, name, email)')
            .eq('id', id)
            .single();

        const { data, error } = await query;

        if (error || !data) {
            return null;
        }

        // Verify user has access to this feedback
        if (context.roles.includes('candidate')) {
            const { data: application } = await this.supabase
                .from('applications')
                .select('candidate_id')
                .eq('id', data.application_id)
                .single();

            if (!application || application.candidate_id !== context.candidateId) {
                throw new Error('Access denied to this feedback');
            }
        } else if (context.roles.includes('recruiter')) {
            const { data: application } = await this.supabase
                .from('applications')
                .select('candidate_recruiter_id')
                .eq('id', data.application_id)
                .single();

            if (!application || application.candidate_recruiter_id !== context.recruiterId) {
                throw new Error('Access denied to this feedback');
            }
        }

        return data;
    }

    /**
     * Create new feedback
     */
    async create(
        clerkUserId: string,
        data: ApplicationFeedbackCreate
    ): Promise<ApplicationFeedback> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Verify user has access to this application
        const { data: application } = await this.supabase
            .from('applications')
            .select('id, candidate_id, candidate_recruiter_id')
            .eq('id', data.application_id)
            .single();

        if (!application) {
            throw new Error('Application not found');
        }

        // Validate created_by_user_id matches context
        if (data.created_by_user_id !== context.identityUserId) {
            throw new Error('created_by_user_id must match authenticated user');
        }

        // Validate created_by_type matches user role
        if (context.roles.includes('candidate') && data.created_by_type !== 'candidate') {
            throw new Error('Candidate users must use created_by_type: candidate');
        } else if (context.roles.includes('recruiter') && data.created_by_type !== 'candidate_recruiter') {
            throw new Error('Recruiter users must use created_by_type: candidate_recruiter');
        } else if (context.roles.includes('platform_admin') && data.created_by_type !== 'platform_admin') {
            throw new Error('Platform admin users must use created_by_type: platform_admin');
        }

        // Insert feedback
        const { data: feedback, error } = await this.supabase
            .from('application_feedback')
            .insert({
                application_id: data.application_id,
                created_by_user_id: data.created_by_user_id,
                created_by_type: data.created_by_type,
                feedback_type: data.feedback_type,
                message_text: data.message_text,
                in_response_to_id: data.in_response_to_id || null,
            })
            .select('*, created_by:users!created_by_user_id(id, name, email)')
            .single();

        if (error) {
            throw new Error(`Failed to create application feedback: ${error.message}`);
        }

        return feedback;
    }

    /**
     * Update feedback (only message text can be updated)
     */
    async update(
        id: string,
        clerkUserId: string,
        updates: ApplicationFeedbackUpdate
    ): Promise<ApplicationFeedback> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Get existing feedback
        const existing = await this.getById(id, clerkUserId);
        if (!existing) {
            throw new Error('Feedback not found or access denied');
        }

        // Only creator can update
        if (existing.created_by_user_id !== context.identityUserId) {
            throw new Error('Only the creator can update this feedback');
        }

        const { data, error } = await this.supabase
            .from('application_feedback')
            .update({
                message_text: updates.message_text,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select('*, created_by:users!created_by_user_id(id, name, email)')
            .single();

        if (error) {
            throw new Error(`Failed to update application feedback: ${error.message}`);
        }

        return data;
    }

    /**
     * Delete feedback (soft delete by creator only)
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Get existing feedback
        const existing = await this.getById(id, clerkUserId);
        if (!existing) {
            throw new Error('Feedback not found or access denied');
        }

        // Only creator or platform admin can delete
        if (existing.created_by_user_id !== context.identityUserId && !context.roles.includes('platform_admin')) {
            throw new Error('Only the creator or platform admin can delete this feedback');
        }

        const { error } = await this.supabase
            .from('application_feedback')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete application feedback: ${error.message}`);
        }
    }
}
