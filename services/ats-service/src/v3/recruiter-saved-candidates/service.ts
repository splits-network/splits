/**
 * Recruiter Saved Candidates V3 Service
 * Idempotent create, recruiter-only access, event publishing
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { RecruiterSavedCandidateRepository } from './repository';
import { CreateRecruiterSavedCandidateInput, RecruiterSavedCandidateListParams } from './types';

export class RecruiterSavedCandidateService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: RecruiterSavedCandidateRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: RecruiterSavedCandidateListParams, clerkUserId: string) {
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
    if (!item) throw new NotFoundError('RecruiterSavedCandidate', id);
    return item;
  }

  async create(input: CreateRecruiterSavedCandidateInput, clerkUserId: string) {
    if (!input.candidate_id) throw new BadRequestError('candidate_id is required');
    const recruiterId = await this.resolveRecruiterId(clerkUserId);

    // Idempotent — return existing if already saved
    const existing = await this.repository.findByCandidateId(recruiterId, input.candidate_id);
    if (existing) return existing;

    const saved = await this.repository.create(recruiterId, input.candidate_id);

    await this.eventPublisher?.publish('recruiter_saved_candidate.created', {
      savedCandidateId: saved.id,
      recruiterId: saved.recruiter_id,
      candidateId: saved.candidate_id,
    }, 'ats-service');

    return saved;
  }

  async delete(id: string, clerkUserId: string) {
    const recruiterId = await this.resolveRecruiterId(clerkUserId);

    const existing = await this.repository.findById(id, recruiterId);
    if (!existing) throw new NotFoundError('RecruiterSavedCandidate', id);

    const deleted = await this.repository.delete(id, recruiterId);

    await this.eventPublisher?.publish('recruiter_saved_candidate.deleted', {
      savedCandidateId: deleted.id,
      recruiterId: deleted.recruiter_id,
      candidateId: deleted.candidate_id,
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
