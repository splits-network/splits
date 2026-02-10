/**
 * Application Notes Repository - V2
 * Direct Supabase queries with role-based access control and visibility filtering
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { ApplicationNoteFilters, ApplicationNoteCreate, ApplicationNoteUpdate, ApplicationNote } from './types';
import { StandardListResponse } from '@splits-network/shared-types';

// Define which creator types are on the candidate side vs company side
const CANDIDATE_SIDE_TYPES = ['candidate', 'candidate_recruiter'] as const;
const COMPANY_SIDE_TYPES = ['company_recruiter', 'hiring_manager', 'company_admin'] as const;

export class ApplicationNoteRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * Determine if the user is on the candidate side of an application
     */
    private async isOnCandidateSide(
        context: Awaited<ReturnType<typeof resolveAccessContext>>,
        applicationId: string
    ): Promise<boolean> {
        // Platform admins see everything
        if (context.roles.includes('platform_admin')) {
            return true; // They see all visibilities
        }

        // Check if user is the candidate
        if (context.candidateId) {
            const { data } = await this.supabase
                .from('applications')
                .select('candidate_id')
                .eq('id', applicationId)
                .single();

            if (data?.candidate_id === context.candidateId) {
                return true;
            }
        }

        // Check if user is the assigned candidate recruiter
        if (context.recruiterId) {
            const { data } = await this.supabase
                .from('applications')
                .select('candidate_recruiter_id')
                .eq('id', applicationId)
                .single();

            if (data?.candidate_recruiter_id === context.recruiterId) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine if the user is on the company side of an application
     */
    private async isOnCompanySide(
        context: Awaited<ReturnType<typeof resolveAccessContext>>,
        applicationId: string
    ): Promise<boolean> {
        // Platform admins see everything
        if (context.roles.includes('platform_admin')) {
            return true;
        }

        // Company users can see applications for jobs at their company
        if (context.companyIds && context.companyIds.length > 0) {
            // Get the application's job
            const { data: app } = await this.supabase
                .from('applications')
                .select('job_id')
                .eq('id', applicationId)
                .single();

            if (app?.job_id) {
                // Check if job belongs to user's company
                const { data: job } = await this.supabase
                    .from('jobs')
                    .select('company_id')
                    .eq('id', app.job_id)
                    .single();

                if (job?.company_id && context.companyIds.includes(job.company_id)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Get visibility filter based on user's side
     */
    private async getVisibilityFilter(
        context: Awaited<ReturnType<typeof resolveAccessContext>>,
        applicationId: string
    ): Promise<string[]> {
        // Platform admin sees all
        if (context.roles.includes('platform_admin')) {
            return ['shared', 'company_only', 'candidate_only'];
        }

        const isCandidateSide = await this.isOnCandidateSide(context, applicationId);
        const isCompanySide = await this.isOnCompanySide(context, applicationId);

        // If on both sides (unlikely but possible), see all
        if (isCandidateSide && isCompanySide) {
            return ['shared', 'company_only', 'candidate_only'];
        }

        // Candidate side sees shared + candidate_only
        if (isCandidateSide) {
            return ['shared', 'candidate_only'];
        }

        // Company side sees shared + company_only
        if (isCompanySide) {
            return ['shared', 'company_only'];
        }

        // Default: only shared (shouldn't happen for authorized users)
        return ['shared'];
    }

    /**
     * List notes for an application with role-based filtering and visibility control
     */
    async list(
        clerkUserId: string,
        filters: ApplicationNoteFilters
    ): Promise<StandardListResponse<ApplicationNote>> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        const { page = 1, limit = 50 } = filters;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('application_notes')
            .select('*, created_by:users!created_by_user_id(id, name, email)', { count: 'exact' });

        // Filter by application_id if provided
        if (filters.application_id) {
            query = query.eq('application_id', filters.application_id);

            // Apply visibility filtering based on user's role
            const allowedVisibilities = await this.getVisibilityFilter(context, filters.application_id);
            query = query.in('visibility', allowedVisibilities);
        } else {
            // No specific application - get all accessible applications based on role
            if (context.roles.includes('candidate')) {
                // Candidates can see notes on their own applications
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
                // Candidate sees shared and candidate_only
                query = query.in('visibility', ['shared', 'candidate_only']);
            } else if (context.roles.includes('recruiter')) {
                // Recruiters can see notes on their candidates' applications
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
                // Candidate-side recruiter sees shared and candidate_only
                query = query.in('visibility', ['shared', 'candidate_only']);
            } else if (context.companyIds && context.companyIds.length > 0) {
                // Company users see notes on applications to their company's jobs
                // First get jobs for user's companies
                const { data: jobs } = await this.supabase
                    .from('jobs')
                    .select('id')
                    .in('company_id', context.companyIds);

                const jobIds = jobs?.map(j => j.id) || [];
                if (jobIds.length === 0) {
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

                // Then get applications for those jobs
                const { data: applications } = await this.supabase
                    .from('applications')
                    .select('id')
                    .in('job_id', jobIds);

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
                // Company side sees shared and company_only
                query = query.in('visibility', ['shared', 'company_only']);
            }
            // Platform admins see all (no filter)
        }

        // Apply additional filters
        if (filters.note_type) {
            query = query.eq('note_type', filters.note_type);
        }
        if (filters.created_by_type) {
            query = query.eq('created_by_type', filters.created_by_type);
        }
        if (filters.in_response_to_id) {
            query = query.eq('in_response_to_id', filters.in_response_to_id);
        }
        if (filters.visibility) {
            query = query.eq('visibility', filters.visibility);
        }

        // Pagination and sorting (chronological order for notes - oldest first)
        query = query
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            throw new Error(`Failed to fetch application notes: ${error.message}`);
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
     * Get single note by ID with role-based access control
     */
    async getById(
        id: string,
        clerkUserId: string
    ): Promise<ApplicationNote | null> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        const { data, error } = await this.supabase
            .from('application_notes')
            .select('*, created_by:users!created_by_user_id(id, name, email)')
            .eq('id', id)
            .single();

        if (error || !data) {
            return null;
        }

        // Check visibility access
        const allowedVisibilities = await this.getVisibilityFilter(context, data.application_id);
        if (!allowedVisibilities.includes(data.visibility)) {
            throw new Error('Access denied to this note');
        }

        return data;
    }

    /**
     * Validate that the created_by_type matches the user's actual role
     */
    private getCreatorTypeForRole(context: Awaited<ReturnType<typeof resolveAccessContext>>): string[] {
        const validTypes: string[] = [];

        // Check for candidate - either by role or by having a candidateId
        if (context.roles.includes('candidate') || context.candidateId) {
            validTypes.push('candidate');
        }
        // Check for recruiter - either by role or by having a recruiterId
        if (context.roles.includes('recruiter') || context.recruiterId) {
            // Recruiters can be either candidate_recruiter or company_recruiter depending on context
            validTypes.push('candidate_recruiter', 'company_recruiter');
        }
        if (context.roles.includes('hiring_manager')) {
            validTypes.push('hiring_manager');
        }
        if (context.roles.includes('company_admin')) {
            validTypes.push('company_admin');
        }
        // Company users can act as company_admin for notes
        if (context.companyIds && context.companyIds.length > 0) {
            validTypes.push('company_admin', 'hiring_manager');
        }
        if (context.roles.includes('platform_admin')) {
            validTypes.push('platform_admin');
        }

        return validTypes;
    }

    /**
     * Validate visibility based on creator type
     * Candidate-side users can only set shared or candidate_only
     * Company-side users can only set shared or company_only
     */
    private validateVisibility(creatorType: string, visibility: string): boolean {
        if (CANDIDATE_SIDE_TYPES.includes(creatorType as any)) {
            return visibility === 'shared' || visibility === 'candidate_only';
        }
        if (COMPANY_SIDE_TYPES.includes(creatorType as any)) {
            return visibility === 'shared' || visibility === 'company_only';
        }
        // Platform admin can set any visibility
        if (creatorType === 'platform_admin') {
            return true;
        }
        return false;
    }

    /**
     * Create new note
     */
    async create(
        clerkUserId: string,
        data: ApplicationNoteCreate
    ): Promise<ApplicationNote> {
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

        // Use the authenticated user's identity (don't trust user-submitted data)
        const createdByUserId = context.identityUserId;

        // Validate created_by_type matches user role
        const validTypes = this.getCreatorTypeForRole(context);
        if (!validTypes.includes(data.created_by_type)) {
            throw new Error(`Invalid created_by_type: ${data.created_by_type}. Valid types for your role: ${validTypes.join(', ')}`);
        }

        // Validate visibility based on creator type
        if (!this.validateVisibility(data.created_by_type, data.visibility)) {
            throw new Error(`Invalid visibility '${data.visibility}' for creator type '${data.created_by_type}'`);
        }

        // Insert note - use authenticated user's identity from context
        const { data: note, error } = await this.supabase
            .from('application_notes')
            .insert({
                application_id: data.application_id,
                created_by_user_id: createdByUserId,
                created_by_type: data.created_by_type,
                note_type: data.note_type,
                visibility: data.visibility,
                message_text: data.message_text,
                in_response_to_id: data.in_response_to_id || null,
            })
            .select('*, created_by:users!created_by_user_id(id, name, email)')
            .single();

        if (error) {
            throw new Error(`Failed to create application note: ${error.message}`);
        }

        return note;
    }

    /**
     * Update note (message text and visibility can be updated)
     */
    async update(
        id: string,
        clerkUserId: string,
        updates: ApplicationNoteUpdate
    ): Promise<ApplicationNote> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Get existing note
        const existing = await this.getById(id, clerkUserId);
        if (!existing) {
            throw new Error('Note not found or access denied');
        }

        // Only creator can update
        if (existing.created_by_user_id !== context.identityUserId) {
            throw new Error('Only the creator can update this note');
        }

        // Validate visibility if being updated
        if (updates.visibility && !this.validateVisibility(existing.created_by_type, updates.visibility)) {
            throw new Error(`Invalid visibility '${updates.visibility}' for creator type '${existing.created_by_type}'`);
        }

        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (updates.message_text !== undefined) {
            updateData.message_text = updates.message_text;
        }
        if (updates.visibility !== undefined) {
            updateData.visibility = updates.visibility;
        }

        const { data, error } = await this.supabase
            .from('application_notes')
            .update(updateData)
            .eq('id', id)
            .select('*, created_by:users!created_by_user_id(id, name, email)')
            .single();

        if (error) {
            throw new Error(`Failed to update application note: ${error.message}`);
        }

        return data;
    }

    /**
     * Delete note (by creator only or platform admin)
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Get existing note
        const existing = await this.getById(id, clerkUserId);
        if (!existing) {
            throw new Error('Note not found or access denied');
        }

        // Only creator or platform admin can delete
        if (existing.created_by_user_id !== context.identityUserId && !context.roles.includes('platform_admin')) {
            throw new Error('Only the creator or platform admin can delete this note');
        }

        const { error } = await this.supabase
            .from('application_notes')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete application note: ${error.message}`);
        }
    }
}
