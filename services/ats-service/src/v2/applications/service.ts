/**
 * Applications Service - V2
 * Handles ALL application updates with smart validation
 */

import { ApplicationRepository } from './repository';
import { ApplicationFilters, ApplicationUpdate } from './types';
import { EventPublisher } from '../shared/events';
import { PaginationResponse, buildPaginationResponse, validatePaginationParams } from '../shared/pagination';

export class ApplicationServiceV2 {
    constructor(
        private repository: ApplicationRepository,
        private eventPublisher?: EventPublisher
    ) { }

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
        let identityUserId = data.user_id;

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

        // Extract document-related fields that shouldn't be persisted to applications table
        const { document_ids, primary_resume_id, pre_screen_answers, ...applicationData } = data;

        // Determine initial stage:
        // - recruiter_proposed: Recruiter submitted on behalf of candidate
        // - ai_review: Direct candidate application (no recruiter)
        const hasRecruiter = !!data.recruiter_id;
        const initialStage = data.stage || (hasRecruiter ? 'recruiter_proposed' : 'ai_review');

        const application = await this.repository.createApplication({
            ...applicationData,
            candidate_id: candidateId,
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
                        docId === primary_resume_id
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
                candidate_id: application.candidate_id,
                recruiter_id: application.recruiter_id || null,
            },
            metadata: {
                has_recruiter: hasRecruiter,
                document_count: document_ids?.length || 0,
                has_pre_screen_answers: !!(pre_screen_answers?.length),
            },
        });

        // Emit event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.created', {
                application_id: application.id,
                job_id: application.job_id,
                candidate_id: application.candidate_id,
                recruiter_id: application.recruiter_id || null,
                has_recruiter: !!application.recruiter_id,
                stage: application.stage,
                created_by: identityUserId,
            });
        }

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

        // Validate rejection has notes
        if (
            updates.stage === 'rejected' &&
            !persistedUpdates.notes &&
            !decline_details &&
            !decline_reason
        ) {
            throw new Error('Notes/rejection reason required when rejecting');
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
                performed_by_user_id: identityUserId,
                performed_by_role: userRole || 'unknown',
                old_value: { stage: currentApplication.stage },
                new_value: { stage: updates.stage },
                metadata: {
                    job_id: updatedApplication.job_id,
                    candidate_id: updatedApplication.candidate_id,
                    recruiter_id: updatedApplication.recruiter_id,
                    decline_reason: decline_reason || null,
                    decline_details: decline_details || null,
                },
            });
        }

        // Publish events
        if (this.eventPublisher) {
            // Stage changed event - other services listen and react to stages they care about
            if (updates.stage) {
                await this.eventPublisher.publish('application.stage_changed', {
                    application_id: id,
                    job_id: updatedApplication.job_id,
                    candidate_id: updatedApplication.candidate_id,
                    recruiter_id: updatedApplication.recruiter_id,
                    old_stage: currentApplication.stage,
                    new_stage: updates.stage,
                    changed_by: identityUserId,
                });
            }

            // Generic update event
            await this.eventPublisher.publish('application.updated', {
                application_id: id,
                job_id: updatedApplication.job_id,
                candidate_id: updatedApplication.candidate_id,
                updated_fields: Object.keys(persistedUpdates),
                updated_by: identityUserId,
            });
        }

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
            await this.eventPublisher.publish('application.deleted', {
                applicationId: id,
                deletedBy: identityUserId,
            });
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
            draft: ['ai_review', 'screen', 'rejected'], // Draft can move to review or screening
            recruiter_proposed: ['ai_review', 'draft', 'rejected'], // Recruiter proposal can be reviewed or sent back
            recruiter_request: ['draft', 'ai_review', 'rejected'], // Candidate responds to request, or recruiter rejects
            ai_review: ['screen', 'rejected'], // After AI review, move to screening or reject
            screen: ['submitted', 'rejected'], // After screening, submit to company or reject
            submitted: ['interview', 'rejected'], // Company reviews application
            interview: ['offer', 'rejected'], // Interview stage
            offer: ['hired', 'rejected'], // Offer stage
            hired: [], // Terminal state
            rejected: [], // Terminal state
            withdrawn: [], // Terminal state
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
}
