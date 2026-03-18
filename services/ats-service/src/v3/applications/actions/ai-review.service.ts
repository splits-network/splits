/**
 * AI Review Service — Trigger review, return to draft, submit
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events';
import { ApplicationRepository } from '../repository';

export class AIReviewService {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: ApplicationRepository,
        private supabase: SupabaseClient,
        private eventPublisher?: IEventPublisher
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    /**
     * Trigger AI review for an application.
     * Candidates trigger from draft; admins can retrigger stuck ai_review.
     */
    async triggerReview(id: string, clerkUserId: string) {
        const application = await this.repository.findById(id);
        if (!application) throw new NotFoundError('Application', id);

        const context = await this.accessResolver.resolve(clerkUserId);
        const isRetrigger = application.stage === 'ai_review' || application.stage === 'gpt_review';

        if (isRetrigger && !context.isPlatformAdmin) {
            throw new ForbiddenError('Only platform admins can retrigger a stuck AI review');
        }
        if (!isRetrigger && application.stage !== 'draft' && application.stage !== 'ai_failed') {
            throw new BadRequestError(`Cannot trigger AI review from stage: ${application.stage}`);
        }

        if (!isRetrigger) {
            await this.repository.update(id, { stage: 'ai_review' });
        }

        await this.repository.createAuditLog({
            application_id: id,
            action: isRetrigger ? 'ai_review_retriggered' : 'ai_review_started',
            performed_by_user_id: context.identityUserId || '00000000-0000-0000-0000-000000000000',
            performed_by_role: this.resolveRole(context),
            old_value: { stage: application.stage },
            new_value: { stage: 'ai_review' },
            metadata: {
                job_id: application.job_id, candidate_id: application.candidate_id,
                ...(isRetrigger && { retrigger: true })
            },
        });

        await this.eventPublisher?.publish('application.stage_changed', {
            application_id: id, candidate_id: application.candidate_id,
            job_id: application.job_id, old_stage: application.stage,
            new_stage: 'ai_review', changed_by: context.identityUserId,
            retrigger: isRetrigger,
        }, 'ats-service');
    }

    /**
     * Return application to draft stage.
     * Candidate wants to edit after AI review.
     */
    async returnToDraft(id: string, clerkUserId: string) {
        const application = await this.repository.findById(id);
        if (!application) throw new NotFoundError('Application', id);

        if (!['ai_reviewed', 'recruiter_request', 'screen'].includes(application.stage)) {
            throw new BadRequestError(`Cannot return to draft from stage: ${application.stage}`);
        }

        const updated = await this.repository.update(id, {
            stage: 'draft',
            ai_reviewed: false,
        });

        const context = await this.accessResolver.resolve(clerkUserId);

        await this.repository.createAuditLog({
            application_id: id, action: 'returned_to_draft',
            performed_by_user_id: context.identityUserId || '00000000-0000-0000-0000-000000000000',
            performed_by_role: context.recruiterId ? 'recruiter' : 'candidate',
            old_value: { stage: application.stage },
            new_value: { stage: 'draft' },
            metadata: { from_stage: application.stage },
        });

        await this.eventPublisher?.publish('application.returned_to_draft', {
            application_id: id, from_stage: application.stage,
            updatedBy: context.identityUserId,
        }, 'ats-service');

        return updated;
    }

    /**
     * Submit application after AI review.
     * Routes to recruiter_review (if recruiter) or submitted (direct).
     */
    async submitApplication(id: string, clerkUserId: string) {
        const application = await this.repository.findById(id);
        if (!application) throw new NotFoundError('Application', id);

        if (!['ai_reviewed', 'screen'].includes(application.stage)) {
            throw new BadRequestError(`Cannot submit from stage: ${application.stage}. Must be in ai_reviewed or screen stage.`);
        }

        const nextStage = application.candidate_recruiter_id ? 'recruiter_review' : 'submitted';
        const updated = await this.repository.update(id, {
            stage: nextStage,
            submitted_at: new Date().toISOString(),
        });

        const context = await this.accessResolver.resolve(clerkUserId);

        await this.repository.createAuditLog({
            application_id: id, action: 'submitted',
            performed_by_user_id: context.identityUserId || '00000000-0000-0000-0000-000000000000',
            performed_by_role: 'candidate',
            old_value: { stage: application.stage },
            new_value: { stage: nextStage },
            metadata: { has_recruiter: !!application.candidate_recruiter_id },
        });

        await this.eventPublisher?.publish('application.submitted', {
            application_id: id, candidate_id: application.candidate_id,
            job_id: application.job_id, submittedBy: context.identityUserId,
        }, 'ats-service');

        await this.eventPublisher?.publish('application.stage_changed', {
            application_id: id,
            candidate_id: application.candidate_id,
            job_id: application.job_id,
            old_stage: application.stage,
            new_stage: nextStage,
            changed_by: context.identityUserId,
            candidate_recruiter_id: application.candidate_recruiter_id,
        }, 'ats-service');

        return { application: updated };
    }

    /**
     * Handle AI review completion event (called by domain consumer).
     * Transitions application from 'ai_review' to 'ai_reviewed'.
     * Candidate must review feedback before submission.
     */
    async handleAIReviewCompleted(data: {
        application_id: string;
        review_id?: string;
        ai_review_id?: string;
        recommendation?: 'strong_fit' | 'good_fit' | 'fair_fit' | 'poor_fit';
        fit_score?: number;
        concerns?: string[];
    }) {
        const reviewId = data.review_id || data.ai_review_id;
        const application = await this.repository.findById(data.application_id);
        if (!application) return;

        // Only transition if still in a review stage
        if (application.stage !== 'ai_review' && application.stage !== 'gpt_review') {
            return;
        }

        await this.repository.update(data.application_id, {
            stage: 'ai_reviewed',
            ai_reviewed: true,
        });

        await this.repository.createAuditLog({
            application_id: data.application_id,
            action: 'ai_review_completed',
            performed_by_user_id: '00000000-0000-0000-0000-000000000000',
            performed_by_role: 'system',
            old_value: { stage: application.stage },
            new_value: { stage: 'ai_reviewed' },
            metadata: {
                review_id: reviewId,
                recommendation: data.recommendation,
                fit_score: data.fit_score,
                concern_count: data.concerns?.length ?? 0,
            },
        });

        await this.eventPublisher?.publish('application.ai_reviewed', {
            application_id: data.application_id,
            review_id: reviewId,
            recommendation: data.recommendation,
            has_concerns: (data.concerns?.length ?? 0) > 0,
        }, 'ats-service');

        await this.eventPublisher?.publish('application.stage_changed', {
            application_id: data.application_id,
            candidate_id: application.candidate_id,
            job_id: application.job_id,
            old_stage: application.stage,
            new_stage: 'ai_reviewed',
            changed_by: '00000000-0000-0000-0000-000000000000',
        }, 'ats-service');

        // If poor/fair fit with concerns, publish needs_improvement
        if (
            data.recommendation === 'poor_fit' ||
            (data.recommendation === 'fair_fit' && (data.concerns?.length ?? 0) > 0)
        ) {
            await this.eventPublisher?.publish('application.needs_improvement', {
                application_id: data.application_id,
                concerns: data.concerns,
            }, 'ats-service');
        }
    }

    /**
     * Handle AI review failure event (called by domain consumer).
     * Transitions application to 'ai_failed' so candidate can retry.
     */
    async handleAIReviewFailed(data: {
        application_id: string;
        error?: string;
    }) {
        const application = await this.repository.findById(data.application_id);
        if (!application) return;

        if (application.stage !== 'ai_review' && application.stage !== 'gpt_review') {
            return;
        }

        await this.repository.update(data.application_id, { stage: 'ai_failed' });

        await this.repository.createAuditLog({
            application_id: data.application_id,
            action: 'ai_review_failed',
            performed_by_user_id: '00000000-0000-0000-0000-000000000000',
            performed_by_role: 'system',
            old_value: { stage: application.stage },
            new_value: { stage: 'ai_failed' },
            metadata: { error: data.error },
        });

        await this.eventPublisher?.publish('application.stage_changed', {
            application_id: data.application_id,
            candidate_id: application.candidate_id,
            job_id: application.job_id,
            old_stage: application.stage,
            new_stage: 'ai_failed',
            changed_by: '00000000-0000-0000-0000-000000000000',
        }, 'ats-service');
    }

    private resolveRole(context: any): string {
        if (context.isPlatformAdmin) return 'admin';
        if (context.recruiterId) return 'recruiter';
        if (context.candidateId) return 'candidate';
        return 'system';
    }
}
