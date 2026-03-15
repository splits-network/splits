/**
 * Candidate Sourcers V3 Service — Business Logic
 *
 * Handles authorization, validation, protection window computation,
 * and event publishing. No HTTP concepts.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { CandidateSourcerRepository } from './repository';
import { CreateCandidateSourcerInput, UpdateCandidateSourcerInput, CandidateSourcerListParams } from './types';

export class CandidateSourcerService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CandidateSourcerRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: CandidateSourcerListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopeFilters: { recruiter_id?: string; candidate_ids?: string[] } = {};

    if (context.isPlatformAdmin) {
      // Admins see everything
    } else if (context.recruiterId && context.roles.includes('recruiter')) {
      scopeFilters.recruiter_id = context.recruiterId;
    } else if (context.organizationIds.length > 0) {
      // Company users see sourcers for candidates belonging to their orgs
      const { data: orgCandidates } = await this.supabase
        .from('candidates')
        .select('id')
        .in('company_id', context.organizationIds);

      if (orgCandidates && orgCandidates.length > 0) {
        scopeFilters.candidate_ids = orgCandidates.map(c => c.id);
      } else {
        return { data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } };
      }
    } else {
      return { data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } };
    }

    const { data, total } = await this.repository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const sourcer = await this.repository.findById(id);
    if (!sourcer) throw new NotFoundError('CandidateSourcer', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      const isSourcer = context.recruiterId === sourcer.sourcer_recruiter_id;
      const { data: candidate } = await this.supabase
        .from('candidates')
        .select('company_id')
        .eq('id', sourcer.candidate_id)
        .maybeSingle();

      const isCandidateCompanyUser = candidate && context.organizationIds.includes(candidate.company_id);
      if (!isSourcer && !isCandidateCompanyUser) {
        throw new ForbiddenError('You do not have access to this sourcer record');
      }
    }

    return sourcer;
  }

  async create(input: CreateCandidateSourcerInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId) {
      throw new ForbiddenError('Insufficient permissions to create sourcer record');
    }

    const existing = await this.repository.findByCandidateId(input.candidate_id);
    if (existing) {
      throw new BadRequestError('A sourcer already exists for this candidate');
    }

    const now = new Date();
    const protectionDays = 365;
    const protectionExpires = new Date(now);
    protectionExpires.setDate(protectionExpires.getDate() + protectionDays);

    const record = {
      candidate_id: input.candidate_id,
      sourcer_recruiter_id: input.sourcer_recruiter_id,
      sourcer_type: input.sourcer_type || 'recruiter',
      notes: input.notes || null,
      sourced_at: now.toISOString(),
      protection_window_days: protectionDays,
      protection_expires_at: protectionExpires.toISOString(),
      created_at: now.toISOString(),
    };

    const created = await this.repository.create(record);

    // Publish both V3 and V2 event names — consumers are bound to V2 names
    await this.eventPublisher?.publish('candidate_sourcer.created', {
      id: created.id,
      candidate_id: created.candidate_id,
      sourcer_recruiter_id: created.sourcer_recruiter_id,
      created_by: context.identityUserId,
    }, 'ats-service');
    await this.eventPublisher?.publish('candidate.sourced', {
      candidate_id: created.candidate_id,
      sourcer_user_id: created.sourcer_recruiter_id,
      sourcer_type: created.sourcer_type,
      sourced_at: created.sourced_at,
      protection_expires_at: created.protection_expires_at,
    }, 'ats-service');

    return created;
  }

  async update(id: string, input: UpdateCandidateSourcerInput, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('CandidateSourcer', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    const isSourcer = context.recruiterId === existing.sourcer_recruiter_id;
    if (!context.isPlatformAdmin && !isSourcer) {
      throw new ForbiddenError('Only the sourcer or an admin can update this record');
    }

    const updates: Record<string, any> = {};
    if (input.notes !== undefined) updates.notes = input.notes;

    if (input.protection_window_days !== undefined) {
      if (!context.isPlatformAdmin) {
        throw new ForbiddenError('Only admins can change the protection window');
      }
      updates.protection_window_days = input.protection_window_days;
      if (existing.sourced_at) {
        const expires = new Date(existing.sourced_at);
        expires.setDate(expires.getDate() + input.protection_window_days);
        updates.protection_expires_at = expires.toISOString();
      }
    }

    if (Object.keys(updates).length === 0) {
      return existing;
    }

    const updated = await this.repository.update(id, updates);
    if (!updated) throw new NotFoundError('CandidateSourcer', id);

    await this.eventPublisher?.publish('candidate_sourcer.updated', {
      id, updated_fields: Object.keys(updates), updated_by: context.identityUserId,
    }, 'ats-service');
    await this.eventPublisher?.publish('candidate.sourcer_updated', {
      candidate_id: existing.candidate_id,
      sourcer_recruiter_id: existing.sourcer_recruiter_id,
      updated_fields: Object.keys(updates),
    }, 'ats-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('CandidateSourcer', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can delete sourcer records');
    }

    await this.repository.delete(id);

    await this.eventPublisher?.publish('candidate_sourcer.deleted', {
      id, candidate_id: existing.candidate_id, deleted_by: context.identityUserId,
    }, 'ats-service');
    await this.eventPublisher?.publish('candidate.sourcer_removed', {
      candidate_id: existing.candidate_id,
      sourcer_recruiter_id: existing.sourcer_recruiter_id,
    }, 'ats-service');
  }

  async checkProtection(candidateId: string) {
    const sourcer = await this.repository.findByCandidateId(candidateId);
    if (!sourcer) {
      return { has_protection: false };
    }

    const isActive = await this.repository.isSourcerActive(sourcer.sourcer_recruiter_id);
    const now = new Date();
    const expires = sourcer.protection_expires_at ? new Date(sourcer.protection_expires_at) : null;
    const hasProtection = isActive && (!expires || expires > now);

    return {
      has_protection: hasProtection,
      sourcer_recruiter_id: hasProtection ? sourcer.sourcer_recruiter_id : undefined,
      sourced_at: hasProtection ? sourcer.sourced_at : undefined,
      protection_expires_at: hasProtection ? sourcer.protection_expires_at : undefined,
    };
  }
}
