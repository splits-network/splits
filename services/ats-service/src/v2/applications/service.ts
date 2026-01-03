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
    ) {}

    async getApplications(
        clerkUserId: string,
        filters: ApplicationFilters
    ): Promise<{
        data: any[];
        pagination: PaginationResponse<any>['pagination'];
    }> {
        const { page, limit } = validatePaginationParams(filters.page, filters.limit);

        const { data, total } = await this.repository.findApplications(clerkUserId, {
            ...filters,
            page,
            limit,
        });

        return {
            data,
            pagination: buildPaginationResponse<any>(data, total, page, limit).pagination,
        };
    }

    async getApplication(id: string, clerkUserId?: string, includes: string[] = []): Promise<any> {
        const application = await this.repository.findApplication(id, clerkUserId);
        if (!application) {
            throw new Error(`Application ${id} not found`);
        }

        if (!includes || includes.length === 0) {
            return application;
        }

        const includeSet = new Set(
            includes
                .map(include => include?.toLowerCase?.().trim())
                .filter((value): value is string => Boolean(value))
        );

        const enrichedApplication: any = { ...application };
        const tasks: Promise<void>[] = [];

        const hasInclude = (...keys: string[]) => keys.some(key => includeSet.has(key));

        if (hasInclude('candidate') && application.candidate_id) {
            tasks.push(
                this.repository
                    .getCandidateById(application.candidate_id)
                    .then(candidate => {
                        if (candidate) {
                            enrichedApplication.candidate = candidate;
                        }
                    })
            );
        }

        if (hasInclude('job') && application.job_id) {
            tasks.push(
                this.repository.getJobById(application.job_id).then(job => {
                    if (job) {
                        enrichedApplication.job = job;
                    }
                })
            );
        }

        if (hasInclude('recruiter') && application.recruiter_id) {
            tasks.push(
                this.repository.getRecruiterById(application.recruiter_id).then(recruiter => {
                    if (recruiter) {
                        enrichedApplication.recruiter = recruiter;
                    }
                })
            );
        }

        if (hasInclude('documents', 'document')) {
            tasks.push(
                this.repository.getDocumentsForApplication(application.id).then(docs => {
                    enrichedApplication.documents = docs;
                })
            );
        }

        if (hasInclude('pre_screen_answers', 'pre-screen-answers')) {
            tasks.push(
                this.repository
                    .getPreScreenAnswersForApplication(application.id)
                    .then(answers => {
                        enrichedApplication.pre_screen_answers = answers;
                    })
            );
        }

        if (hasInclude('audit_log', 'audit')) {
            tasks.push(
                this.repository.getAuditLogsForApplication(application.id).then(logs => {
                    enrichedApplication.audit_log = logs;
                })
            );
        }

        if (hasInclude('job_requirements') && application.job_id) {
            tasks.push(
                this.repository.getJobRequirements(application.job_id).then(requirements => {
                    enrichedApplication.job_requirements = requirements;
                })
            );
        }

        if (hasInclude('ai_review', 'ai-review')) {
            tasks.push(
                this.repository.getAIReviewForApplication(application.id).then(review => {
                    enrichedApplication.ai_review = review || null;
                })
            );
        }

        await Promise.all(tasks);
        return enrichedApplication;
    }

    async createApplication(data: any, clerkUserId?: string): Promise<any> {
        // Validation
        if (!data.job_id) {
            throw new Error('Job ID is required');
        }
        
        // Auto-resolve candidate_id from clerkUserId if not provided
        let candidateId = data.candidate_id;
        if (!candidateId && clerkUserId) {
            const candidateContext = await this.getCandidateContext(clerkUserId);
            if (candidateContext) {
                candidateId = candidateContext.candidate.id;
            }
        }
        
        if (!candidateId) {
            throw new Error('Candidate ID is required and could not be resolved from user context');
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

        // Emit event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.created', {
                application_id: application.id,
                job_id: application.job_id,
                candidate_id: application.candidate_id,
                recruiter_id: application.recruiter_id || null,
                has_recruiter: !!application.recruiter_id,
                stage: application.stage,
                created_by: clerkUserId,
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
                    changed_by: clerkUserId,
                });
            }

            // Generic update event
            await this.eventPublisher.publish('application.updated', {
                application_id: id,
                job_id: updatedApplication.job_id,
                candidate_id: updatedApplication.candidate_id,
                updated_fields: Object.keys(persistedUpdates),
                updated_by: clerkUserId,
            });
        }

        return updatedApplication;
    }

    async deleteApplication(id: string, clerkUserId?: string): Promise<void> {
        const application = await this.repository.findApplication(id, clerkUserId);
        if (!application) {
            throw new Error(`Application ${id} not found`);
        }

        await this.repository.deleteApplication(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('application.deleted', {
                applicationId: id,
                deletedBy: clerkUserId,
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
