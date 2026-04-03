/**
 * Smart Resume Education V3 Service -- Business Logic
 *
 * Candidates own their education records via profile ownership. Recruiters and admins can read.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { SmartResumeEducationRepository } from './repository.js';
import { CreateSmartResumeEducationInput, UpdateSmartResumeEducationInput, SmartResumeEducationListParams } from './types.js';

export class SmartResumeEducationService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: SmartResumeEducationRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: SmartResumeEducationListParams, clerkUserId: string) {
    await this.assertReadAccess(clerkUserId);
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    await this.assertReadAccess(clerkUserId);
    const education = await this.repository.findById(id);
    if (!education) throw new NotFoundError('SmartResumeEducation', id);
    return education;
  }

  async create(input: CreateSmartResumeEducationInput, clerkUserId: string) {
    await this.assertOwnership(clerkUserId, input.profile_id);

    const record: Record<string, any> = {
      profile_id: input.profile_id,
      institution: input.institution,
    };
    if (input.degree !== undefined) record.degree = input.degree;
    if (input.field_of_study !== undefined) record.field_of_study = input.field_of_study;
    if (input.start_date !== undefined) record.start_date = input.start_date;
    if (input.end_date !== undefined) record.end_date = input.end_date;
    if (input.gpa !== undefined) record.gpa = input.gpa;
    if (input.honors !== undefined) record.honors = input.honors;
    if (input.visible_to_matching !== undefined) record.visible_to_matching = input.visible_to_matching;
    if (input.sort_order !== undefined) record.sort_order = input.sort_order;

    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('smart_resume.updated', {
      profileId: input.profile_id,
      candidateId: await this.getProfileCandidateId(input.profile_id),
    }, 'ats-service');

    return created;
  }

  async update(id: string, input: UpdateSmartResumeEducationInput, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('SmartResumeEducation', id);

    await this.assertOwnership(clerkUserId, existing.profile_id);

    const updates: Record<string, any> = {};
    if (input.institution !== undefined) updates.institution = input.institution;
    if (input.degree !== undefined) updates.degree = input.degree;
    if (input.field_of_study !== undefined) updates.field_of_study = input.field_of_study;
    if (input.start_date !== undefined) updates.start_date = input.start_date;
    if (input.end_date !== undefined) updates.end_date = input.end_date;
    if (input.gpa !== undefined) updates.gpa = input.gpa;
    if (input.honors !== undefined) updates.honors = input.honors;
    if (input.visible_to_matching !== undefined) updates.visible_to_matching = input.visible_to_matching;
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order;

    const updated = await this.repository.update(id, updates);
    if (!updated) throw new NotFoundError('SmartResumeEducation', id);

    await this.eventPublisher?.publish('smart_resume.updated', {
      profileId: existing.profile_id,
      candidateId: await this.getProfileCandidateId(existing.profile_id),
    }, 'ats-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('SmartResumeEducation', id);

    await this.assertOwnership(clerkUserId, existing.profile_id);
    await this.repository.softDelete(id);

    await this.eventPublisher?.publish('smart_resume.updated', {
      profileId: existing.profile_id,
      candidateId: await this.getProfileCandidateId(existing.profile_id),
    }, 'ats-service');
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

  private async assertReadAccess(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId && !context.candidateId) {
      throw new ForbiddenError('Insufficient permissions');
    }
  }

  private async getProfileCandidateId(profileId: string): Promise<string> {
    const { data: profile } = await this.supabase
      .from('smart_resume_profiles')
      .select('candidate_id')
      .eq('id', profileId)
      .single();

    return profile?.candidate_id;
  }
}
