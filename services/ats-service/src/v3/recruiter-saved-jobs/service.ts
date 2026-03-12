/**
 * Recruiter Saved Jobs V3 Service
 * Idempotent create, recruiter-only access, event publishing
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { RecruiterSavedJobRepository } from './repository';
import { CreateRecruiterSavedJobInput, RecruiterSavedJobListParams } from './types';

export class RecruiterSavedJobService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: RecruiterSavedJobRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: RecruiterSavedJobListParams, clerkUserId: string) {
    const recruiterId = await this.resolveRecruiterId(clerkUserId);
    const { data, total } = await this.repository.findAll(recruiterId, params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string) {
    const recruiterId = await this.resolveRecruiterId(clerkUserId);
    const item = await this.repository.findById(id, recruiterId);
    if (!item) throw new NotFoundError('RecruiterSavedJob', id);
    return item;
  }

  async create(input: CreateRecruiterSavedJobInput, clerkUserId: string) {
    if (!input.job_id) throw new BadRequestError('job_id is required');
    const recruiterId = await this.resolveRecruiterId(clerkUserId);

    // Idempotent — return existing if already saved
    const existing = await this.repository.findByJobId(recruiterId, input.job_id);
    if (existing) return existing;

    const saved = await this.repository.create(recruiterId, input.job_id);

    await this.eventPublisher?.publish('recruiter_saved_job.created', {
      savedJobId: saved.id,
      recruiterId: saved.recruiter_id,
      jobId: saved.job_id,
    }, 'ats-service');

    return saved;
  }

  async delete(id: string, clerkUserId: string) {
    const recruiterId = await this.resolveRecruiterId(clerkUserId);

    const existing = await this.repository.findById(id, recruiterId);
    if (!existing) throw new NotFoundError('RecruiterSavedJob', id);

    const deleted = await this.repository.delete(id, recruiterId);

    await this.eventPublisher?.publish('recruiter_saved_job.deleted', {
      savedJobId: deleted.id,
      recruiterId: deleted.recruiter_id,
      jobId: deleted.job_id,
    }, 'ats-service');
  }

  private async resolveRecruiterId(clerkUserId: string): Promise<string> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.recruiterId) {
      throw new ForbiddenError('Recruiter profile not found for user');
    }
    return context.recruiterId;
  }
}
