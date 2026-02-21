/**
 * Applications Service - V2
 * Handles ALL application updates with smart validation
 */

import { ApplicationRepository } from './repository';
import { ApplicationFilters, ApplicationUpdate } from './types';
import { autoAssignRecruiter } from './recruiter-auto-assign';
import { IEventPublisher } from '../shared/events';
import { PaginationResponse, buildPaginationResponse, validatePaginationParams } from '../shared/pagination';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';

export class ApplicationServiceV2 {
    private accessResolver: AccessContextResolver;
    private supabase: SupabaseClient;
    constructor(
        private repository: ApplicationRepository,
        supabase: SupabaseClient,
        private eventPublisher?: IEventPublisher
    ) {
        this.supabase = supabase;
        this.accessResolver = new AccessContextResolver(supabase);
    }

    async getApplications(
        clerkUserId: string,
        filters: ApplicationFilters
    ): Promise<{
        data: any[];
        pagination: PaginationResponse<any>['pagination'];
    }> {
        const { page, limit } = validatePaginationParams(filters.page, filters.limit);

        const { data, pagination } = await this.repository.findApplications(clerkUserId, {
            ...filters,
            page,
            limit,
        });

        // Handle includes that require separate queries
        if (filters.include) {
            const includes = filters.include.split(',').map((i: any) => i.trim());

            // Batch fetch AI reviews if requested
            if (includes.includes('ai_review') || includes.includes('ai-review')) {
                const applicationIds = data.map((app: any) => app.id);
                const aiReviews = await this.repository.batchGetAIReviews(applicationIds);

                // Map reviews to applications
                const reviewMap = new Map(aiReviews.map(review => [review.application_id, review]));
                data.forEach((app: any) => {
                    app.ai_review = reviewMap.get(app.id) || null;
                });
            }

            // Handle documents if requested
            if (includes.includes('documents') || includes.includes('document')) {
                const applicationIds = data.map((app: any) => app.id);
                const documents = await this.repository.batchGetDocuments(applicationIds);

                // Map documents to applications
                const docMap = new Map<string, any[]>();
                documents.forEach((doc: any) => {
                    if (!docMap.has(doc.entity_id)) {
                        docMap.set(doc.entity_id, []);
                    }
                    docMap.get(doc.entity_id)!.push(doc);
                });
                data.forEach((app: any) => {
                    app.documents = docMap.get(app.id) || [];
                });
            }
        }

        return {
            data,
            pagination: pagination
        };
    }

    async getApplication(id: string, clerkUserId?: string, includes: string[] = []): Promise<any> {
        // Convert includes array to comma-separated string for repository
        const includeStr = includes.length > 0 ? includes.join(',') : undefined;

        // Repository handles most includes in the SELECT clause
        const application = await this.repository.findApplication(id, clerkUserId, includeStr);
        if (!application) {
            throw new Error(`Application ${id} not found`);
        }

        // Handle documents separately (polymorphic association can't be joined)
        if (includes.includes('documents') || includes.includes('document')) {
            application.documents = await this.repository.getDocumentsForApplication(id);
        }

        // Handle AI review separately (one-to-one relationship fetched separately)
        if (includes.includes('ai_review') || includes.includes('ai-review')) {
            application.ai_review = await this.repository.getAIReviewForApplication(id);
        }

        return application;
    }

