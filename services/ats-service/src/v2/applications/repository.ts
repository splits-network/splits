/**
 * Application Repository
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApplicationFilters, ApplicationUpdate } from './types';
import { resolveAccessContext, AccessContext } from '../shared/access';
import { create } from 'domain';
import { parseFilters, StandardListParams, StandardListResponse } from '@splits-network/shared-types';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export class ApplicationRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    async findApplications(
        clerkUserId: string,
        params: StandardListParams = {}
    ): Promise<StandardListResponse<any>> {
        const page = params.page || 1;
        const limit = params.limit || 25;
        const offset = (page - 1) * limit;
        let filters: Record<string, any> = {};
        filters = typeof params.filters === 'string' ? parseFilters(params.filters) : (params.filters || {});
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        // Build select clause with optional includes
        const selectClause = this.buildSelectClause(params.include);

        // Build query with enriched data
        let query = this.supabase
            .from('applications')
            .select(selectClause, { count: 'exact' });


        if (accessContext.candidateId) {
            query = query.eq('candidate_id', accessContext.candidateId);
        } else if (accessContext.recruiterId) {
            query = query.eq('recruiter_id', accessContext.recruiterId);
        } else if (!accessContext.isPlatformAdmin) {
            if (accessContext.organizationIds.length > 0) {
                query = query.in('job.company.identity_organization_id', accessContext.organizationIds);
                // Company admins and hiring managers only see applications in company-relevant stages
                query = query.in('stage', ['submitted', 'interview', 'offer', 'hired', 'rejected']);
            } else {
                return {
                    data: [],
                    pagination: {
                        page: 1,
                        limit,
                        total: 0,
                        total_pages: 0
                    }
                };
            }
        }

        // Apply filters
        if (filters.search) {
            query = query.or(`notes.ilike.%${filters.search}%`);
        }
        if (filters.stage) {
            query = query.eq('stage', filters.stage);
        }
        if (filters.stage) {
            query = query.eq('stage', filters.stage);
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

        if (error) {
            throw error;
        }

        return {
            data: data || [],
            pagination: {
                page,
                limit,
                total_pages: Math.ceil((count || 0) / limit),
                total: count || 0,
            },
        };
    }

    async findApplication(id: string, clerkUserId?: string, include?: string): Promise<any | null> {
        // Build select clause with optional includes
        const selectClause = this.buildSelectClause(include);

        const { data, error } = await this.supabase
            .from('applications')
            .select(selectClause)
            .eq('id', id)
            .single();

        if (error) {
            console.error('findApplication error:', error);
            if (error.code === 'PGRST116') return null;
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        // If no clerkUserId or internal service, skip access control
        if (!data || !clerkUserId || clerkUserId === 'internal-service') {
            return data;
        }

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        if (accessContext.isPlatformAdmin) {
            return data;
        }

        if (accessContext.candidateId && (data as any).candidate_id === accessContext.candidateId) {
            return data;
        }

        if (accessContext.recruiterId && (data as any).recruiter_id === accessContext.recruiterId) {
            return data;
        }

        const companyOrgId = (data as any).job?.company?.identity_organization_id;
        if (
            companyOrgId &&
            accessContext.organizationIds.length > 0 &&
            accessContext.organizationIds.includes(companyOrgId)
        ) {
            return data;
        }

        return null;
    }

    async createApplication(application: any, clerkUserId?: string): Promise<any> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        // If candidate is submitting (not recruiter), lookup their active recruiter
        let recruiterId = accessContext.recruiterId || null;
        if (!recruiterId && application.candidate_id) {
            const { data: recruiterRelationship } = await this.supabase

                .from('recruiter_candidates')
                .select('recruiter_id')
                .eq('candidate_id', application.candidate_id)
                .eq('status', 'active')
                .single();

            if (recruiterRelationship) {
                recruiterId = recruiterRelationship.recruiter_id;
            }
        }
        const { data, error } = await this.supabase

            .from('applications')
            .insert({ ...application, recruiter_id: recruiterId })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateApplication(id: string, updates: ApplicationUpdate): Promise<any> {
        const { data, error } = await this.supabase

            .from('applications')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteApplication(id: string): Promise<void> {
        // Soft delete - move to withdrawn stage
        const { error } = await this.supabase

            .from('applications')
            .update({ stage: 'withdrawn', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    async getCandidateById(candidateId: string): Promise<any | null> {
        if (!candidateId) {
            return null;
        }

        const { data, error } = await this.supabase

            .from('candidates')
            .select('*')
            .eq('id', candidateId)
            .maybeSingle();

        if (error) throw error;
        return data ?? null;
    }

    async getJobById(jobId: string): Promise<any | null> {
        if (!jobId) return null;

        const { data, error } = await this.supabase

            .from('jobs')
            .select(
                `
                *,
                company:companies(*)
            `
            )
            .eq('id', jobId)
            .maybeSingle();

        if (error) throw error;
        return data ?? null;
    }

    /**
     * Get documents for an application (polymorphic association)
     * Documents use entity_type + entity_id pattern
     */
    // this appears to be a duplicate of a method in the same file. Commenting out.
    // async getDocumentsForApplication(applicationId: string): Promise<any[]> {
    //     const { data, error } = await this.supabase

    //         .from('documents')
    //         .select('id, filename, storage_path, content_type, file_size, created_at')
    //         .eq('entity_type', 'application')
    //         .eq('entity_id', applicationId)
    //         .is('deleted_at', null);

    //     if (error) throw error;
    //     return data || [];
    // }

    /**
     * Build select clause with optional includes
     * Supports: candidate, job, recruiter, documents, pre_screen_answers, audit_log, job_requirements, ai_review
     */
    private buildSelectClause(include?: string): string {
        // Base fields - always include related candidate and job with company
        const baseFields = `*,
            candidate:candidates(id, full_name, email, phone, location),
            job:jobs(*, company:companies(id, name, website, industry, identity_organization_id), job_requirements:job_requirements(*))`;

        if (!include) {
            return baseFields;
        }

        const includes = include.split(',').map(i => i.trim());
        let selectClause = baseFields;

        for (const inc of includes) {
            switch (inc) {
                case 'recruiter':
                    // Join with network schema recruiters table and identity users for contact info
                    selectClause += `,recruiter:recruiters(id, bio, phone, specialties, status, user_id, user:users(name, email))`;
                    break;
                case 'documents':
                case 'document':
                    // Documents use polymorphic association (entity_type + entity_id)
                    // Cannot use Supabase join syntax - must query separately in service layer
                    // Skip in SELECT clause
                    break;
                case 'pre_screen_answers':
                case 'pre-screen-answers':
                    // Join with pre-screen answers (one-to-many relationship via application_id)
                    selectClause += `,pre_screen_answers:job_pre_screen_answers!application_id(id, question_id, answer, created_at, question:job_pre_screen_questions(question, question_type, is_required))`;
                    break;
                case 'audit_log':
                case 'audit':
                    // Audit log - comprehensive activity trail
                    selectClause += `,audit_log:application_audit_log!application_id(id, action, performed_by_user_id, performed_by_role, company_id, old_value, new_value, metadata, ip_address, user_agent, created_at)`;
                    break;
                case 'job_requirements':
                    // Requirements are part of the job - already fetched with job.requirements
                    // This is a separate query via getJobRequirements if needed
                    break;
                case 'ai_review':
                case 'ai-review':
                    // AI reviews use one-to-one relationship but must be queried separately
                    // Cannot use Supabase join syntax - must query in service layer
                    // Skip in SELECT clause
                    break;
            }
        }

        return selectClause;
    }

    async getRecruiterById(recruiterId: string): Promise<any | null> {
        if (!recruiterId) return null;

        const { data, error } = await this.supabase

            .from('recruiters')
            .select('*')
            .eq('id', recruiterId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        // Fetch associated identity user for contact info
        let userInfo: { name?: string; email?: string; phone?: string } | undefined = undefined;
        if (data.user_id) {
            const { data: identityUser } = await this.supabase

                .from('users')
                .select('id, name, email')
                .eq('id', data.user_id)
                .maybeSingle();

            if (identityUser) {
                userInfo = identityUser;
            }
        }

        // Flatten structure for easy access in UI
        // Try to get name from: identity user > recruiter.name > first_name/last_name > empty
        let name = userInfo?.name || data.name || '';
        if (!name && (data.first_name || data.last_name)) {
            name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
        }
        const nameParts = name.split(' ').filter(Boolean);

        return {
            ...data,
            user: userInfo,
            // Flatten user info for direct access
            first_name: nameParts[0] || data.first_name || '',
            last_name: nameParts.slice(1).join(' ') || data.last_name || '',
            email: userInfo?.email || data.email || null,
            phone: userInfo?.phone || data.phone || null,
            recruiter_name: name || `Recruiter ${recruiterId.substring(0, 8)}`,
        };
    }

    async getDocumentsForApplication(applicationId: string): Promise<any[]> {
        const { data, error } = await this.supabase

            .from('documents')
            .select('*')
            .eq('entity_type', 'application')
            .eq('entity_id', applicationId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(doc => ({
            ...doc,
            file_name: doc.filename,
            file_size: doc.file_size,
            file_url: doc.storage_path,
            uploaded_at: doc.created_at,
            is_primary: doc.metadata?.is_primary || false,
        }));
    }

    async getPreScreenAnswersForApplication(applicationId: string): Promise<any[]> {
        const { data, error } = await this.supabase

            .from('job_pre_screen_answers')
            .select(
                `
                *,
                question:job_pre_screen_questions(*)
            `
            )
            .eq('application_id', applicationId);

        if (error) throw error;
        return data || [];
    }

    async savePreScreenAnswer(answer: {
        application_id: string;
        question_id: string;
        answer: any;
    }): Promise<any> {
        // Use UPSERT to handle application updates - update answer if it exists
        const { data, error } = await this.supabase

            .from('job_pre_screen_answers')
            .upsert(answer, {
                onConflict: 'application_id,question_id',
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getJobRequirements(jobId: string): Promise<any[]> {
        if (!jobId) return [];

        const { data, error } = await this.supabase

            .from('job_requirements')
            .select('*')
            .eq('job_id', jobId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async getAIReviewForApplication(applicationId: string): Promise<any | null> {
        if (!applicationId) {
            return null;
        }

        const { data, error } = await this.supabase

            .from('ai_reviews')
            .select('*')
            .eq('application_id', applicationId)
            .maybeSingle();

        if (error) throw error;
        return data ?? null;
    }

    async getAuditLogsForApplication(applicationId: string): Promise<any[]> {
        const { data, error } = await this.supabase

            .from('application_audit_log')
            .select('*')
            .eq('application_id', applicationId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async resolveAccess(clerkUserId: string): Promise<AccessContext> {
        return resolveAccessContext(this.supabase, clerkUserId);
    }

    async findCandidateByClerkUserId(clerkUserId: string): Promise<any | null> {
        if (!clerkUserId) {
            return null;
        }

        const { data: identityUser, error: identityError } = await this.supabase

            .from('users')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .maybeSingle();

        if (identityError) throw identityError;
        if (!identityUser) {
            return null;
        }

        const { data, error } = await this.supabase

            .from('candidates')
            .select('*')
            .eq('user_id', identityUser.id)
            .maybeSingle();

        if (error) throw error;
        return data ?? null;
    }

    async findUserByClerkUserId(clerkUserId: string): Promise<any | null> {
        const { data, error } = await this.supabase

            .from('users')
            .select('id, email, name')
            .eq('clerk_user_id', clerkUserId)
            .maybeSingle();

        if (error) throw error;
        return data ?? null;
    }

    async findApplicationById(id: string): Promise<any | null> {
        const { data, error } = await this.supabase

            .from('applications')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data ?? null;
    }

    async linkDocumentToApplication(
        documentId: string,
        applicationId: string,
        isPrimary: boolean
    ): Promise<void> {
        const { data: originalDoc, error: fetchError } = await this.supabase
            .from('documents')
            .select('*')
            .eq('id', documentId)
            .maybeSingle();

        if (fetchError || !originalDoc) {
            throw new Error(`Document ${documentId} not found`);
        }

        const { error: insertError } = await this.supabase
            .from('documents')
            .insert({
                entity_type: 'application',
                entity_id: applicationId,
                document_type: originalDoc.document_type,
                filename: originalDoc.filename,
                storage_path: originalDoc.storage_path,
                bucket_name: originalDoc.bucket_name,
                content_type: originalDoc.content_type,
                file_size: originalDoc.file_size,
                uploaded_by_user_id: originalDoc.uploaded_by_user_id,
                processing_status: originalDoc.processing_status,
                processing_started_at: originalDoc.processing_started_at,
                processing_completed_at: originalDoc.processing_completed_at,
                processing_error: originalDoc.processing_error,
                metadata: {
                    ...originalDoc.metadata,
                    is_primary: isPrimary,
                    original_document_id: documentId,
                },
            });

        if (insertError) throw insertError;
    }

    async unlinkApplicationDocuments(applicationId: string): Promise<void> {
        // Soft delete all documents linked to this application
        const { error } = await this.supabase

            .from('documents')
            .update({ deleted_at: new Date().toISOString() })
            .eq('entity_type', 'application')
            .eq('entity_id', applicationId)
            .is('deleted_at', null);

        if (error) throw error;
    }

    async createAuditLog(log: {
        application_id: string;
        action: string;
        performed_by_user_id: string;
        performed_by_role: string;
        old_value?: any;
        new_value?: any;
        metadata?: any;
    }): Promise<void> {
        const { error } = await this.supabase
            .from('application_audit_log')
            .insert({
                application_id: log.application_id,
                action: log.action,
                performed_by_user_id: log.performed_by_user_id,
                performed_by_role: log.performed_by_role,
                old_value: log.old_value,
                new_value: log.new_value,
                metadata: log.metadata,
            });

        if (error) throw error;
    }

    /**
     * Batch fetch AI reviews for multiple applications
     */
    async batchGetAIReviews(applicationIds: string[]): Promise<any[]> {
        if (!applicationIds || applicationIds.length === 0) {
            return [];
        }

        const { data, error } = await this.supabase

            .from('ai_reviews')
            .select('*')
            .in('application_id', applicationIds);

        if (error) throw error;
        return data || [];
    }

    /**
     * Batch fetch documents for multiple applications
     */
    async batchGetDocuments(applicationIds: string[]): Promise<any[]> {
        if (!applicationIds || applicationIds.length === 0) {
            return [];
        }

        const { data, error } = await this.supabase

            .from('documents')
            .select('*')
            .eq('entity_type', 'application')
            .in('entity_id', applicationIds)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(doc => ({
            ...doc,
            file_name: doc.filename,
            file_size: doc.file_size,
            file_url: doc.storage_path,
            uploaded_at: doc.created_at,
            is_primary: doc.metadata?.is_primary || false,
        }));
    }
}
