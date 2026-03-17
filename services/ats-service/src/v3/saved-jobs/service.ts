/**
 * Saved Jobs V3 Service
 * Idempotent create, candidate-only access, event publishing
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { SavedJobRepository } from './repository';
import { CreateSavedJobInput, SavedJobListParams } from './types';

export class SavedJobService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: SavedJobRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: SavedJobListParams, clerkUserId: string) {
    const candidateId = await this.resolveCandidateId(clerkUserId);
    const { data, total } = await this.repository.findAll(candidateId, params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string) {
    const candidateId = await this.resolveCandidateId(clerkUserId);
    const item = await this.repository.findById(id, candidateId);
    if (!item) throw new NotFoundError('SavedJob', id);
    return item;
  }

  async create(input: CreateSavedJobInput, clerkUserId: string) {
    if (!input.job_id) throw new BadRequestError('job_id is required');
    const candidateId = await this.resolveCandidateId(clerkUserId);

    // Idempotent — return existing if already saved
    const existing = await this.repository.findByJobId(candidateId, input.job_id);
    if (existing) return existing;

    const saved = await this.repository.create(candidateId, input.job_id);

    await this.eventPublisher?.publish('candidate_saved_job.created', {
      savedJobId: saved.id,
      candidateId: saved.candidate_id,
      jobId: saved.job_id,
    }, 'ats-service');

    return saved;
  }

  async delete(id: string, clerkUserId: string) {
    const candidateId = await this.resolveCandidateId(clerkUserId);

    // Verify ownership
    const existing = await this.repository.findById(id, candidateId);
    if (!existing) throw new NotFoundError('SavedJob', id);

    const deleted = await this.repository.delete(id, candidateId);

    await this.eventPublisher?.publish('candidate_saved_job.deleted', {
      savedJobId: deleted.id,
      candidateId: deleted.candidate_id,
      jobId: deleted.job_id,
    }, 'ats-service');
  }

  private async resolveCandidateId(clerkUserId: string): Promise<string> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.candidateId) {
      throw new ForbiddenError('Candidate profile not found for user');
    }
    return context.candidateId;
  }
}
