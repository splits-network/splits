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
      // Claim unclaimed candidate (e.g. recruiter-created with no user_id)
      if (!existing.user_id && input.user_id) {
        await this.repository.update(existing.id, { user_id: input.user_id });
        await this.repository.createUserRole(input.user_id, existing.id);
        await this.createSourcerFromReferral(existing.id, input.user_id);
        const claimed = await this.repository.findById(existing.id);
        return { candidate: claimed || existing, meta: { existing: true, claimed: true } };
      }
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

    let candidate;
    try {
      candidate = await this.repository.create(record);
    } catch (err: any) {
      // Handle race condition: unique constraint on user_id or email violated
      if (err.code === '23505') {
        const retry = await this.repository.findByEmail(input.email);
        if (retry) return { candidate: retry, meta: { existing: true } };
      }
      throw err;
    }

    if (candidate.user_id) {
      await this.repository.createUserRole(candidate.user_id, candidate.id);

      // Create sourcer record if candidate signed up via recruiter referral link/code.
      // Sourcer attribution is immutable — this is the ONLY place it can be set.
      await this.createSourcerFromReferral(candidate.id, candidate.user_id);
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
    const passthrough: (keyof UpdateCandidateInput)[] = [
      'full_name', 'email', 'phone', 'location',
      'verification_status', 'verification_metadata',
      'current_title', 'current_company',
      'linkedin_url', 'github_url', 'portfolio_url', 'bio',
      'marketplace_profile', 'marketplace_visibility',
      'show_email', 'show_phone', 'show_location', 'show_current_company',
      'show_salary_expectations', 'desired_salary_min', 'desired_salary_max',
      'desired_job_type', 'open_to_remote', 'open_to_relocation', 'availability',
    ];
    for (const key of passthrough) {
      if (input[key] !== undefined) updates[key] = input[key];
    }

    if (Object.keys(updates).length === 0) return existing;

    const updated = await this.repository.update(id, updates);
    if (!updated) throw new NotFoundError('Candidate', id);

    await this.eventPublisher?.publish('candidate.updated', {
      candidateId: id,
      updatedFields: Object.keys(updates),
      updatedBy: clerkUserId,
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

  /**
   * If the user signed up via a recruiter referral link/code, create the
   * candidate_sourcers record. This is the ONLY legitimate creation path
   * for candidate sourcer attribution — it is immutable after this point.
   */
  private async createSourcerFromReferral(candidateId: string, userId: string): Promise<void> {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('referred_by_recruiter_id')
        .eq('id', userId)
        .maybeSingle();

      if (!user?.referred_by_recruiter_id) return;

      const now = new Date();
      const protectionDays = 365;
      const protectionExpires = new Date(now);
      protectionExpires.setDate(protectionExpires.getDate() + protectionDays);

      const { error } = await this.supabase
        .from('candidate_sourcers')
        .insert({
          candidate_id: candidateId,
          sourcer_recruiter_id: user.referred_by_recruiter_id,
          sourcer_type: 'recruiter',
          sourced_at: now.toISOString(),
          protection_window_days: protectionDays,
          protection_expires_at: protectionExpires.toISOString(),
          notes: 'Sourced via referral signup',
          created_at: now.toISOString(),
        });

      if (error) {
        // Log but don't fail candidate creation — sourcer is important but not blocking
        // Unique constraint will prevent duplicates if called twice
        if (error.code !== '23505') {
          throw error;
        }
      }

      await this.eventPublisher?.publish('candidate.sourced', {
        candidate_id: candidateId,
        sourcer_recruiter_id: user.referred_by_recruiter_id,
        sourcer_type: 'recruiter',
        source_method: 'referral_signup',
        sourced_at: now.toISOString(),
        protection_expires_at: protectionExpires.toISOString(),
      }, 'ats-service');
    } catch (err: any) {
      // Non-fatal — log and continue so candidate creation isn't blocked
      // The sourcer record can be backfilled if needed
    }
  }

  private emptyPage(params: CandidateListParams) {
    return {
      data: [],
      pagination: { total: 0, page: params.page || 1, limit: params.limit || 25, total_pages: 0 },
    };
  }
}
