/**
 * Proposal Service — Recruiter proposes jobs to candidates
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events';
import { ApplicationRepository } from '../repository';

export class ProposalService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ApplicationRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async proposeJobToCandidate(
    data: {
      candidate_recruiter_id: string;
      candidate_id: string;
      job_id: string;
      pitch?: string;
      notes?: string;
    },
    clerkUserId: string
  ) {
    if (!data.candidate_recruiter_id || !data.candidate_id || !data.job_id) {
      throw new BadRequestError('candidate_recruiter_id, candidate_id, and job_id are required');
    }

    // Verify recruiter is active
    const { data: recruiter } = await this.supabase
      .from('recruiters').select('id, status')
      .eq('id', data.candidate_recruiter_id).single();
    if (!recruiter || recruiter.status !== 'active') {
      throw new BadRequestError('Invalid or inactive recruiter');
    }

    // Verify candidate exists
    const { data: candidate } = await this.supabase
      .from('candidates').select('id').eq('id', data.candidate_id).single();
    if (!candidate) throw new NotFoundError('Candidate', data.candidate_id);

    // Verify job is active
    const { data: job } = await this.supabase
      .from('jobs').select('id, status').eq('id', data.job_id).single();
    if (!job || job.status !== 'active') {
      throw new BadRequestError('Invalid or inactive job');
    }

    // Check for duplicate active application
    const { data: existing } = await this.supabase
      .from('applications').select('id')
      .eq('candidate_id', data.candidate_id)
      .eq('job_id', data.job_id)
      .not('stage', 'in', '(rejected,withdrawn,hired)')
      .limit(1);
    if (existing?.length) {
      throw new BadRequestError('Candidate already has an active application for this job');
    }

    const application = await this.repository.create({
      candidate_id: data.candidate_id,
      job_id: data.job_id,
      candidate_recruiter_id: data.candidate_recruiter_id,
      stage: 'recruiter_proposed',
      application_source: 'recruiter',
      metadata: {
        ...(data.pitch && { proposal_pitch: data.pitch }),
        ...(data.notes && { proposal_notes: data.notes }),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const context = await this.accessResolver.resolve(clerkUserId);

    await this.repository.createAuditLog({
      application_id: application.id,
      action: 'recruiter_proposed',
      performed_by_user_id: context.identityUserId || '00000000-0000-0000-0000-000000000000',
      performed_by_role: 'recruiter',
      new_value: { stage: 'recruiter_proposed', candidate_recruiter_id: data.candidate_recruiter_id },
      metadata: { pitch: data.pitch || null, notes: data.notes || null },
    });

    await this.eventPublisher?.publish('application.recruiter_proposed', {
      application_id: application.id,
      candidate_recruiter_id: data.candidate_recruiter_id,
      candidate_id: data.candidate_id,
      job_id: data.job_id,
      proposed_by: context.identityUserId,
      pitch: data.pitch || null,
      notes: data.notes || null,
    }, 'ats-service');

    return application;
  }

  async acceptProposal(id: string, clerkUserId: string) {
    const application = await this.repository.findById(id);
    if (!application) throw new NotFoundError('Application', id);

    if (application.stage !== 'recruiter_proposed') {
      throw new BadRequestError(`Cannot accept proposal from stage: ${application.stage}`);
    }

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.candidateId || context.candidateId !== application.candidate_id) {
      throw new ForbiddenError('Only the candidate can accept this proposal');
    }

    const updated = await this.repository.update(id, { stage: 'draft' });

    await this.repository.createAuditLog({
      application_id: id, action: 'proposal_accepted',
      performed_by_user_id: context.identityUserId || '00000000-0000-0000-0000-000000000000',
      performed_by_role: 'candidate',
      old_value: { stage: 'recruiter_proposed' },
      new_value: { stage: 'draft' },
    });

    await this.eventPublisher?.publish('application.proposal_accepted', {
      application_id: id, candidate_id: application.candidate_id,
      job_id: application.job_id, candidate_recruiter_id: application.candidate_recruiter_id,
      accepted_by: context.identityUserId,
    }, 'ats-service');

    return updated;
  }

  async declineProposal(id: string, clerkUserId: string, reason?: string) {
    const application = await this.repository.findById(id);
    if (!application) throw new NotFoundError('Application', id);

    if (application.stage !== 'recruiter_proposed') {
      throw new BadRequestError(`Cannot decline proposal from stage: ${application.stage}`);
    }

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.candidateId || context.candidateId !== application.candidate_id) {
      throw new ForbiddenError('Only the candidate can decline this proposal');
    }

    const updated = await this.repository.update(id, {
      stage: 'rejected',
      ...(reason && { decline_reason: reason }),
    });

    await this.repository.createAuditLog({
      application_id: id, action: 'proposal_declined',
      performed_by_user_id: context.identityUserId || '00000000-0000-0000-0000-000000000000',
      performed_by_role: 'candidate',
      old_value: { stage: 'recruiter_proposed' },
      new_value: { stage: 'rejected', decline_reason: reason || null },
    });

    await this.eventPublisher?.publish('application.proposal_declined', {
      application_id: id, candidate_id: application.candidate_id,
      job_id: application.job_id, declined_by: context.identityUserId,
      candidate_recruiter_id: application.candidate_recruiter_id,
      reason: reason || null,
    }, 'ats-service');

    return updated;
  }
}