    async createApplication(data: any, clerkUserId?: string): Promise<any> {
        // Validation
        if (!data.job_id) {
            throw new Error('Job ID is required');
        }

        // Auto-resolve candidate_id from clerkUserId if not provided
        let candidateId = data.candidate_id;
        let recruiterId = data.candidate_recruiter_id;
        let identityUserId = undefined;

        const userContext = await this.accessResolver.resolve(clerkUserId);
        identityUserId = userContext.identityUserId;

        if (!candidateId && userContext?.candidateId) {
            candidateId = userContext.candidateId;
        }

        if (!recruiterId && userContext?.recruiterId) {
            recruiterId = userContext.recruiterId;
        }

        // If still no recruiterId, look up existing recruiter-candidate relationship
        if (!recruiterId && candidateId) {
            const activeRecruiter = await this.repository.findActiveRecruiterForCandidate(candidateId);
            if (activeRecruiter && activeRecruiter.status === 'active') {
                recruiterId = activeRecruiter.id;
            }
        }

        if (!candidateId || !userContext?.identityUserId) {
            throw new Error('Candidate ID & Identity User ID is required and could not be resolved from user context');
        }

        // Extract document-related fields that shouldn't be persisted to applications table
        const { document_ids, pre_screen_answers, ...applicationData } = data;

        // Determine initial stage:
        // - recruiter_proposed: Recruiter submitted on behalf of candidate
        // - ai_review: Direct candidate application (no recruiter)
        const hasRecruiter = !!recruiterId;
        const initialStage = data.stage || (hasRecruiter ? 'recruiter_proposed' : 'ai_review');

        const application = await this.repository.createApplication({
            ...applicationData,
            candidate_id: candidateId,
            candidate_recruiter_id: recruiterId,
            stage: initialStage,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, clerkUserId);

        // Link documents to application if provided
        if (document_ids && Array.isArray(document_ids) && document_ids.length > 0) {
            await Promise.all(
                document_ids.map((docId: string) =>
                    this.repository.linkDocumentToApplication(
                        docId,
                        application.id,
                        false // No primary resume tracking at application level
                    )
                )
            );
        }

        // Save pre-screen answers if provided
        if (pre_screen_answers && Array.isArray(pre_screen_answers) && pre_screen_answers.length > 0) {
            await Promise.all(
                pre_screen_answers.map((answer: any) =>
                    this.repository.savePreScreenAnswer({
                        application_id: application.id,
                        question_id: answer.question_id,
                        answer: answer.answer,
                    })
                )
            );
        }
        // Create audit log entry for application creation
        await this.repository.createAuditLog({
            application_id: application.id,
            action: 'created',
            performed_by_user_id: identityUserId || 'system',
            performed_by_role: hasRecruiter ? 'recruiter' : 'candidate',
            new_value: {
                stage: application.stage,
                job_id: application.job_id,
                candidate_id: candidateId,
                recruiter_id: recruiterId || null,
            },
            metadata: {
                has_recruiter: hasRecruiter,
                document_count: document_ids?.length || 0,
                has_pre_screen_answers: !!(pre_screen_answers?.length),
            },
        });

        // Emit event (non-blocking)
        if (this.eventPublisher) {
            try {
                await this.eventPublisher.publish('application.created', {
                    application_id: application.id,
                    job_id: application.job_id,
                    candidate_id: candidateId,
                    recruiter_id: recruiterId || null,
                    has_recruiter: hasRecruiter,
                    stage: application.stage,
                    created_by: identityUserId,
                });
            } catch (error) {
                // Log the error but don't prevent application creation
                console.error('Failed to publish application.created event:', error);
            }
        }

        // Note: Application created with referential recruiter data
        // No additional assignment tracking needed

        return application;
    }

    async updateApplication(
        id: string,
        updates: ApplicationUpdate,
        clerkUserId?: string,
        userRole?: string
    ): Promise<any> {

        const currentApplication = await this.repository.findApplication(id, clerkUserId);
        if (!currentApplication) {
            throw new Error(`Application ${id} not found`);
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
        // // Auto-resolve candidate_id from clerkUserId if not provided
        // let candidateId = undefined;
        // let identityUserId = undefined;

        // if (!candidateId && clerkUserId) {
        //     const candidateContext = await this.getCandidateContext(clerkUserId);
        //     if (candidateContext) {
        //         candidateId = candidateContext.candidate.id;
        //         identityUserId = candidateContext.identityUser.id;
        //     }
        // }

        // if (!candidateId || !identityUserId) {
        //     throw new Error('Candidate ID & Identity User ID is required and could not be resolved from user context');
        // }

        const {
            document_ids,
            primary_resume_id,
            pre_screen_answers,
            decline_reason,
            decline_details,
            ...persistedUpdates
        } = updates;


        // Validate stage transitions
        if (updates.stage && updates.stage !== currentApplication.stage) {
            await this.validateStageTransition(
                currentApplication.stage,
                updates.stage
            );
        }

        // Validate rejection has decline reason or details
        if (
            updates.stage === 'rejected' &&
            !decline_details &&
            !decline_reason
        ) {
            throw new Error('Decline reason required when rejecting');
        }

        // Link documents if provided
        // Link documents to application if provided
        if (document_ids && Array.isArray(document_ids) && document_ids.length > 0) {
            // First, remove existing documents to avoid duplicates
            await this.repository.unlinkApplicationDocuments(id);

            // Then link the new documents
            for (const docId of document_ids) {
                await this.repository.linkDocumentToApplication(
                    docId,
                    id,
                    !!primary_resume_id && docId === primary_resume_id
                );
            }
        }

        // Update pre-screen answers if provided (using UPSERT)
        if (pre_screen_answers && Array.isArray(pre_screen_answers) && pre_screen_answers.length > 0) {
            await Promise.all(
                pre_screen_answers.map((answer: any) =>
                    this.repository.savePreScreenAnswer({
                        application_id: id,
                        question_id: answer.question_id,
                        answer: answer.answer,
                    })
                )
            );
        }

        const updatedApplication = await this.repository.updateApplication(id, persistedUpdates);

        // Create audit log entry for stage changes
        if (updates.stage && updates.stage !== currentApplication.stage) {
            await this.repository.createAuditLog({
                application_id: id,
                action: 'stage_changed',
                performed_by_user_id: userContext.identityUserId || 'system',
                performed_by_role: userRole || this.resolveRole(userContext),
                old_value: { stage: currentApplication.stage },
                new_value: { stage: updates.stage },
                metadata: {
                    job_id: updatedApplication.job_id,
                    candidate_id: updatedApplication.candidate_id,
                    candidate_recruiter_id: updatedApplication.candidate_recruiter_id,
                    decline_reason: decline_reason || null,
                    decline_details: decline_details || null,
                },
            });
        }

        // Publish events (non-blocking)
        if (this.eventPublisher) {
            try {
                // Stage changed event - other services listen and react to stages they care about
                if (updates.stage) {
                    await this.eventPublisher.publish('application.stage_changed', {
                        application_id: id,
                        job_id: updatedApplication.job_id,
                        candidate_id: updatedApplication.candidate_id,
                        candidate_recruiter_id: updatedApplication.candidate_recruiter_id,
                        old_stage: currentApplication.stage,
                        new_stage: updates.stage,
                        changed_by: userContext.identityUserId,
                    });
                }

                // Generic update event
                await this.eventPublisher.publish('application.updated', {
                    application_id: id,
                    job_id: updatedApplication.job_id,
                    candidate_id: updatedApplication.candidate_id,
                    updated_fields: Object.keys(persistedUpdates),
                    updated_by: userContext.identityUserId,
                });
            } catch (error) {
                // Log the error but don't prevent application update
                console.error('Failed to publish application update events:', error);
            }
        }

        // Note: Application updated with referential recruiter data
        // No additional assignment tracking needed

        return updatedApplication;
    }

    async deleteApplication(id: string, clerkUserId?: string): Promise<void> {
        const application = await this.repository.findApplication(id, clerkUserId);
        if (!application) {
            throw new Error(`Application ${id} not found`);
        }
        // Auto-resolve candidate_id from clerkUserId if not provided
        let candidateId = undefined;
        let identityUserId = undefined;

        if (!candidateId && clerkUserId) {
            const candidateContext = await this.getCandidateContext(clerkUserId);
            if (candidateContext) {
                candidateId = candidateContext.candidate.id;
                identityUserId = candidateContext.identityUser.id;
            }
        }

        if (!candidateId || !identityUserId) {
            throw new Error('Candidate ID & Identity User ID is required and could not be resolved from user context');
        }

        await this.repository.deleteApplication(id);

        if (this.eventPublisher) {
            try {
                await this.eventPublisher.publish('application.deleted', {
                    applicationId: id,
                    deletedBy: identityUserId,
                });
            } catch (error) {
                // Log the error but don't prevent application deletion
                console.error('Failed to publish application.deleted event:', error);
            }
        }
    }

    /**
     * Private helper for stage transition validation
     */
    private async validateStageTransition(
        fromStage: string,
        toStage: string
    ): Promise<void> {
        // Withdrawn is always allowed from active stages (candidate self-service)
        if (toStage === 'withdrawn') {
            return;
        }

        // Draft is allowed from most active stages (candidate back-to-draft, recruiter request changes)
        if (toStage === 'draft') {
            // Cannot go back to draft from terminal stages
            if (['hired', 'withdrawn', 'expired'].includes(fromStage)) {
                throw new Error(
                    `Invalid stage transition: ${fromStage} -> ${toStage}`
                );
            }
            // Allow draft from all other stages
            return;
        }

        // Recruiter can request changes/info from candidate at any active stage
        if (toStage === 'recruiter_request') {
            // Cannot request from terminal stages
            if (['hired', 'rejected', 'withdrawn', 'expired'].includes(fromStage)) {
                throw new Error(
                    `Invalid stage transition: ${fromStage} -> ${toStage}`
                );
            }
            return;
        }

        // Define allowed stage transitions for forward progress
        const allowedTransitions: Record<string, string[]> = {
            // Candidate self-service stages
            draft: ['ai_review', 'screen', 'rejected'], // Draft can move to review or screening
            ai_review: ['ai_reviewed', 'rejected'], // After AI review completes, move to ai_reviewed state
            ai_reviewed: ['draft', 'screen', 'submitted', 'rejected'], // Candidate can edit draft, screen, or submit

            // Recruiter involvement stages
            recruiter_request: ['draft', 'ai_review', 'rejected'], // Candidate responds to request, or recruiter rejects
            recruiter_proposed: ['ai_review', 'draft', 'recruiter_review', 'screen', 'submitted', 'rejected'], // Recruiter proposal can be reviewed or sent back
            recruiter_review: ['screen', 'submitted', 'draft', 'rejected'], // Recruiter can submit, screen, or request changes

            // Company review stages (replaces CRA gates)
            screen: ['submitted', 'company_review', 'rejected'], // After screening, submit to company or reject
            submitted: ['company_review', 'interview', 'rejected'], // Company reviews application
            company_review: ['company_feedback', 'interview', 'offer', 'rejected'], // Company reviewing candidate
            company_feedback: ['interview', 'offer', 'recruiter_request', 'rejected'], // Company provided feedback
            interview: ['offer', 'rejected'], // Interview stage
            offer: ['hired', 'rejected'], // Offer stage

            // Terminal states
            hired: [], // Terminal state - cannot transition further
            rejected: [], // Terminal state - cannot transition further
            withdrawn: [], // Terminal state - cannot transition further
            expired: [], // Terminal state - cannot transition further
        };

        if (!allowedTransitions[fromStage]?.includes(toStage)) {
            throw new Error(
                `Invalid stage transition: ${fromStage} -> ${toStage}`
            );
        }
    }

    private async getCandidateContext(clerkUserId?: string) {
        if (!clerkUserId) {
            return null;
        }
        const candidate = await this.repository.findCandidateByClerkUserId(clerkUserId);

        if (!candidate) {
            return null;
        }
        const identityUser = await this.repository.findUserByClerkUserId(clerkUserId);

        if (!identityUser) {
            return null;
        }
        return { candidate, identityUser };
    }

    /**
     * Derive performed_by_role from access context
     */
    private resolveRole(context: { isPlatformAdmin: boolean; companyIds: string[]; recruiterId: string | null; candidateId: string | null }): string {
        if (context.isPlatformAdmin) return 'admin';
        if (context.companyIds.length > 0) return 'company';
        if (context.recruiterId) return 'recruiter';
        if (context.candidateId) return 'candidate';
        return 'system';
    }

    /**
     * Handle AI review completion event
     * Transitions application from 'ai_review' to 'ai_reviewed'
     * Candidate must review feedback before submission
     */
    async handleAIReviewCompleted(data: {
        application_id: string;
        review_id: string;
        recommendation: 'strong_fit' | 'good_fit' | 'fair_fit' | 'poor_fit';
        concerns: string[];
    }): Promise<void> {
        // Update application to ai_reviewed (NOT submitted!)
        await this.repository.updateApplication(data.application_id, {
            stage: 'ai_reviewed',
            ai_reviewed: true,
        });

        // Create audit log entry
        await this.repository.createAuditLog({
            application_id: data.application_id,
            action: 'ai_review_completed',
            performed_by_user_id: 'system',
            performed_by_role: 'system',
            old_value: { stage: 'ai_review' },
            new_value: { stage: 'ai_reviewed' },
            metadata: {
                review_id: data.review_id,
                recommendation: data.recommendation,
                concern_count: data.concerns.length,
            },
        });

        // Publish event for notification
        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.ai_reviewed', {
                application_id: data.application_id,
                review_id: data.review_id,
                recommendation: data.recommendation,
                has_concerns: data.concerns.length > 0,
            });

            // If poor fit or fair fit with concerns, suggest edits
            if (data.recommendation === 'poor_fit' ||
                (data.recommendation === 'fair_fit' && data.concerns.length > 0)) {
                await this.eventPublisher.publish('application.needs_improvement', {
                    application_id: data.application_id,
                    concerns: data.concerns,
                });
            }
        }
    }

    /**
     * Return application to draft stage
     * Candidate wants to edit application after AI review
     */
    async returnToDraft(applicationId: string, clerkUserId: string): Promise<any> {
        const application = await this.repository.findApplication(applicationId, clerkUserId);

        if (!application) {
            throw new Error('Application not found');
        }

        // Only allow return to draft from ai_reviewed, recruiter_request, or screen
        if (!['ai_reviewed', 'recruiter_request', 'screen'].includes(application.stage)) {
            throw new Error(`Cannot return to draft from stage: ${application.stage}`);
        }

        // Update to draft
        const updated = await this.repository.updateApplication(applicationId, {
            stage: 'draft',
            ai_reviewed: false, // Reset AI review flag
        });

        // Create audit log entry
        const userContext = await this.accessResolver.resolve(clerkUserId);
        await this.repository.createAuditLog({
            application_id: applicationId,
            action: 'returned_to_draft',
            performed_by_user_id: userContext.identityUserId || 'system',
            performed_by_role: userContext.recruiterId ? 'recruiter' : 'candidate',
            old_value: { stage: application.stage },
            new_value: { stage: 'draft' },
            metadata: {
                from_stage: application.stage,
            },
        });

        // Publish event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.returned_to_draft', {
                applicationId,
                from_stage: application.stage,
                updatedBy: userContext.identityUserId,
            });
        }

        return updated;
    }

    /**
     * Trigger AI review for application
     * Candidate clicks "Review My Application"
     */
    async triggerAIReview(applicationId: string, clerkUserId: string): Promise<void> {
        const application = await this.repository.findApplication(applicationId, clerkUserId);

        if (!application) {
            throw new Error('Application not found');
        }

        // Only allow AI review from draft or after returning from ai_reviewed
        if (!['draft'].includes(application.stage)) {
            throw new Error(`Cannot trigger AI review from stage: ${application.stage}`);
        }

        // Update to ai_review stage
        await this.repository.updateApplication(applicationId, {
            stage: 'ai_review',
        });

        // Create audit log entry
        const userContext = await this.accessResolver.resolve(clerkUserId);
        await this.repository.createAuditLog({
            application_id: applicationId,
            action: 'ai_review_started',
            performed_by_user_id: userContext.identityUserId || 'system',
            performed_by_role: userContext.recruiterId ? 'recruiter' : 'candidate',
            old_value: { stage: application.stage },
            new_value: { stage: 'ai_review' },
            metadata: {
                job_id: application.job_id,
                candidate_id: application.candidate_id,
            },
        });

        // Publish event for AI service to process (non-blocking)
        if (this.eventPublisher) {
            try {
                await this.eventPublisher.publish('application.ai_review.triggered', {
                    application_id: applicationId,
                    candidate_id: application.candidate_id,
                    job_id: application.job_id,
                    triggeredBy: userContext.identityUserId,
                });
            } catch (error) {
                // Log the error but don't prevent AI review trigger
                console.error('Failed to publish application.ai_review.triggered event:', error);
            }
        }
    }

    /**
     * Submit application after AI review
     * Candidate is satisfied with AI feedback and ready to submit
     * 
     * Phase 2: Application stage workflow handles routing and reviews\n     * Note: CandidateRoleAssignment system was deprecated - now uses application.stage field
     */
    async submitApplication(applicationId: string, clerkUserId: string, data?: any): Promise<{
        application: any;
        assignment?: any;
    }> {
        const application = await this.repository.findApplication(applicationId, clerkUserId);

        if (!application) {
            throw new Error('Application not found');
        }

        // Only allow submission from ai_reviewed or screen
        if (!['ai_reviewed', 'screen'].includes(application.stage)) {
            throw new Error(`Cannot submit from stage: ${application.stage}. Application must be in ai_reviewed or screen stage.`);
        }
        console.log(application.candidate_recruiter_id);
        // Determine next stage based on recruiter presence
        // Represented candidates (with recruiter) → screen (recruiter reviews first)
        // Direct candidates (no recruiter) → submitted (goes straight to company)
        const nextStage = application.candidate_recruiter_id ? 'recruiter_review' : 'submitted';

        // Update to appropriate stage
        const updated = await this.repository.updateApplication(applicationId, {
            stage: nextStage,
        });

        // Resolve user context early (needed for proposed_by UUID)
        const userContext = await this.accessResolver.resolve(clerkUserId);

        // Create audit log entry for submission
        await this.repository.createAuditLog({
            application_id: applicationId,
            action: 'submitted',
            performed_by_user_id: userContext.identityUserId || 'system',
            performed_by_role: 'candidate',
            old_value: { stage: application.stage },
            new_value: { stage: nextStage },
            metadata: {
                job_id: application.job_id,
                candidate_id: application.candidate_id,
                has_recruiter: !!application.candidate_recruiter_id,
            },
        });

        // Note: Gate routing now handled directly in application workflow
        // No separate assignment service needed - using referential data approach
        let assignment = null;

        // Publish submission event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.submitted', {
                applicationId,
                candidate_id: application.candidate_id,
                job_id: application.job_id,
                submittedBy: userContext.identityUserId,
                has_assignment: !!assignment,
            });
        }

        return { application: updated, assignment };
    }

    /**
     * Phase 4: Propose job to candidate (Recruiter-initiated application)
     * Recruiter proposes a job opportunity to one of their candidates
     * Creates application with stage: 'recruiter_proposed'
     */
    async proposeJobToCandidate(data: {
        candidate_recruiter_id: string;
        candidate_id: string;
        job_id: string;
        pitch?: string;
        notes?: string;
    }, clerkUserId: string): Promise<any> {
        // Validate required fields
        if (!data.candidate_recruiter_id || !data.candidate_id || !data.job_id) {
            throw new Error('Candidate Recruiter ID, Candidate ID, and Job ID are required');
        }

        // Verify recruiter exists and is active (query recruiters table)
        const recruiter = await this.repository.getSupabase()
            .from('recruiters')
            .select('id, status')
            .eq('id', data.candidate_recruiter_id)
            .single();

        if (!recruiter.data || recruiter.data.status !== 'active') {
            throw new Error('Invalid or inactive recruiter');
        }

        // Verify candidate exists (query candidates table)
        const candidate = await this.repository.getSupabase()
            .from('candidates')
            .select('id, user_id')
            .eq('id', data.candidate_id)
            .single();

        if (!candidate.data) {
            throw new Error('Candidate not found');
        }

        // Verify job exists and is active (query jobs table)
        const job = await this.repository.getSupabase()
            .from('jobs')
            .select('id, status')
            .eq('id', data.job_id)
            .single();

        if (!job.data || job.data.status !== 'active') {
            throw new Error('Invalid or inactive job');
        }

        // Check if there's already an active application for this candidate-job pair
        const existingApplications = await this.repository.getSupabase()
            .from('applications')
            .select('id, stage')
            .eq('candidate_id', data.candidate_id)
            .eq('job_id', data.job_id)
            .not('stage', 'in', ['rejected', 'withdrawn', 'hired'])
            .limit(1);

        if (existingApplications.data && existingApplications.data.length > 0) {
            throw new Error('Candidate already has an active application for this job');
        }

        // Create application with recruiter_proposed stage
        const application = await this.repository.createApplication({
            candidate_id: data.candidate_id,
            job_id: data.job_id,
            candidate_recruiter_id: data.candidate_recruiter_id,
            stage: 'recruiter_proposed',
            pitch: data.pitch || null,
            notes: data.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, clerkUserId);

        const userContext = await this.accessResolver.resolve(clerkUserId);

        // Create audit log entry
        await this.repository.createAuditLog({
            application_id: application.id,
            action: 'recruiter_proposed',
            performed_by_user_id: userContext.identityUserId || 'system',
            performed_by_role: 'recruiter',
            new_value: {
                stage: 'recruiter_proposed',
                candidate_recruiter_id: data.candidate_recruiter_id,
                has_pitch: !!data.pitch,
            },
            metadata: {
                pitch_length: data.pitch?.length || 0,
                has_notes: !!data.notes,
            },
        });

        // Publish event for notification system
        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.recruiter_proposed', {
                application_id: application.id,
                candidate_recruiter_id: data.candidate_recruiter_id,
                candidate_id: data.candidate_id,
                job_id: data.job_id,
                pitch: data.pitch,
                proposed_by: userContext.identityUserId,
            });
        }

        return application;
    }

    /**
     * Phase 4: Accept job proposal
     * Candidate accepts a recruiter's job proposal
     * Converts application from 'recruiter_proposed' → 'draft'
     */
    async acceptProposal(applicationId: string, clerkUserId: string): Promise<any> {
        const application = await this.repository.findApplication(applicationId, clerkUserId);

        if (!application) {
            throw new Error('Application not found');
        }

        // Only allow acceptance from recruiter_proposed stage
        if (application.stage !== 'recruiter_proposed') {
            throw new Error(`Cannot accept proposal from stage: ${application.stage}. Application must be in recruiter_proposed stage.`);
        }

        // Verify candidate owns this application (permission check)
        const userContext = await this.accessResolver.resolve(clerkUserId);
        if (!userContext.candidateId || userContext.candidateId !== application.candidate_id) {
            throw new Error('Only the candidate can accept this proposal');
        }

        // Update application to draft stage (candidate can now fill it out)
        const updated = await this.repository.updateApplication(applicationId, {
            stage: 'draft',
        });

        // Create audit log entry
        await this.repository.createAuditLog({
            application_id: applicationId,
            action: 'proposal_accepted',
            performed_by_user_id: userContext.identityUserId || 'system',
            performed_by_role: 'candidate',
            old_value: { stage: 'recruiter_proposed' },
            new_value: { stage: 'draft' },
            metadata: {
                candidate_recruiter_id: application.candidate_recruiter_id,
            },
        });

        // Publish event for notification system
        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.proposal_accepted', {
                application_id: applicationId,
                candidate_id: application.candidate_id,
                job_id: application.job_id,
                candidate_recruiter_id: application.candidate_recruiter_id,
                accepted_by: userContext.identityUserId,
            });
        }

        return updated;
    }

    /**
     * Hire a candidate — transitions application to 'hired' stage and creates a placement record.
     *
     * This is the single entry point for hiring. It:
     * 1. Validates the application is in 'offer' stage
     * 2. Updates application with salary, start_date, notes, and stage='hired'
     * 3. Returns the updated application (placement is created by the route handler via PlacementService)
     */
    async hireCandidate(
        applicationId: string,
        body: { salary: number; start_date?: string; notes?: string },
        clerkUserId: string
    ): Promise<any> {
        const application = await this.repository.findApplication(applicationId, clerkUserId);
        if (!application) {
            throw new Error('Application not found');
        }

        if (application.stage !== 'offer') {
            throw new Error(`Cannot hire from stage: ${application.stage}. Application must be in offer stage.`);
        }

        if (!body.salary || body.salary <= 0) {
            throw new Error('Valid salary amount is required');
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);

        // Build update payload (notes are now created via application_notes table)
        const updateData: any = {
            stage: 'hired',
            salary: body.salary,
        };

        const updated = await this.repository.updateApplication(applicationId, updateData);

        // Create audit log
        await this.repository.createAuditLog({
            application_id: applicationId,
            action: 'hired',
            performed_by_user_id: userContext.identityUserId || 'system',
            performed_by_role: 'company',
            old_value: { stage: application.stage },
            new_value: {
                stage: 'hired',
                salary: body.salary,
                start_date: body.start_date || new Date().toISOString().split('T')[0],
            },
        });

        // Publish stage changed event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.stage_changed', {
                application_id: applicationId,
                job_id: application.job_id,
                candidate_id: application.candidate_id,
                candidate_recruiter_id: application.candidate_recruiter_id,
                old_stage: application.stage,
                new_stage: 'hired',
                changed_by: userContext.identityUserId,
            });
        }

        return updated;
    }

    /**
     * Request pre-screen for an application
     * Company requests a company recruiter to screen a candidate before proceeding.
     *
     * Selection logic (3-tier):
     * 1. Job already has company_recruiter_id → use that recruiter
     * 2. Job has no company recruiter but company has recruiters → pick from company pool
     * 3. Company has no recruiters → pick from platform pool, create recruiter_companies relationship
     *
     * The recruiter is set as company_recruiter_id on the JOB (not candidate_recruiter_id
     * on the application) to preserve correct split economics.
     */
    async requestPrescreen(
        applicationId: string,
        body: { company_id: string; recruiter_id?: string; message?: string },
        clerkUserId: string
    ): Promise<any> {
        const application = await this.repository.findApplication(applicationId, clerkUserId);
        if (!application) {
            throw new Error('Application not found');
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);

        // Check if job already has a company recruiter assigned
        const { data: job } = await this.supabase
            .from('jobs')
            .select('id, company_recruiter_id')
            .eq('id', application.job_id)
            .single();

        if (!job) {
            throw new Error('Job not found');
        }

        let assignedRecruiterId: string;
        let autoAssign = false;
        let createdCompanyRelationship = false;

        if (job.company_recruiter_id) {
            // Tier 1: Job already has a company recruiter
            assignedRecruiterId = job.company_recruiter_id;
        } else if (body.recruiter_id) {
            // Tier 2: Company user explicitly picked a recruiter
            assignedRecruiterId = body.recruiter_id;
        } else {
            // Auto-assign: try company recruiters first, then platform pool
            autoAssign = true;
            const result = await autoAssignRecruiter(this.supabase, body.company_id);
            if (!result) {
                throw new Error('No available recruiters for auto-assignment');
            }
            assignedRecruiterId = result.recruiterId;
            createdCompanyRelationship = result.createdRelationship;
        }

        // Set company_recruiter_id on the JOB (not candidate_recruiter_id on application)
        if (!job.company_recruiter_id) {
            await this.supabase
                .from('jobs')
                .update({ company_recruiter_id: assignedRecruiterId, updated_at: new Date().toISOString() })
                .eq('id', application.job_id);
        }

        // Move application to screen stage (do NOT set candidate_recruiter_id)
        const updated = await this.repository.updateApplication(applicationId, {
            stage: 'screen',
        });

        // Create audit log entry
        await this.repository.createAuditLog({
            application_id: applicationId,
            action: 'prescreen_requested',
            performed_by_user_id: userContext.identityUserId || 'system',
            performed_by_role: 'company',
            new_value: {
                stage: 'screen',
                company_recruiter_id: assignedRecruiterId,
                auto_assign: autoAssign,
            },
            metadata: {
                company_id: body.company_id,
                has_message: !!body.message,
                created_company_relationship: createdCompanyRelationship,
            },
        });

        // Publish event for notification system
        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.prescreen_requested', {
                application_id: applicationId,
                job_id: application.job_id,
                candidate_id: application.candidate_id,
                company_id: body.company_id,
                recruiter_id: assignedRecruiterId,
                requested_by_user_id: userContext.identityUserId,
                message: body.message || null,
                auto_assign: autoAssign,
            });
        }

        return updated;
    }

    /**
     * Phase 4: Decline job proposal
     * Candidate declines a recruiter's job proposal
     * Updates application from 'recruiter_proposed' → 'rejected'
     */
    async declineProposal(applicationId: string, clerkUserId: string, reason?: string): Promise<any> {
        const application = await this.repository.findApplication(applicationId, clerkUserId);

        if (!application) {
            throw new Error('Application not found');
        }

        // Only allow decline from recruiter_proposed stage
        if (application.stage !== 'recruiter_proposed') {
            throw new Error(`Cannot decline proposal from stage: ${application.stage}. Application must be in recruiter_proposed stage.`);
        }

        // Verify candidate owns this application (permission check)
        const userContext = await this.accessResolver.resolve(clerkUserId);
        if (!userContext.candidateId || userContext.candidateId !== application.candidate_id) {
            throw new Error('Only the candidate can decline this proposal');
        }

        // Update application to rejected stage
        const updated = await this.repository.updateApplication(applicationId, {
            stage: 'rejected',
            decline_reason: reason || undefined,
        });

        // Create audit log entry
        await this.repository.createAuditLog({
            application_id: applicationId,
            action: 'proposal_declined',
            performed_by_user_id: userContext.identityUserId || 'system',
            performed_by_role: 'candidate',
            old_value: { stage: 'recruiter_proposed' },
            new_value: {
                stage: 'rejected',
                decline_reason: reason || null,
            },
            metadata: {
                candidate_recruiter_id: application.candidate_recruiter_id,
                has_reason: !!reason,
            },
        });

        // Publish event for notification system
        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.proposal_declined', {
                application_id: applicationId,
                candidate_id: application.candidate_id,
                job_id: application.job_id,
                candidate_recruiter_id: application.candidate_recruiter_id,
                declined_by: userContext.identityUserId,
                reason: reason || null,
            });
        }

        return updated;
    }

    /**
     * Get applications affected by a recruiter-candidate relationship termination.
     */
    async getAffectedByTermination(
        recruiterId: string,
        candidateId: string
    ): Promise<any[]> {
        return this.repository.findAffectedByTermination(recruiterId, candidateId);
    }

    /**
     * Process termination decisions for applications.
     */
    async processTerminationDecisions(
        decisions: { application_id: string; action: 'keep' | 'withdraw' }[]
    ): Promise<void> {
        await this.repository.processTerminationDecisions(decisions);
    }
}
