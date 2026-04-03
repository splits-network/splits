/**
 * Smart Resume Projects V3 Service -- Business Logic
 *
 * Ownership is asserted via the parent smart_resume_profiles table.
 * Candidates own their projects. Recruiters and admins can read.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { SmartResumeProjectRepository } from './repository.js';
import {
  CreateSmartResumeProjectInput,
  UpdateSmartResumeProjectInput,
  SmartResumeProjectListParams,
} from './types.js';

export class SmartResumeProjectService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: SmartResumeProjectRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: SmartResumeProjectListParams, clerkUserId: string) {
    await this.assertReadAccess(clerkUserId);
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    await this.assertReadAccess(clerkUserId);
    const project = await this.repository.findById(id);
    if (!project) throw new NotFoundError('SmartResumeProject', id);
    return project;
  }

  async create(input: CreateSmartResumeProjectInput, clerkUserId: string) {
    await this.assertOwnership(clerkUserId, input.profile_id);

    const record: Record<string, any> = {
      profile_id: input.profile_id,
      name: input.name,
    };
    if (input.experience_id !== undefined) record.experience_id = input.experience_id;
    if (input.description !== undefined) record.description = input.description;
    if (input.outcomes !== undefined) record.outcomes = input.outcomes;
    if (input.url !== undefined) record.url = input.url;
    if (input.start_date !== undefined) record.start_date = input.start_date;
    if (input.end_date !== undefined) record.end_date = input.end_date;
    if (input.skills_used !== undefined) record.skills_used = input.skills_used;
    if (input.visible_to_matching !== undefined) record.visible_to_matching = input.visible_to_matching;
    if (input.sort_order !== undefined) record.sort_order = input.sort_order;

    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('smart_resume.updated', {
      profileId: created.profile_id,
      candidateId: await this.getCandidateIdForProfile(created.profile_id),
    }, 'ats-service');

    return created;
  }

  async update(id: string, input: UpdateSmartResumeProjectInput, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('SmartResumeProject', id);

    await this.assertOwnership(clerkUserId, existing.profile_id);

    const updates: Record<string, any> = {};
    if (input.experience_id !== undefined) updates.experience_id = input.experience_id;
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.outcomes !== undefined) updates.outcomes = input.outcomes;
    if (input.url !== undefined) updates.url = input.url;
    if (input.start_date !== undefined) updates.start_date = input.start_date;
    if (input.end_date !== undefined) updates.end_date = input.end_date;
    if (input.skills_used !== undefined) updates.skills_used = input.skills_used;
    if (input.visible_to_matching !== undefined) updates.visible_to_matching = input.visible_to_matching;
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order;

    const updated = await this.repository.update(id, updates);
    if (!updated) throw new NotFoundError('SmartResumeProject', id);

    await this.eventPublisher?.publish('smart_resume.updated', {
      profileId: existing.profile_id,
      candidateId: await this.getCandidateIdForProfile(existing.profile_id),
    }, 'ats-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('SmartResumeProject', id);

    await this.assertOwnership(clerkUserId, existing.profile_id);
    await this.repository.softDelete(id);

    await this.eventPublisher?.publish('smart_resume.updated', {
      profileId: existing.profile_id,
      candidateId: await this.getCandidateIdForProfile(existing.profile_id),
    }, 'ats-service');
  }

  private async assertReadAccess(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId && !context.candidateId) {
      throw new ForbiddenError('Insufficient permissions');
    }
  }

  private async assertOwnership(clerkUserId: string, profileId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (context.isPlatformAdmin) return;

    const { data: profile } = await this.supabase
      .from('smart_resume_profiles')
      .select('candidate_id')
      .eq('id', profileId)
      .is('deleted_at', null)
      .single();

    if (!profile || context.candidateId !== profile.candidate_id) {
      throw new ForbiddenError('You can only manage your own Smart Resume');
    }
  }

  private async getCandidateIdForProfile(profileId: string): Promise<string | undefined> {
    const { data } = await this.supabase
      .from('smart_resume_profiles')
      .select('candidate_id')
      .eq('id', profileId)
      .single();

    return data?.candidate_id;
  }
}
