/**
 * Candidate Sourcers V3 Service — Business Logic
 *
 * Sourcer attribution is immutable — set once at signup via referral link/code.
 * Only read operations and notes updates are permitted.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { CandidateSourcerRepository } from './repository';
import { UpdateCandidateSourcerInput, CandidateSourcerListParams } from './types';

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

  /** Update notes only — sourcer attribution is immutable. */
  async update(id: string, input: UpdateCandidateSourcerInput, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('CandidateSourcer', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    const isSourcer = context.recruiterId === existing.sourcer_recruiter_id;
    if (!context.isPlatformAdmin && !isSourcer) {
      throw new ForbiddenError('Only the sourcer or an admin can update this record');
    }

    // Only notes can be updated — sourcer attribution and protection window are immutable
    const updates: Record<string, any> = {};
    if (input.notes !== undefined) updates.notes = input.notes;

    if (Object.keys(updates).length === 0) {
      return existing;
    }

    const updated = await this.repository.update(id, updates);
    if (!updated) throw new NotFoundError('CandidateSourcer', id);

    await this.eventPublisher?.publish('candidate_sourcer.updated', {
      sourcer_id: id, candidate_id: existing.candidate_id,
      updated_fields: Object.keys(updates), updated_by: context.identityUserId,
    }, 'ats-service');

    return updated;
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
