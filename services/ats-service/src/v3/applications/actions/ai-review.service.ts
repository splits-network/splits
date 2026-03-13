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
    const isRetrigger = application.stage === 'ai_review';

    if (isRetrigger && !context.isPlatformAdmin) {
      throw new ForbiddenError('Only platform admins can retrigger a stuck AI review');
    }
    if (!isRetrigger && application.stage !== 'draft') {
      throw new BadRequestError(`Cannot trigger AI review from stage: ${application.stage}`);
    }

    if (!isRetrigger) {
      await this.repository.update(id, { stage: 'ai_review' });
    }

    await this.repository.createAuditLog({
      application_id: id,
      action: isRetrigger ? 'ai_review_retriggered' : 'ai_review_started',
      performed_by_user_id: context.identityUserId || 'system',
      performed_by_role: this.resolveRole(context),
      old_value: { stage: application.stage },
      new_value: { stage: 'ai_review' },
      metadata: { job_id: application.job_id, candidate_id: application.candidate_id,
        ...(isRetrigger && { retrigger: true }) },
    });

    await this.eventPublisher?.publish('application.ai_review.triggered', {
      application_id: id, candidate_id: application.candidate_id,
      job_id: application.job_id, triggeredBy: context.identityUserId,
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
      performed_by_user_id: context.identityUserId || 'system',
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
      performed_by_user_id: context.identityUserId || 'system',
      performed_by_role: 'candidate',
      old_value: { stage: application.stage },
      new_value: { stage: nextStage },
      metadata: { has_recruiter: !!application.candidate_recruiter_id },
    });

    await this.eventPublisher?.publish('application.submitted', {
      application_id: id, candidate_id: application.candidate_id,
      job_id: application.job_id, submittedBy: context.identityUserId,
    }, 'ats-service');

    return { application: updated };
  }

  private resolveRole(context: any): string {
    if (context.isPlatformAdmin) return 'admin';
    if (context.recruiterId) return 'recruiter';
    if (context.candidateId) return 'candidate';
    return 'system';
  }
}
