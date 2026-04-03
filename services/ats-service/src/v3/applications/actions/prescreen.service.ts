/**
 * Prescreen Service — Company requests recruiter pre-screen
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { ApplicationRepository } from '../repository.js';

export class PrescreenService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ApplicationRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  /**
   * Request pre-screen for an application.
   *
   * Selection logic:
   * 1. Application already has company_recruiter_id -> use that recruiter
   * 2. Company user explicitly picks a recruiter -> use that
   * 3. Auto-assign from company recruiter pool
   */
  async requestPrescreen(
    id: string,
    body: { company_id: string; recruiter_id?: string; message?: string },
    clerkUserId: string
  ) {
    const application = await this.repository.findById(id);
    if (!application) throw new NotFoundError('Application', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    let assignedRecruiterId: string;
    let autoAssign = false;

    if (application.company_recruiter_id) {
      assignedRecruiterId = application.company_recruiter_id;
    } else if (body.recruiter_id) {
      assignedRecruiterId = body.recruiter_id;
    } else {
      autoAssign = true;
      const { data: companyRecruiters } = await this.supabase
        .from('recruiter_companies')
        .select('recruiter_id, recruiter:recruiters!inner(status)')
        .eq('company_id', body.company_id)
        .eq('status', 'active');

      const activeIds = (companyRecruiters || [])
        .filter((rc: any) => rc.recruiter?.status === 'active')
        .map((rc: any) => rc.recruiter_id);

      if (!activeIds.length) {
        throw new BadRequestError('No available company recruiters for auto-assignment');
      }
      assignedRecruiterId = activeIds[0];
    }

    const updated = await this.repository.update(id, {
      stage: 'screen',
      company_recruiter_id: assignedRecruiterId,
    });

    await this.repository.createAuditLog({
      application_id: id, action: 'prescreen_requested',
      performed_by_user_id: context.identityUserId || '00000000-0000-0000-0000-000000000000',
      performed_by_role: 'company',
      new_value: { stage: 'screen', company_recruiter_id: assignedRecruiterId, auto_assign: autoAssign },
      metadata: { company_id: body.company_id, has_message: !!body.message },
    });

    await this.eventPublisher?.publish('application.prescreen_requested', {
      application_id: id, job_id: application.job_id,
      candidate_id: application.candidate_id, company_id: body.company_id,
      recruiter_id: assignedRecruiterId,
      requested_by_user_id: context.identityUserId,
      message: body.message || null, auto_assign: autoAssign,
    }, 'ats-service');

    return updated;
  }

  /**
   * Reactivate an expired application.
   * Clears expired_at. Only owning recruiter or admin.
   */
  async reactivateApplication(id: string, clerkUserId: string) {
    const application = await this.repository.findById(id);
    if (!application) throw new NotFoundError('Application', id);

    if (!application.expired_at) {
      throw new BadRequestError('Application is not expired');
    }

    const context = await this.accessResolver.resolve(clerkUserId);
    const isOwner = context.recruiterId === application.candidate_recruiter_id;
    if (!isOwner && !context.isPlatformAdmin) {
      throw new ForbiddenError('Only the owning recruiter or a platform admin can reactivate');
    }

    const updated = await this.repository.update(id, {
      expired_at: null,
      last_warning_sent_at: null,
    });

    await this.repository.createAuditLog({
      application_id: id, action: 'reactivated',
      performed_by_user_id: context.identityUserId || '00000000-0000-0000-0000-000000000000',
      performed_by_role: context.isPlatformAdmin ? 'admin' : 'recruiter',
      old_value: { expired_at: application.expired_at },
      new_value: { expired_at: null },
      metadata: { reactivated_from_stage: application.stage },
    });

    await this.eventPublisher?.publish('application.reactivated', {
      application_id: id, job_id: application.job_id,
      candidate_id: application.candidate_id,
      candidate_recruiter_id: application.candidate_recruiter_id,
      reactivated_from_stage: application.stage,
    }, 'ats-service');

    return updated;
  }
}
