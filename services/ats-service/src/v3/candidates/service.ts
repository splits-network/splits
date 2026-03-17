/**
 * Candidates V3 Service — Business Logic
 *
 * Authorization, validation, scoping, and event publishing.
 * No HTTP concepts.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { CandidateRepository } from './repository';
import { CreateCandidateInput, UpdateCandidateInput, CandidateListParams } from './types';

export class CandidateService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CandidateRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: CandidateListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopeFilters: { candidate_ids?: string[]; user_id?: string } = {};

    if (context.isPlatformAdmin) {
      // Admins see all candidates
    } else if (context.candidateId && !context.recruiterId) {
      // Candidate users only see themselves
      scopeFilters.user_id = context.identityUserId || undefined;
    } else if (context.recruiterId) {
      // Recruiters scoped by scope param
      const scope = params.scope || 'all';
      if (scope === 'mine') {
        const ids = await this.repository.getRecruiterCandidateIds(context.recruiterId);
        if (ids.length === 0) return this.emptyPage(params);
        scopeFilters.candidate_ids = ids;
      } else if (scope === 'saved') {
        const ids = await this.repository.getSavedCandidateIds(context.recruiterId);
        if (ids.length === 0) return this.emptyPage(params);
        scopeFilters.candidate_ids = ids;
      }
      // scope === 'all' — recruiters see all candidates (no additional filter)
    } else if (context.organizationIds.length > 0) {
      const scope = params.scope || 'all';
      if (scope === 'mine') {
        if (context.companyIds.length === 0) return this.emptyPage(params);
        const ids = await this.repository.getCompanyCandidateIds(context.companyIds);
        if (ids.length === 0) return this.emptyPage(params);
        scopeFilters.candidate_ids = ids;
      }
      // scope === 'saved' not supported for company users — falls through to 'all'
      // scope === 'all' — company users see all candidates
    } else {
      return this.emptyPage(params);
    }

    const { data, total } = await this.repository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const candidate = await this.repository.findById(id);
    if (!candidate) throw new NotFoundError('Candidate', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      const isOwn = context.candidateId === id;
      const isRecruiter = !!context.recruiterId;
      const isCompanyUser = context.roles.some(r =>
        ['company_admin', 'hiring_manager'].includes(r)
      );
      if (!isOwn && !isRecruiter && !isCompanyUser) {
        throw new ForbiddenError('You do not have access to this candidate');
      }
    }

    return candidate;
  }

  async getByClerkId(clerkUserId: string) {
    const candidate = await this.repository.findByClerkId(clerkUserId);
    if (!candidate) throw new NotFoundError('Candidate', clerkUserId);
    return candidate;
  }

  async create(input: CreateCandidateInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new BadRequestError('Invalid email format');
    }

    // Check for existing candidate by email
    const existing = await this.repository.findByEmail(input.email);
    if (existing) {
      return { candidate: existing, meta: { existing: true } };
    }

    const now = new Date().toISOString();
    const record = {
      full_name: input.full_name,
      email: input.email,
      phone: input.phone || null,
      location: input.location || null,
      user_id: input.user_id || null,
      verification_status: 'unverified',
      created_at: now,
      updated_at: now,
    };

    const candidate = await this.repository.create(record);

    if (candidate.user_id) {
      await this.repository.createUserRole(candidate.user_id, candidate.id);
    }

    await this.eventPublisher?.publish('candidate.created', {
      candidateId: candidate.id,
      email: candidate.email,
      createdBy: context.identityUserId,
    }, 'ats-service');

    return { candidate, meta: { existing: false } };
  }

  async update(id: string, input: UpdateCandidateInput, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Candidate', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    const isOwn = context.candidateId === id;
    const canManage = context.isPlatformAdmin || !!context.recruiterId ||
      context.roles.some(r => ['company_admin', 'hiring_manager'].includes(r));

    if (!canManage && !isOwn) {
      throw new ForbiddenError('You do not have permission to update this candidate');
    }

    // Verification status requires recruiter or admin
    if (input.verification_status !== undefined) {
      if (!context.isPlatformAdmin && !context.recruiterId) {
        throw new ForbiddenError('Only recruiters and admins can update verification status');
      }
    }

    if (input.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        throw new BadRequestError('Invalid email format');
      }
    }

    if (input.full_name !== undefined && !input.full_name.trim()) {
      throw new BadRequestError('Full name cannot be empty');
    }

    const updates: Record<string, any> = {};
    if (input.full_name !== undefined) updates.full_name = input.full_name;
    if (input.email !== undefined) updates.email = input.email;
    if (input.phone !== undefined) updates.phone = input.phone;
    if (input.location !== undefined) updates.location = input.location;
    if (input.verification_status !== undefined) updates.verification_status = input.verification_status;
    if (input.verification_metadata !== undefined) updates.verification_metadata = input.verification_metadata;

    if (Object.keys(updates).length === 0) return existing;

    const updated = await this.repository.update(id, updates);
    if (!updated) throw new NotFoundError('Candidate', id);

    await this.eventPublisher?.publish('candidate.updated', {
      candidateId: id,
      updatedFields: Object.keys(updates),
      updatedBy: context.identityUserId,
    }, 'ats-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Candidate', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can delete candidates');
    }

    await this.repository.delete(id);

    await this.eventPublisher?.publish('candidate.deleted', {
      candidateId: id,
      deletedBy: context.identityUserId,
    }, 'ats-service');
  }

  async getResumes(candidateId: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const canAccess = context.isPlatformAdmin || !!context.recruiterId ||
      context.candidateId === candidateId ||
      context.roles.some(r => ['company_admin', 'hiring_manager'].includes(r));

    if (!canAccess) {
      throw new ForbiddenError('You do not have permission to view these documents');
    }

    return this.repository.getResumes(candidateId);
  }

  private emptyPage(params: CandidateListParams) {
    return {
      data: [],
      pagination: { total: 0, page: params.page || 1, limit: params.limit || 25, total_pages: 0 },
    };
  }
}
