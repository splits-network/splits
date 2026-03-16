/**
 * Hire Service — Offer acceptance and hiring workflow
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events';
import { ApplicationRepository } from '../repository';
import { authorizeStageTransition } from './stage-validation';

export class HireService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ApplicationRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  /**
   * Candidate accepts a job offer.
   * Sets accepted_by_candidate = true. Application stays in 'offer' stage.
   */
  async acceptOffer(id: string, clerkUserId: string) {
    const application = await this.repository.findById(id);
    if (!application) throw new NotFoundError('Application', id);

    if (application.stage !== 'offer') {
      throw new BadRequestError(`Cannot accept offer from stage: ${application.stage}`);
    }

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.candidateId || context.candidateId !== application.candidate_id) {
      throw new ForbiddenError('Only the candidate can accept this offer');
    }

    if (application.accepted_by_candidate) {
      throw new BadRequestError('Offer has already been accepted');
    }

    const updated = await this.repository.update(id, { accepted_by_candidate: true });

    await this.repository.createAuditLog({
      application_id: id, action: 'offer_accepted',
      performed_by_user_id: context.identityUserId || '00000000-0000-0000-0000-000000000000',
      performed_by_role: 'candidate',
      old_value: { accepted_by_candidate: false },
      new_value: { accepted_by_candidate: true },
    });

    await this.eventPublisher?.publish('application.offer_accepted', {
      application_id: id, candidate_id: application.candidate_id,
      job_id: application.job_id, accepted_by: context.identityUserId,
    }, 'ats-service');

    return updated;
  }

  /**
   * Hire a candidate — transitions to 'hired' stage.
   * Placement creation is handled by the route handler via PlacementService.
   */
  async hireCandidate(
    id: string,
    body: { salary: number; start_date?: string; notes?: string },
    clerkUserId: string
  ) {
    const application = await this.repository.findByIdWithJob(id);
    if (!application) throw new NotFoundError('Application', id);

    if (application.stage !== 'offer') {
      throw new BadRequestError(`Cannot hire from stage: ${application.stage}. Must be in offer stage.`);
    }

    if (!body.salary || body.salary <= 0) {
      throw new BadRequestError('Valid salary amount is required');
    }

    const context = await this.accessResolver.resolve(clerkUserId);
    authorizeStageTransition('hired', context, application);

    const updated = await this.repository.update(id, {
      stage: 'hired',
      salary: body.salary,
    });

    await this.repository.createAuditLog({
      application_id: id, action: 'hired',
      performed_by_user_id: context.identityUserId || '00000000-0000-0000-0000-000000000000',
      performed_by_role: 'company',
      old_value: { stage: application.stage },
      new_value: {
        stage: 'hired', salary: body.salary,
        start_date: body.start_date || new Date().toISOString().split('T')[0],
      },
    });

    if (this.eventPublisher) {
      const { data: job } = await this.supabase
        .from('jobs').select('fee_percentage, guarantee_days')
        .eq('id', application.job_id).single();

      const startDate = body.start_date || new Date().toISOString().split('T')[0];
      const guaranteeDays = job?.guarantee_days ?? 90;
      let guaranteeExpiresAt: string | null = null;
      if (guaranteeDays > 0) {
        const exp = new Date(startDate);
        exp.setDate(exp.getDate() + guaranteeDays);
        guaranteeExpiresAt = exp.toISOString().split('T')[0];
      }

      await this.eventPublisher.publish('application.stage_changed', {
        application_id: id, job_id: application.job_id,
        candidate_id: application.candidate_id,
        candidate_recruiter_id: application.candidate_recruiter_id,
        old_stage: application.stage, new_stage: 'hired',
        changed_by: context.identityUserId,
        salary: body.salary, start_date: startDate,
        fee_percentage: job?.fee_percentage || null,
        placement_fee: job?.fee_percentage ? Math.round((body.salary * job.fee_percentage) / 100) : null,
        guarantee_days: guaranteeDays,
        guarantee_expires_at: guaranteeExpiresAt,
      }, 'ats-service');
    }

    return updated;
  }
}
