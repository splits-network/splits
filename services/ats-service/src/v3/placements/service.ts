/**
 * Placements V3 Service — Business Logic
 *
 * Handles authorization, validation, attribution gathering,
 * status transitions, and event publishing. No HTTP concepts.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { PlacementRepository } from './repository.js';
import { ScopedPlacementListRepository, PlacementScopeFilters } from './views/scoped-list.repository.js';
import { CreatePlacementInput, UpdatePlacementInput, PlacementListParams } from './types.js';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  hired: ['active', 'failed'],
  active: ['completed', 'failed'],
  completed: [],
  failed: [],
};

export class PlacementService {
  private accessResolver: AccessContextResolver;
  private scopedListRepository: ScopedPlacementListRepository;

  constructor(
    private repository: PlacementRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
    this.scopedListRepository = new ScopedPlacementListRepository(supabase);
  }

  async getAll(params: PlacementListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (context.isPlatformAdmin) {
      // Admins see everything — use flat CRUD repo
      const { data, total } = await this.repository.findAll(params);
      const page = params.page || 1;
      const limit = Math.min(params.limit || 25, 100);
      return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
    }

    const scopeFilters: PlacementScopeFilters = {};
    if (context.candidateId) {
      scopeFilters.candidate_id = context.candidateId;
    } else if (context.recruiterId) {
      scopeFilters.recruiter_id = context.recruiterId;
    } else if (context.organizationIds.length > 0) {
      scopeFilters.organization_ids = context.organizationIds;
    } else {
      return { data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } };
    }

    // Non-admin scoped queries use the scoped view repository
    const { data, total } = await this.scopedListRepository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, _clerkUserId: string) {
    const placement = await this.repository.findById(id);
    if (!placement) throw new NotFoundError('Placement', id);
    return placement;
  }

  async create(input: CreatePlacementInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId && context.organizationIds.length === 0) {
      throw new ForbiddenError('Insufficient permissions to create a placement');
    }

    if (input.fee_percentage < 0 || input.fee_percentage > 100) {
      throw new BadRequestError('Fee percentage must be between 0 and 100');
    }

    const attribution = await this.gatherAttribution(input.application_id);
    const denormalized = await this.gatherDenormalizedFields(input.job_id, input.candidate_id);
    const guaranteeDays = input.guarantee_days ?? 90;
    const guaranteeExpiresAt = this.computeGuaranteeExpiresAt(input.start_date, guaranteeDays);
    const placementFee = Math.round((input.salary * input.fee_percentage) / 100);

    const record = {
      job_id: input.job_id,
      candidate_id: input.candidate_id,
      application_id: input.application_id,
      start_date: input.start_date,
      salary: input.salary,
      fee_percentage: input.fee_percentage,
      placement_fee: placementFee,
      fee_amount: placementFee,
      guarantee_days: guaranteeDays,
      guarantee_expires_at: guaranteeExpiresAt,
      state: 'hired',
      ...denormalized,
      ...attribution,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('placement.created', {
      placement_id: created.id,
      job_id: created.job_id,
      candidate_id: created.candidate_id,
      application_id: created.application_id,
      salary: created.salary,
      fee_percentage: created.fee_percentage,
      placement_fee: placementFee,
      ...attribution,
      created_by: context.identityUserId,
    }, 'ats-service');

    return created;
  }

  async update(id: string, input: UpdatePlacementInput, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Placement', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId && context.organizationIds.length === 0) {
      throw new ForbiddenError('Insufficient permissions to update this placement');
    }

    if (input.state && input.state !== existing.state) {
      this.validateStatusTransition(existing.state, input.state);
    }
    if (input.fee_percentage !== undefined && (input.fee_percentage < 0 || input.fee_percentage > 100)) {
      throw new BadRequestError('Fee percentage must be between 0 and 100');
    }
    if (input.salary !== undefined && input.salary < 0) {
      throw new BadRequestError('Salary must be positive');
    }

    const updates: Record<string, any> = {};
    if (input.state !== undefined) updates.state = input.state;
    if (input.salary !== undefined) updates.salary = input.salary;
    if (input.start_date !== undefined) updates.start_date = input.start_date;
    if (input.fee_percentage !== undefined) updates.fee_percentage = input.fee_percentage;
    if (input.guarantee_days !== undefined) updates.guarantee_days = input.guarantee_days;
    // Recompute guarantee expiry if start_date or guarantee_days changed
    if (input.start_date || input.guarantee_days) {
      const nextStart = input.start_date ?? existing.start_date;
      const nextDays = input.guarantee_days ?? existing.guarantee_days ?? 90;
      updates.guarantee_expires_at = this.computeGuaranteeExpiresAt(nextStart, nextDays);
    }

    if (Object.keys(updates).length === 0) return existing;

    const updated = await this.repository.update(id, updates);
    if (!updated) throw new NotFoundError('Placement', id);

    // Publish events
    if (input.state && input.state !== existing.state) {
      await this.eventPublisher?.publish('placement.status_changed', {
        placement_id: id,
        previous_status: existing.state,
        new_status: input.state,
        changed_by: context.identityUserId,
      }, 'ats-service');
    }
    await this.eventPublisher?.publish('placement.updated', {
      placement_id: id,
      updated_fields: Object.keys(updates),
      updated_by: context.identityUserId,
    }, 'ats-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Placement', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can delete placements');
    }

    await this.repository.delete(id);

    await this.eventPublisher?.publish('placement.deleted', {
      placement_id: id,
      deleted_by: context.identityUserId,
    }, 'ats-service');
  }

  /**
   * Gather all 5 attribution role IDs for commission calculation:
   * 1. candidate_recruiter_id (from applications)
   * 2. company_recruiter_id (from applications)
   * 3. job_owner_recruiter_id (from jobs)
   * 4. candidate_sourcer_recruiter_id (from candidate_sourcers)
   * 5. company_sourcer_recruiter_id (from company_sourcers)
   */
  private async gatherAttribution(applicationId: string): Promise<{
    candidate_recruiter_id: string | null;
    company_recruiter_id: string | null;
    job_owner_recruiter_id: string | null;
    candidate_sourcer_recruiter_id: string | null;
    company_sourcer_recruiter_id: string | null;
  }> {
    const { data: application } = await this.supabase
      .from('applications')
      .select('candidate_recruiter_id, company_recruiter_id, candidate_id, job_id')
      .eq('id', applicationId)
      .single();

    if (!application) throw new BadRequestError(`Application ${applicationId} not found`);

    const { data: job } = await this.supabase
      .from('jobs')
      .select('job_owner_recruiter_id, company_id, source_firm_id')
      .eq('id', application.job_id)
      .single();

    if (!job) throw new BadRequestError(`Job ${application.job_id} not found`);

    const isOffPlatform = job.source_firm_id && !job.company_id;
    const jobOwner = isOffPlatform ? null : (job.job_owner_recruiter_id || null);

    // Candidate sourcer — only include if recruiter is still active
    let candidateSourcerRecruiterId: string | null = null;
    const { data: candidateSourcer } = await this.supabase
      .from('candidate_sourcers')
      .select('sourcer_recruiter_id')
      .eq('candidate_id', application.candidate_id)
      .maybeSingle();

    if (candidateSourcer?.sourcer_recruiter_id) {
      const isActive = await this.isRecruiterActive(candidateSourcer.sourcer_recruiter_id);
      candidateSourcerRecruiterId = isActive ? candidateSourcer.sourcer_recruiter_id : null;
    }

    // Company sourcer — only include if recruiter is still active (skip for off-platform jobs)
    let companySourcerRecruiterId: string | null = null;
    if (job.company_id) {
      const { data: companySourcer } = await this.supabase
        .from('company_sourcers')
        .select('recruiter_id')
        .eq('company_id', job.company_id)
        .maybeSingle();

      if (companySourcer?.recruiter_id) {
        const isActive = await this.isRecruiterActive(companySourcer.recruiter_id);
        companySourcerRecruiterId = isActive ? companySourcer.recruiter_id : null;
      }
    }

    return {
      candidate_recruiter_id: application.candidate_recruiter_id || null,
      company_recruiter_id: application.company_recruiter_id || null,
      job_owner_recruiter_id: jobOwner,
      candidate_sourcer_recruiter_id: candidateSourcerRecruiterId,
      company_sourcer_recruiter_id: companySourcerRecruiterId,
    };
  }

  /**
   * Gather denormalized display fields for the placement record.
   * These power search indexing and avoid joins for listing views.
   */
  private async gatherDenormalizedFields(jobId: string, candidateId: string): Promise<{
    candidate_name: string | null;
    candidate_email: string | null;
    job_title: string | null;
    company_name: string | null;
    company_id: string | null;
  }> {
    const [candidateResult, jobResult] = await Promise.all([
      this.supabase.from('candidates').select('full_name, email').eq('id', candidateId).maybeSingle(),
      this.supabase.from('jobs').select('title, company_id, companies(name)').eq('id', jobId).maybeSingle(),
    ]);

    const company = jobResult.data?.companies as unknown as { name: string } | null;

    return {
      candidate_name: candidateResult.data?.full_name || null,
      candidate_email: candidateResult.data?.email || null,
      job_title: jobResult.data?.title || null,
      company_name: company?.name || null,
      company_id: jobResult.data?.company_id || null,
    };
  }

  private async isRecruiterActive(recruiterId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('recruiters')
      .select('id, status')
      .eq('id', recruiterId)
      .maybeSingle();
    return !!data && data.status !== 'deactivated';
  }

  private validateStatusTransition(from: string, to: string): void {
    if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
      throw new BadRequestError(`Invalid status transition: ${from} -> ${to}`);
    }
  }

  private computeGuaranteeExpiresAt(startDate: string | null, guaranteeDays: number): string | null {
    if (!startDate || !guaranteeDays) return null;
    const base = new Date(startDate);
    if (Number.isNaN(base.getTime())) return null;
    return new Date(base.getTime() + guaranteeDays * 86400000).toISOString();
  }
}
