/**
 * Smart Resume Profiles V3 Service — Business Logic
 *
 * Candidates own their profile. Recruiters and admins can read.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { SmartResumeProfileRepository } from './repository.js';
import { CreateSmartResumeProfileInput, UpdateSmartResumeProfileInput, SmartResumeProfileListParams } from './types.js';

export class SmartResumeProfileService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: SmartResumeProfileRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: SmartResumeProfileListParams, clerkUserId: string) {
    await this.assertReadAccess(clerkUserId);
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    await this.assertReadAccess(clerkUserId);
    const profile = await this.repository.findById(id);
    if (!profile) throw new NotFoundError('SmartResumeProfile', id);
    return profile;
  }

  async create(input: CreateSmartResumeProfileInput, clerkUserId: string) {
    await this.assertOwnership(clerkUserId, input.candidate_id);

    const record: Record<string, any> = {
      candidate_id: input.candidate_id,
    };
    if (input.professional_summary !== undefined) record.professional_summary = input.professional_summary;
    if (input.headline !== undefined) record.headline = input.headline;
    if (input.total_years_experience !== undefined) record.total_years_experience = input.total_years_experience;
    if (input.highest_degree !== undefined) record.highest_degree = input.highest_degree;

    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('smart_resume.updated', {
      profileId: created.id,
      candidateId: created.candidate_id,
    }, 'ats-service');

    return created;
  }

  async update(id: string, input: UpdateSmartResumeProfileInput, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('SmartResumeProfile', id);

    await this.assertOwnership(clerkUserId, existing.candidate_id);

    const updates: Record<string, any> = {};
    if (input.professional_summary !== undefined) updates.professional_summary = input.professional_summary;
    if (input.headline !== undefined) updates.headline = input.headline;
    if (input.total_years_experience !== undefined) updates.total_years_experience = input.total_years_experience;
    if (input.highest_degree !== undefined) updates.highest_degree = input.highest_degree;

    const updated = await this.repository.update(id, updates);
    if (!updated) throw new NotFoundError('SmartResumeProfile', id);

    await this.eventPublisher?.publish('smart_resume.updated', {
      profileId: id,
      candidateId: existing.candidate_id,
    }, 'ats-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('SmartResumeProfile', id);

    await this.assertOwnership(clerkUserId, existing.candidate_id);
    await this.repository.softDelete(id);

    await this.eventPublisher?.publish('smart_resume.updated', {
      profileId: id,
      candidateId: existing.candidate_id,
    }, 'ats-service');
  }

  private async assertReadAccess(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId && !context.candidateId) {
      throw new ForbiddenError('Insufficient permissions');
    }
  }

  private async assertOwnership(clerkUserId: string, candidateId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (context.isPlatformAdmin) return;

    if (context.candidateId !== candidateId) {
      throw new ForbiddenError('You can only manage your own Smart Resume');
    }
  }
}
