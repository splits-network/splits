/**
 * Application Notes V3 Service — Business Logic
 *
 * Handles authorization, visibility filtering, creator-type validation,
 * and event publishing. No HTTP concepts.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { ApplicationNoteRepository } from './repository';
import { CreateApplicationNoteInput, UpdateApplicationNoteInput, ApplicationNoteListParams } from './types';

const CANDIDATE_SIDE_TYPES = ['candidate', 'candidate_recruiter'] as const;
const COMPANY_SIDE_TYPES = ['company_recruiter', 'hiring_manager', 'company_admin'] as const;

export class ApplicationNoteService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ApplicationNoteRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  /**
   * Determine which visibilities a user can see for a given application
   */
  private async getAllowedVisibilities(
    context: Awaited<ReturnType<AccessContextResolver['resolve']>>,
    applicationId: string
  ): Promise<string[]> {
    if (context.isPlatformAdmin) {
      return ['shared', 'candidate_only', 'company_only'];
    }

    const isCandidateSide = await this.isOnCandidateSide(context, applicationId);
    const isCompanySide = await this.isOnCompanySide(context, applicationId);

    if (isCandidateSide && isCompanySide) {
      return ['shared', 'candidate_only', 'company_only'];
    }
    if (isCandidateSide) return ['shared', 'candidate_only'];
    if (isCompanySide) return ['shared', 'company_only'];
    return ['shared'];
  }

  private async isOnCandidateSide(
    context: Awaited<ReturnType<AccessContextResolver['resolve']>>,
    applicationId: string
  ): Promise<boolean> {
    if (context.candidateId) {
      const { data } = await this.supabase
        .from('applications')
        .select('candidate_id')
        .eq('id', applicationId)
        .single();
      if (data?.candidate_id === context.candidateId) return true;
    }

    if (context.recruiterId) {
      const { data } = await this.supabase
        .from('applications')
        .select('candidate_recruiter_id')
        .eq('id', applicationId)
        .single();
      if (data?.candidate_recruiter_id === context.recruiterId) return true;
    }

    return false;
  }

  private async isOnCompanySide(
    context: Awaited<ReturnType<AccessContextResolver['resolve']>>,
    applicationId: string
  ): Promise<boolean> {
    if (context.organizationIds.length > 0) {
      const { data: app } = await this.supabase
        .from('applications')
        .select('job_id')
        .eq('id', applicationId)
        .single();

      if (app?.job_id) {
        const { data: job } = await this.supabase
          .from('jobs')
          .select('company_id')
          .eq('id', app.job_id)
          .single();

        if (job?.company_id && context.organizationIds.includes(job.company_id)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get valid creator types for a user's role context
   */
  private getValidCreatorTypes(
    context: Awaited<ReturnType<AccessContextResolver['resolve']>>
  ): string[] {
    const types: string[] = [];

    if (context.roles.includes('candidate') || context.candidateId) {
      types.push('candidate');
    }
    if (context.roles.includes('recruiter') || context.recruiterId) {
      types.push('candidate_recruiter', 'company_recruiter');
    }
    if (context.roles.includes('hiring_manager')) {
      types.push('hiring_manager');
    }
    if (context.roles.includes('company_admin') || context.organizationIds.length > 0) {
      types.push('company_admin', 'hiring_manager');
    }
    if (context.isPlatformAdmin) {
      types.push('platform_admin');
    }

    return [...new Set(types)];
  }

  /**
   * Validate visibility matches the creator type's side
   */
  private validateVisibility(creatorType: string, visibility: string): boolean {
    if ((CANDIDATE_SIDE_TYPES as readonly string[]).includes(creatorType)) {
      return visibility === 'shared' || visibility === 'candidate_only';
    }
    if ((COMPANY_SIDE_TYPES as readonly string[]).includes(creatorType)) {
      return visibility === 'shared' || visibility === 'company_only';
    }
    if (creatorType === 'platform_admin') return true;
    return false;
  }

  /**
   * Resolve accessible application IDs based on user role
   */
  private async getAccessibleApplicationIds(
    context: Awaited<ReturnType<AccessContextResolver['resolve']>>
  ): Promise<string[] | undefined> {
    // undefined = no scope restriction (admin)
    if (context.isPlatformAdmin) return undefined;

    if (context.roles.includes('candidate') && context.candidateId) {
      const { data } = await this.supabase
        .from('applications')
        .select('id')
        .eq('candidate_id', context.candidateId);
      return data?.map(a => a.id) || [];
    }

    if (context.roles.includes('recruiter') && context.recruiterId) {
      const { data } = await this.supabase
        .from('applications')
        .select('id')
        .eq('candidate_recruiter_id', context.recruiterId);
      return data?.map(a => a.id) || [];
    }

    if (context.organizationIds.length > 0) {
      const { data: jobs } = await this.supabase
        .from('jobs')
        .select('id')
        .in('company_id', context.organizationIds);
      const jobIds = jobs?.map(j => j.id) || [];
      if (jobIds.length === 0) return [];

      const { data: apps } = await this.supabase
        .from('applications')
        .select('id')
        .in('job_id', jobIds);
      return apps?.map(a => a.id) || [];
    }

    return [];
  }

  /**
   * Get default visibilities based on role (when no specific application_id is filtered)
   */
  private getDefaultVisibilitiesForRole(
    context: Awaited<ReturnType<AccessContextResolver['resolve']>>
  ): string[] {
    if (context.isPlatformAdmin) return ['shared', 'candidate_only', 'company_only'];
    if (context.roles.includes('candidate') || context.recruiterId) {
      return ['shared', 'candidate_only'];
    }
    if (context.organizationIds.length > 0) {
      return ['shared', 'company_only'];
    }
    return ['shared'];
  }

  // --- Public API ---

  async getAll(params: ApplicationNoteListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    const scopeFilters: {
      application_ids?: string[];
      allowed_visibilities?: string[];
    } = {};

    // Determine visibility scope
    if (params.application_id) {
      scopeFilters.allowed_visibilities = await this.getAllowedVisibilities(context, params.application_id);
    } else {
      const applicationIds = await this.getAccessibleApplicationIds(context);
      if (applicationIds !== undefined) {
        scopeFilters.application_ids = applicationIds;
      }
      scopeFilters.allowed_visibilities = this.getDefaultVisibilitiesForRole(context);
    }

    const { data, total } = await this.repository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const note = await this.repository.findById(id);
    if (!note) throw new NotFoundError('ApplicationNote', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    const allowed = await this.getAllowedVisibilities(context, note.application_id);
    if (!allowed.includes(note.visibility)) {
      throw new ForbiddenError('You do not have access to this note');
    }

    return note;
  }

  async create(input: CreateApplicationNoteInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    // Verify application exists
    const { data: application } = await this.supabase
      .from('applications')
      .select('id')
      .eq('id', input.application_id)
      .single();
    if (!application) throw new NotFoundError('Application', input.application_id);

    // Resolve and validate creator type
    const validTypes = this.getValidCreatorTypes(context);
    const createdByType = input.created_by_type || validTypes[0];
    if (!createdByType || !validTypes.includes(createdByType)) {
      throw new BadRequestError(
        `Invalid created_by_type: ${createdByType}. Valid types for your role: ${validTypes.join(', ')}`
      );
    }

    // Validate visibility for the creator type
    const visibility = input.visibility || 'shared';
    if (!this.validateVisibility(createdByType, visibility)) {
      throw new BadRequestError(
        `Invalid visibility '${visibility}' for creator type '${createdByType}'`
      );
    }

    const record = {
      application_id: input.application_id,
      created_by_user_id: context.identityUserId,
      created_by_type: createdByType,
      note_type: input.note_type || 'general',
      visibility,
      message_text: input.message_text,
      in_response_to_id: input.in_response_to_id || null,
    };

    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('application.note.created', {
      noteId: created.id,
      application_id: created.application_id,
      note_type: created.note_type,
      visibility: created.visibility,
      created_by_type: created.created_by_type,
      created_by_user_id: context.identityUserId,
      in_response_to_id: created.in_response_to_id,
      message_text: created.message_text,
    }, 'ats-service');

    return created;
  }

  async update(id: string, input: UpdateApplicationNoteInput, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('ApplicationNote', id);

    const context = await this.accessResolver.resolve(clerkUserId);

    // Only the author or platform admin can update
    if (existing.created_by_user_id !== context.identityUserId && !context.isPlatformAdmin) {
      throw new ForbiddenError('Only the author or an admin can update this note');
    }

    // Validate visibility if changing
    if (input.visibility && !this.validateVisibility(existing.created_by_type, input.visibility)) {
      throw new BadRequestError(
        `Invalid visibility '${input.visibility}' for creator type '${existing.created_by_type}'`
      );
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (input.message_text !== undefined) updates.message_text = input.message_text;
    if (input.visibility !== undefined) updates.visibility = input.visibility;

    const updated = await this.repository.update(id, updates);
    if (!updated) throw new NotFoundError('ApplicationNote', id);

    await this.eventPublisher?.publish('application.note.updated', {
      noteId: id,
      application_id: updated.application_id,
      updated_by: context.identityUserId,
    }, 'ats-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('ApplicationNote', id);

    const context = await this.accessResolver.resolve(clerkUserId);

    // Only the author or platform admin can delete
    if (existing.created_by_user_id !== context.identityUserId && !context.isPlatformAdmin) {
      throw new ForbiddenError('Only the author or an admin can delete this note');
    }

    await this.repository.delete(id);

    await this.eventPublisher?.publish('application.note.deleted', {
      noteId: id,
      application_id: existing.application_id,
      deleted_by: context.identityUserId,
    }, 'ats-service');
  }
}
