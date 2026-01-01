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
            decline_reason,
            decline_details,
            ...persistedUpdates
        } = updates;

        if (updates.stage && updates.stage !== currentApplication.stage) {
            await this.validateStageTransition(
                currentApplication.stage,
                updates.stage
            );
        }

        // Candidate-specific actions from recruiter_proposed stage
        if (
            clerkUserId &&
            currentApplication.stage === 'recruiter_proposed' &&
            updates.stage &&
            ['ai_review', 'rejected'].includes(updates.stage)
        ) {
            const candidateContext = await this.getCandidateContext(clerkUserId);
            if (!candidateContext || candidateContext.candidate.id !== currentApplication.candidate_id) {
                throw new Error('Not authorized to update this application');
            }

            if (updates.stage === 'ai_review') {
                await this.handleCandidateAcceptance(
                    currentApplication,
                    candidateContext.identityUser.id,
                    document_ids,
                    primary_resume_id,
                    persistedUpdates.candidate_notes
                );
            } else if (updates.stage === 'rejected') {
                await this.handleCandidateDecline(
                    currentApplication,
                    candidateContext.identityUser.id,
                    decline_reason || persistedUpdates.notes || decline_details,
                    decline_details
                );
                if (!persistedUpdates.notes) {
                    persistedUpdates.notes = decline_details;
                }
            }
        }
        if (
            updates.stage === 'rejected' &&
            !persistedUpdates.notes &&
            !decline_details &&
            !decline_reason
        ) {
            throw new Error('Notes/rejection reason required when rejecting');
        }

        const updatedApplication = await this.repository.updateApplication(id, persistedUpdates);

        if (this.eventPublisher) {
            if (updates.stage && updates.stage !== currentApplication.stage) {
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
        // Define allowed stage transitions
        const allowedTransitions: Record<string, string[]> = {
            applied: ['screening', 'rejected'],
            screening: ['interview', 'rejected', 'applied'],
            interview: ['offer', 'rejected', 'screening'],
            offer: ['hired', 'rejected', 'interview'],
            hired: ['rejected'], // Can reject after hire (fell through)
            recruiter_proposed: ['ai_review', 'rejected'],
            rejected: [], // Cannot move from rejected
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

    private async handleCandidateAcceptance(
        application: any,
        identityUserId: string,
        documentIds?: string[],
        primaryResumeId?: string,
        candidateNotes?: string
    ) {
        const job = await this.repository.getJobById(application.job_id);
        if (!job) {
            throw new Error('Job not found');
        }
        if (job.status && job.status !== 'active') {
            throw new Error('This job is no longer accepting applications');
        }

        if (documentIds && documentIds.length > 0) {
            for (const docId of documentIds) {
                await this.repository.linkDocumentToApplication(
                    docId,
                    application.id,
                    !!primaryResumeId && docId === primaryResumeId
                );
            }
        }

        await this.repository.createAuditLog({
            application_id: application.id,
            action: 'candidate_approved_opportunity',
            performed_by_user_id: identityUserId,
            performed_by_role: 'candidate',
            old_value: { stage: 'recruiter_proposed' },
            new_value: {
                stage: 'ai_review',
                primary_resume_id: primaryResumeId,
                candidate_notes: candidateNotes,
            },
        });

        if (this.eventPublisher) {
            // Publish event to trigger AI review (matches V1 event name)
            await this.eventPublisher.publish(
                'application.submitted_for_ai_review',
                {
                    application_id: application.id,
                    candidate_id: application.candidate_id,
                    recruiter_id: application.recruiter_id,
                    job_id: application.job_id,
                    document_ids: documentIds || [],
                    primary_resume_id: primaryResumeId || null,
                    submitted_at: new Date().toISOString(),
                }
            );
        }
    }

    private async handleCandidateDecline(
        application: any,
        identityUserId: string,
        reason?: string | null,
        details?: string | null
    ) {
        await this.repository.createAuditLog({
            application_id: application.id,
            action: 'candidate_declined_opportunity',
            performed_by_user_id: identityUserId,
            performed_by_role: 'candidate',
            old_value: { stage: 'recruiter_proposed' },
            new_value: {
                stage: 'rejected',
                reason,
                details,
            },
        });

        if (this.eventPublisher) {
            await this.eventPublisher.publish(
                'application.candidate_declined',
                {
                    application_id: application.id,
                    candidate_id: application.candidate_id,
                    recruiter_id: application.recruiter_id,
                    job_id: application.job_id,
                }
            );
        }
    }
}
