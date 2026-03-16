/**
 * Applications Service - V2
 * Handles ALL application updates with smart validation
 */

import { ApplicationRepository } from './repository';
import { ApplicationFilters, ApplicationUpdate } from './types';
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

        // Enrich company sourcer (company_sourcers table replaced by recruiter_companies)
        const companyId = application.job?.company?.id;
        if (companyId) {
            const companySourcer = await this.repository.getCompanySourcer(companyId);
            if (companySourcer) {
                application.company_sourcer = companySourcer;
            }
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
        let candidateRecruiterId = data.candidate_recruiter_id || null;
        let companyRecruiterId: string | null = null;
        let applicationSource = data.application_source || 'direct';
        let identityUserId = undefined;

        const userContext = await this.accessResolver.resolve(clerkUserId);
        identityUserId = userContext.identityUserId;

        if (!candidateId && userContext?.candidateId) {
            candidateId = userContext.candidateId;
        }

        if (!candidateId || !userContext?.identityUserId) {
            throw new Error('Candidate ID & Identity User ID is required and could not be resolved from user context');
        }

        // Fetch the job to determine context (company job vs firm job)
        const { data: job } = await this.repository.getSupabase()
            .from('jobs')
            .select('company_id, source_firm_id')
            .eq('id', data.job_id)
            .single();

        if (!job) {
            throw new Error(`Job ${data.job_id} not found`);
        }

        const isCompanyJob = !!job.company_id && !job.source_firm_id;
        const isRecruiterUser = !!userContext.recruiterId;

        if (isRecruiterUser && userContext.recruiterId) {
            // Determine if this recruiter is a company recruiter for this job's company
            let isCompanyRecruiter = false;
            if (isCompanyJob && job.company_id) {
                const { data: relationship } = await this.repository.getSupabase()
                    .from('recruiter_companies')
                    .select('permissions')
                    .eq('recruiter_id', userContext.recruiterId)
                    .eq('company_id', job.company_id)
                    .eq('status', 'active')
                    .maybeSingle();

                isCompanyRecruiter = !!relationship;

                // Check can_submit_candidates permission if relationship exists
                if (relationship && !relationship.permissions?.can_submit_candidates) {
                    throw new Error('Forbidden: You do not have permission to submit candidates for this company');
                }
            }

            if (isCompanyRecruiter) {
                // Company recruiter submitting: set company_recruiter_id on application
                companyRecruiterId = userContext.recruiterId;
                applicationSource = 'company_recruiter';
                // candidate_recruiter_id stays NULL — candidate picks their own later
                candidateRecruiterId = null;
            } else {
                // Non-company recruiter: must have active RTR with candidate
                const { data: rtrRelationship } = await this.repository.getSupabase()
                    .from('recruiter_candidates')
                    .select('id')
                    .eq('recruiter_id', userContext.recruiterId)
                    .eq('candidate_id', candidateId)
                    .eq('status', 'active')
                    .eq('consent_given', true)
                    .maybeSingle();

                if (!rtrRelationship) {
                    throw new Error('Forbidden: You must have an active representation agreement (RTR) with this candidate before submitting them');
                }

                candidateRecruiterId = userContext.recruiterId;
                applicationSource = 'recruiter';
            }
        }
        // If candidate is applying directly, candidateRecruiterId comes from data.candidate_recruiter_id (their choice, default null)

        // Extract document-related fields that shouldn't be persisted to applications table
        const { document_ids, ...applicationData } = data;

        // Determine initial stage:
        // - recruiter_proposed: Recruiter submitted on behalf of candidate
        // - ai_review: Direct candidate application (no recruiter)
        const hasRecruiter = !!candidateRecruiterId || !!companyRecruiterId;
        const initialStage = data.stage || (hasRecruiter ? 'recruiter_proposed' : 'ai_review');

        const application = await this.repository.createApplication({
            ...applicationData,
            candidate_id: candidateId,
            candidate_recruiter_id: candidateRecruiterId,
            company_recruiter_id: companyRecruiterId,
            application_source: applicationSource,
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

        // pre_screen_answers is now a JSONB column — included directly in the application payload above

        // Create audit log entry for application creation
        await this.repository.createAuditLog({
            application_id: application.id,
            action: 'created',
            performed_by_user_id: identityUserId || '00000000-0000-0000-0000-000000000000',
            performed_by_role: hasRecruiter ? 'recruiter' : 'candidate',
            new_value: {
                stage: application.stage,
                job_id: application.job_id,
                candidate_id: candidateId,
                candidate_recruiter_id: candidateRecruiterId || null,
                company_recruiter_id: companyRecruiterId || null,
                application_source: applicationSource,
            },
            metadata: {
                has_recruiter: hasRecruiter,
                document_count: document_ids?.length || 0,
                has_pre_screen_answers: !!(data.pre_screen_answers?.length),
            },
        });

        // Emit event (non-blocking)
        if (this.eventPublisher) {
            try {
                await this.eventPublisher.publish('application.created', {
                    application_id: application.id,
                    job_id: application.job_id,
                    candidate_id: candidateId,
                    candidate_recruiter_id: candidateRecruiterId || null,
                    company_recruiter_id: companyRecruiterId || null,
                    application_source: applicationSource,
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
            decline_reason,
            decline_details,
            notes: _notes, // notes column doesn't exist — callers should use /applications/:id/notes
            ...persistedUpdates
        } = updates;

        if (_notes) {
            console.warn(`[applications] Caller sent "notes" field in PATCH /applications/${id} — this field should be written via POST /applications/:id/notes instead. Value was stripped.`);
        }

        // Validate stage transitions
        if (updates.stage && updates.stage !== currentApplication.stage) {
            await this.validateStageTransition(
                currentApplication.stage,
                updates.stage,
                currentApplication
            );

            // Enforce can_advance_candidates permission for company jobs
            const job = currentApplication.job;
            const isFirmJob = !job?.company_id && !!job?.source_firm_id;
            if (!isFirmJob && userContext.recruiterId && job?.company_id) {
                const { data: relationship } = await this.repository.getSupabase()
                    .from('recruiter_companies')
                    .select('permissions')
                    .eq('recruiter_id', userContext.recruiterId)
                    .eq('company_id', job.company_id)
                    .eq('status', 'active')
                    .maybeSingle();

                // Only block if an explicit relationship exists with can_advance_candidates denied.
                // No relationship = open marketplace job, recruiter can advance freely.
                if (relationship && !relationship.permissions?.can_advance_candidates) {
                    throw new Error('Forbidden: You do not have permission to advance candidates for this company');
                }
            }

            // Enforce role-based stage authorization (company vs firm job rules)
            this.authorizeStageTransition(updates.stage, userContext, currentApplication);
        }

        // Auto-set submitted_at when transitioning to a submission stage for the first time
        // Note: recruiter_proposed is excluded — that's a recruiter suggesting a role TO the candidate, not a submission
        const SUBMISSION_STAGES = ['submitted', 'recruiter_review'];
        if (updates.stage && SUBMISSION_STAGES.includes(updates.stage) && !currentApplication.submitted_at) {
            persistedUpdates.submitted_at = new Date().toISOString();
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

        // pre_screen_answers is now a JSONB column — included in persistedUpdates above

        const updatedApplication = await this.repository.updateApplication(id, persistedUpdates);

        // Create audit log entry for stage changes
        if (updates.stage && updates.stage !== currentApplication.stage) {
            await this.repository.createAuditLog({
                application_id: id,
                action: 'stage_changed',
                performed_by_user_id: userContext.identityUserId || '00000000-0000-0000-0000-000000000000',
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
                    const stageChangedPayload: Record<string, any> = {
                        application_id: id,
                        job_id: updatedApplication.job_id,
                        candidate_id: updatedApplication.candidate_id,
                        candidate_recruiter_id: updatedApplication.candidate_recruiter_id,
                        old_stage: currentApplication.stage,
                        new_stage: updates.stage,
                        changed_by: userContext.identityUserId,
                    };

                    // Enrich with financial data for offer stage transitions
                    if (updates.stage === 'offer') {
                        const job = currentApplication.job;
                        stageChangedPayload.salary = updatedApplication.salary || null;
                        stageChangedPayload.fee_percentage = job?.fee_percentage || null;
                        stageChangedPayload.guarantee_days = job?.guarantee_days ?? 90;
                    }

                    await this.eventPublisher.publish('application.stage_changed', stageChangedPayload);
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
        toStage: string,
        application?: { expired_at?: string | null }
    ): Promise<void> {
        // Block transitions on expired applications
        if (application?.expired_at) {
            throw new Error('Cannot transition an expired application. Reactivate it first.');
        }
        // Withdrawn is always allowed from active stages (candidate self-service)
        if (toStage === 'withdrawn') {
            return;
        }

        // Draft is allowed from most active stages (candidate back-to-draft, recruiter request changes)
        if (toStage === 'draft') {
            // Cannot go back to draft from terminal stages
            if (['hired', 'withdrawn'].includes(fromStage)) {
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
            if (['hired', 'rejected', 'withdrawn'].includes(fromStage)) {
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
     * Enforce role-based stage authorization based on job type (company vs firm).
     *
     * Company jobs: recruiters cannot advance to offer/hired or reject at offer+.
     * Firm jobs (no company_id, has source_firm_id): recruiters have full stage control.
     * Platform admins: unrestricted on all job types.
     */
    private authorizeStageTransition(
        targetStage: string,
        userContext: { isPlatformAdmin: boolean; companyIds: string[]; recruiterId: string | null },
        application: any
    ): void {
        if (userContext.isPlatformAdmin) return;

        const job = application.job;
        const isFirmJob = !job?.company_id && !!job?.source_firm_id;

        // Firm jobs: recruiters have full control, no restrictions
        if (isFirmJob) return;

        // Company jobs: enforce recruiter restrictions
        const isRecruiter = !!userContext.recruiterId && userContext.companyIds.length === 0;
        if (!isRecruiter) return;

        // Recruiters cannot advance to offer or hired on company jobs
        if (targetStage === 'offer' || targetStage === 'hired') {
            throw new Error(
                `Recruiters cannot advance applications to "${targetStage}" on company jobs. Only company users can manage offer and later stages.`
            );
        }

        // Recruiters cannot reject at offer stage or later on company jobs
        if (targetStage === 'rejected' && application.stage === 'offer') {
            throw new Error(
                'Recruiters cannot reject applications at offer stage on company jobs.'
            );
        }
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
            performed_by_user_id: '00000000-0000-0000-0000-000000000000',
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
            performed_by_user_id: userContext.identityUserId || '00000000-0000-0000-0000-000000000000',
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
     * Candidate clicks "Review My Application" or admin retriggers a stuck review
     */
    async triggerAIReview(applicationId: string, clerkUserId: string): Promise<void> {
        const application = await this.repository.findApplication(applicationId, clerkUserId);

        if (!application) {
            throw new Error('Application not found');
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
        const isRetrigger = application.stage === 'ai_review';

        // Candidates can trigger from draft; admins can also retrigger stuck ai_review
        if (isRetrigger && !userContext.isPlatformAdmin) {
            throw new Error('Only platform admins can retrigger a stuck AI review');
        }
        if (!isRetrigger && !['draft'].includes(application.stage)) {
            throw new Error(`Cannot trigger AI review from stage: ${application.stage}`);
        }

        // Update to ai_review stage (no-op if already ai_review, but re-publishes event)
        if (!isRetrigger) {
            await this.repository.updateApplication(applicationId, {
                stage: 'ai_review',
            });
        }

        // Create audit log entry
        await this.repository.createAuditLog({
            application_id: applicationId,
            action: isRetrigger ? 'ai_review_retriggered' : 'ai_review_started',
            performed_by_user_id: userContext.identityUserId || '00000000-0000-0000-0000-000000000000',
            performed_by_role: this.resolveRole(userContext),
            old_value: { stage: application.stage },
            new_value: { stage: 'ai_review' },
            metadata: {
                job_id: application.job_id,
                candidate_id: application.candidate_id,
                ...(isRetrigger && { retrigger: true }),
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
                    retrigger: isRetrigger,
                });
            } catch (error) {
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
            submitted_at: new Date().toISOString(),
        });

        // Resolve user context early (needed for proposed_by UUID)
        const userContext = await this.accessResolver.resolve(clerkUserId);

        // Create audit log entry for submission
        await this.repository.createAuditLog({
            application_id: applicationId,
            action: 'submitted',
            performed_by_user_id: userContext.identityUserId || '00000000-0000-0000-0000-000000000000',
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, clerkUserId);

        const userContext = await this.accessResolver.resolve(clerkUserId);

        // Create audit log entry
        await this.repository.createAuditLog({
            application_id: application.id,
            action: 'recruiter_proposed',
            performed_by_user_id: userContext.identityUserId || '00000000-0000-0000-0000-000000000000',
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
            performed_by_user_id: userContext.identityUserId || '00000000-0000-0000-0000-000000000000',
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
     * Candidate accepts a job offer.
     * Sets accepted_by_candidate = true on the application and creates an audit log.
     * The application stays in 'offer' stage — the company finalizes the hire separately.
     */
    async acceptOffer(applicationId: string, clerkUserId: string): Promise<any> {
        const application = await this.repository.findApplication(applicationId, clerkUserId);

        if (!application) {
            throw new Error('Application not found');
        }

        if (application.stage !== 'offer') {
            throw new Error(`Cannot accept offer from stage: ${application.stage}. Application must be in offer stage.`);
        }

        // Verify candidate owns this application
        const userContext = await this.accessResolver.resolve(clerkUserId);
        if (!userContext.candidateId || userContext.candidateId !== application.candidate_id) {
            throw new Error('Only the candidate can accept this offer');
        }

        if (application.accepted_by_candidate) {
            throw new Error('Offer has already been accepted');
        }

        const updated = await this.repository.updateApplication(applicationId, {
            accepted_by_candidate: true,
        });

        await this.repository.createAuditLog({
            application_id: applicationId,
            action: 'offer_accepted',
            performed_by_user_id: userContext.identityUserId || '00000000-0000-0000-0000-000000000000',
            performed_by_role: 'candidate',
            old_value: { accepted_by_candidate: false },
            new_value: { accepted_by_candidate: true },
        });

        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.offer_accepted', {
                application_id: applicationId,
                candidate_id: application.candidate_id,
                job_id: application.job_id,
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

        // Enforce role-based authorization (company vs firm job rules)
        this.authorizeStageTransition('hired', userContext, application);

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
            performed_by_user_id: userContext.identityUserId || '00000000-0000-0000-0000-000000000000',
            performed_by_role: 'company',
            old_value: { stage: application.stage },
            new_value: {
                stage: 'hired',
                salary: body.salary,
                start_date: body.start_date || new Date().toISOString().split('T')[0],
            },
        });

        // Publish stage changed event enriched with financial data
        if (this.eventPublisher) {
            // Look up job for fee_percentage and guarantee_days
            const job = await this.repository.getJobById(application.job_id);
            const feePercentage = job?.fee_percentage || null;
            const guaranteeDays = job?.guarantee_days ?? 90;
            const startDate = body.start_date || new Date().toISOString().split('T')[0];

            // Compute guarantee expiration from start_date + guarantee_days
            let guaranteeExpiresAt: string | null = null;
            if (guaranteeDays > 0) {
                const expirationDate = new Date(startDate);
                expirationDate.setDate(expirationDate.getDate() + guaranteeDays);
                guaranteeExpiresAt = expirationDate.toISOString().split('T')[0];
            }

            await this.eventPublisher.publish('application.stage_changed', {
                application_id: applicationId,
                job_id: application.job_id,
                candidate_id: application.candidate_id,
                candidate_recruiter_id: application.candidate_recruiter_id,
                old_stage: application.stage,
                new_stage: 'hired',
                changed_by: userContext.identityUserId,
                salary: body.salary,
                start_date: startDate,
                fee_percentage: feePercentage,
                placement_fee: feePercentage ? Math.round((body.salary * feePercentage) / 100) : null,
                guarantee_days: guaranteeDays,
                guarantee_expires_at: guaranteeExpiresAt,
            });
        }

        return updated;
    }

    /**
     * Request pre-screen for an application
     * Company requests a company recruiter to screen a candidate before proceeding.
     *
     * Selection logic:
     * 1. Application already has company_recruiter_id → use that recruiter
     * 2. Company user explicitly picks a recruiter → use that
     * 3. Auto-assign from company recruiter pool
     *
     * The recruiter is set as company_recruiter_id on the APPLICATION (per-application attribution).
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

        let assignedRecruiterId: string;
        let autoAssign = false;

        if (application.company_recruiter_id) {
            // Application already has a company recruiter assigned
            assignedRecruiterId = application.company_recruiter_id;
        } else if (body.recruiter_id) {
            // Company user explicitly picked a recruiter
            assignedRecruiterId = body.recruiter_id;
        } else {
            // Auto-assign from company recruiter pool
            autoAssign = true;
            const { data: companyRecruiters } = await this.supabase
                .from('recruiter_companies')
                .select('recruiter_id, recruiter:recruiters!inner(status)')
                .eq('company_id', body.company_id)
                .eq('status', 'active');

            const activeRecruiterIds = (companyRecruiters || [])
                .filter((rc: any) => rc.recruiter?.status === 'active')
                .map((rc: any) => rc.recruiter_id);

            if (activeRecruiterIds.length === 0) {
                throw new Error('No available company recruiters for auto-assignment');
            }

            // Pick first available (simple selection — can be enhanced later)
            assignedRecruiterId = activeRecruiterIds[0];
        }

        // Set company_recruiter_id on the APPLICATION
        const updated = await this.repository.updateApplication(applicationId, {
            stage: 'screen',
            company_recruiter_id: assignedRecruiterId,
        });

        // Create audit log entry
        await this.repository.createAuditLog({
            application_id: applicationId,
            action: 'prescreen_requested',
            performed_by_user_id: userContext.identityUserId || '00000000-0000-0000-0000-000000000000',
            performed_by_role: 'company',
            new_value: {
                stage: 'screen',
                company_recruiter_id: assignedRecruiterId,
                auto_assign: autoAssign,
            },
            metadata: {
                company_id: body.company_id,
                has_message: !!body.message,
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
            performed_by_user_id: userContext.identityUserId || '00000000-0000-0000-0000-000000000000',
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
     * Reactivate an expired application.
     * Clears expired_at and last_warning_sent_at, publishes reactivated event.
     * Only the owning recruiter or a platform admin can reactivate.
     */
    async reactivateApplication(applicationId: string, clerkUserId: string): Promise<any> {
        const application = await this.repository.findApplication(applicationId, clerkUserId);
        if (!application) {
            throw new Error('Application not found');
        }

        if (!application.expired_at) {
            throw new Error('Application is not expired');
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);

        // Access control: owning recruiter or platform admin
        const isOwningRecruiter = userContext.recruiterId && userContext.recruiterId === application.candidate_recruiter_id;
        if (!isOwningRecruiter && !userContext.isPlatformAdmin) {
            throw new Error('Only the owning recruiter or a platform admin can reactivate this application');
        }

        const updated = await this.repository.updateApplication(applicationId, {
            expired_at: null,
            last_warning_sent_at: null,
        } as any);

        // Create audit log entry
        await this.repository.createAuditLog({
            application_id: applicationId,
            action: 'reactivated',
            performed_by_user_id: userContext.identityUserId || '00000000-0000-0000-0000-000000000000',
            performed_by_role: userContext.isPlatformAdmin ? 'admin' : 'recruiter',
            old_value: { expired_at: application.expired_at },
            new_value: { expired_at: null },
            metadata: {
                reactivated_from_stage: application.stage,
            },
        });

        // Publish reactivated event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.reactivated', {
                application_id: applicationId,
                job_id: application.job_id,
                candidate_id: application.candidate_id,
                candidate_recruiter_id: application.candidate_recruiter_id,
                reactivated_from_stage: application.stage,
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
