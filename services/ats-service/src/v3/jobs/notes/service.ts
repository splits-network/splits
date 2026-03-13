/**
 * Job Notes — Service
 *
 * Business logic: authorization, validation, event publishing.
 * Only company-side users and platform admins can create/view job notes.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events';
import { JobNoteRepository } from './repository';
import { JobNoteCreate, JobNoteUpdate, JobNoteFilters, JobNoteCreatorType } from './types';

export class JobNoteService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: JobNoteRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async list(clerkUserId: string, filters: JobNoteFilters) {
    await this.authorizeJobAccess(clerkUserId, filters.job_id);
    return this.repository.list(clerkUserId, filters);
  }

  async getById(id: string, clerkUserId: string) {
    const note = await this.repository.getById(id);
    if (!note) throw new NotFoundError('JobNote', id);

    await this.authorizeJobAccess(clerkUserId, note.job_id);
    return note;
  }

  async create(clerkUserId: string, data: JobNoteCreate) {
    const context = await this.accessResolver.resolve(clerkUserId);
    await this.authorizeJobAccess(clerkUserId, data.job_id);

    // Resolve creator type from role if not provided
    const creatorType = data.created_by_type || this.resolveCreatorType(context);

    // Validate message
    const text = data.message_text?.trim();
    if (!text || text.length === 0) throw new BadRequestError('message_text is required');
    if (text.length > 10000) throw new BadRequestError('message_text must be 10000 characters or fewer');

    if (!context.identityUserId) throw new ForbiddenError('Could not resolve user identity');

    const note = await this.repository.create({
      ...data,
      created_by_type: creatorType,
      message_text: text,
      created_by_user_id: context.identityUserId,
    });

    await this.eventPublisher?.publish('job.note.created', {
      noteId: note.id,
      jobId: data.job_id,
      noteType: data.note_type,
      visibility: data.visibility,
      createdBy: context.identityUserId,
    }, 'ats-service');

    return note;
  }

  async update(id: string, clerkUserId: string, updates: JobNoteUpdate) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const existing = await this.repository.getById(id);
    if (!existing) throw new NotFoundError('JobNote', id);

    // Only creator can update
    if (existing.created_by_user_id !== context.identityUserId && !context.isPlatformAdmin) {
      throw new ForbiddenError('Only the creator can update this note');
    }

    if (updates.message_text !== undefined) {
      const text = updates.message_text.trim();
      if (text.length === 0) throw new BadRequestError('message_text cannot be empty');
      if (text.length > 10000) throw new BadRequestError('message_text must be 10000 characters or fewer');
      updates.message_text = text;
    }

    return this.repository.update(id, updates);
  }

  async delete(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const existing = await this.repository.getById(id);
    if (!existing) throw new NotFoundError('JobNote', id);

    if (existing.created_by_user_id !== context.identityUserId && !context.isPlatformAdmin) {
      throw new ForbiddenError('Only the creator or platform admin can delete this note');
    }

    await this.repository.delete(id);

    await this.eventPublisher?.publish('job.note.deleted', {
      noteId: id, jobId: existing.job_id, deletedBy: context.identityUserId,
    }, 'ats-service');
  }

  // ── Private Helpers ─────────────────────────────────────────────

  private async authorizeJobAccess(clerkUserId: string, jobId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (context.isPlatformAdmin) return;

    // Company users: must be from the job's company
    if (context.organizationIds.length > 0) {
      const { data: job } = await this.supabase
        .from('jobs')
        .select('company_id')
        .eq('id', jobId)
        .maybeSingle();

      if (!job) throw new NotFoundError('Job', jobId);

      const { data: companies } = await this.supabase
        .from('companies')
        .select('id')
        .in('identity_organization_id', context.organizationIds);

      const companyIds = companies?.map((c: any) => c.id) || [];
      if (companyIds.includes(job.company_id)) return;
    }

    // Recruiters with company relationship that has job access
    if (context.recruiterId) {
      const { data: job } = await this.supabase
        .from('jobs')
        .select('company_id, job_owner_recruiter_id')
        .eq('id', jobId)
        .maybeSingle();

      if (!job) throw new NotFoundError('Job', jobId);

      // Recruiter is the job owner
      if (job.job_owner_recruiter_id === context.recruiterId) return;

      // Recruiter is a company recruiter on any application for this job
      const { data: companyRecruiterApp } = await this.supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('company_recruiter_id', context.recruiterId)
        .limit(1)
        .maybeSingle();

      if (companyRecruiterApp) return;
    }

    throw new ForbiddenError('You do not have access to notes for this job');
  }

  private resolveCreatorType(context: any): JobNoteCreatorType {
    if (context.isPlatformAdmin) return 'platform_admin';
    if (context.recruiterId) return 'company_recruiter';
    if (context.roles?.includes('hiring_manager')) return 'hiring_manager';
    return 'company_admin';
  }
}
