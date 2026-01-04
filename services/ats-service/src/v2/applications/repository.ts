/**
 * Application Repository
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApplicationFilters, ApplicationUpdate } from './types';
import { resolveAccessContext, AccessContext } from '../shared/access';
import { create } from 'domain';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export class ApplicationRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async findApplications(
        clerkUserId: string,
        filters: ApplicationFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        // Build query with enriched data
        let query = this.supabase
            .schema('ats')
            .from('applications')
            .select(`
                *,
                candidate:candidates(id, full_name, email, phone),
                job:jobs!inner(
                    id, 
                    title, 
                    status,
                    company:companies!inner(id, name, identity_organization_id)
                )
            `, { count: 'exact' });
        if (accessContext.candidateId) {
            query = query.eq('candidate_id', accessContext.candidateId);
        } else if (accessContext.recruiterId) {
            console.log('Filtering applications for recruiter:', accessContext.recruiterId);
            query = query.eq('recruiter_id', accessContext.recruiterId);
        } else if (!accessContext.isPlatformAdmin) {
            if (accessContext.organizationIds.length > 0) {
                query = query.in('job.company.identity_organization_id', accessContext.organizationIds);
            } else {
                return {
                    data: [],
                    total: 0,
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
            total: count || 0,
        };
    }

    async findApplication(id: string, clerkUserId?: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('applications')
            .select(`
                *,
                candidate:candidates(id, full_name, email, phone, location),
                job:jobs(
                    id, 
                    title, 
                    description,
                    status,
                    company:companies(id, name, description)
                )
            `)
            .eq('id', id)
            .single();
        if (error) {
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

        if (accessContext.candidateId && data.candidate_id === accessContext.candidateId) {
            return data;
        }
        
        if (accessContext.recruiterId && data.recruiter_id === accessContext.recruiterId) {
            return data;
        }

        const companyOrgId = data.job?.company?.identity_organization_id;
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
                .schema('network')
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
            .schema('ats')
            .from('applications')
            .insert({...application, recruiter_id: recruiterId })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateApplication(id: string, updates: ApplicationUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
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
            .schema('ats')
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
            .schema('ats')
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
            .schema('ats')
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

    async getRecruiterById(recruiterId: string): Promise<any | null> {
        if (!recruiterId) return null;

        const { data, error } = await this.supabase
            .schema('network')
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
                .schema('identity')
                .from('users')
                .select('id, name, email, phone')
                .eq('id', data.user_id)
                .maybeSingle();

            if (identityUser) {
                userInfo = identityUser;
            }
        }

        // Flatten structure for easy access in UI
        const name = userInfo?.name || data.name || '';
        const nameParts = name.split(' ');
        
        return {
            ...data,
            user: userInfo,
            // Flatten user info for direct access
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            email: userInfo?.email || data.email || null,
            phone: userInfo?.phone || data.phone || null,
        };
    }

    async getDocumentsForApplication(applicationId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .schema('documents')
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
            .schema('ats')
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
        // Use UPSERT to handle resubmissions - update answer if it exists
        const { data, error } = await this.supabase
            .schema('ats')
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
            .schema('ats')
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
            .schema('ats')
            .from('ai_reviews')
            .select('*')
            .eq('application_id', applicationId)
            .maybeSingle();

        if (error) throw error;
        return data ?? null;
    }

    async getAuditLogsForApplication(applicationId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .schema('ats')
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
            .schema('identity')
            .from('users')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .maybeSingle();

        if (identityError) throw identityError;
        if (!identityUser) {
            return null;
        }

        const { data, error } = await this.supabase
            .schema('ats')
            .from('candidates')
            .select('*')
            .eq('user_id', identityUser.id)
            .maybeSingle();

        if (error) throw error;
        return data ?? null;
    }

    async findUserByClerkUserId(clerkUserId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('identity')
            .from('users')
            .select('id, email, name')
            .eq('clerk_user_id', clerkUserId)
            .maybeSingle();

        if (error) throw error;
        return data ?? null;
    }

    async findApplicationById(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('ats')
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
            .schema('documents')
            .from('documents')
            .select('*')
            .eq('id', documentId)
            .maybeSingle();

        if (fetchError || !originalDoc) {
            throw new Error(`Document ${documentId} not found`);
        }

        const { error: insertError } = await this.supabase
            .schema('documents')
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
            .schema('documents')
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
            .schema('ats')
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
}
