/**
 * Jobs V3 Service — Core Business Logic
 *
 * Handles validation, authorization, status transitions, and event publishing.
 * No HTTP concepts — throws typed errors for the global error handler.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver, EntitlementChecker } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { JobRepository } from './repository';
import { CreateJobInput, UpdateJobInput, JobListParams } from './types';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft:   ['pending', 'active', 'closed'],
  pending: ['active', 'paused', 'closed'],
  active:  ['paused', 'filled', 'closed'],
  paused:  ['active', 'filled', 'closed'],
  filled:  ['active', 'closed'],
  closed:  ['active', 'draft'],
};

export class JobService {
  private accessResolver: AccessContextResolver;
  private entitlementChecker: EntitlementChecker;

  constructor(
    private repository: JobRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
    this.entitlementChecker = new EntitlementChecker(supabase);
  }

  async getAll(params: JobListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    // Scope query based on role
    const scopedParams = { ...params };

    if (context.isPlatformAdmin) {
      // Admins see everything (including drafts) — no extra filters
    } else if (context.recruiterId && context.roles.includes('recruiter')) {
      // Recruiters see active jobs, plus their own drafts/pending
      // Gate early access and priority roles by entitlement
      if (!scopedParams.status) {
        scopedParams.visible_statuses = ['active'];
        scopedParams.owner_recruiter_id = context.recruiterId;

        const hasEarlyAccess = await this.entitlementChecker.hasEntitlementByClerkId(clerkUserId, 'early_access_roles');
        if (!hasEarlyAccess) {
          scopedParams.exclude_early_access = true;
        }
      }
    } else if (context.organizationIds.length > 0) {
      // Company users see their own org's jobs (all statuses)
      const companyIds = await this.resolveCompanyIds(context.organizationIds);
      if (companyIds.length > 0) {
        scopedParams.scoped_company_ids = companyIds;
      } else {
        // No companies found for this org — return empty
        return { data: [], pagination: { total: 0, page: 1, limit: Math.min(params.limit || 25, 100), total_pages: 0 } };
      }
    } else {
      // Unrecognized role — only active/published jobs (exclude early access)
      if (!scopedParams.status) {
        scopedParams.visible_statuses = ['active'];
        scopedParams.exclude_early_access = true;
      }
    }

    const { data, total } = await this.repository.findAll(scopedParams);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const job = await this.repository.findById(id);
    if (!job) throw new NotFoundError('Job', id);
    return job;
  }

  async create(input: CreateJobInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (!input.company_id && !input.source_firm_id) {
      throw new BadRequestError('Either company_id or source_firm_id is required');
    }

    const isOffPlatform = !!input.source_firm_id && !input.company_id;

    // Off-platform fee validation
    if (isOffPlatform && (!input.fee_percentage || input.fee_percentage < 5)) {
      throw new BadRequestError('Off-platform jobs require a minimum 5% fee');
    }

    // Early access validation
    const status = input.status || 'draft';
    if (input.is_early_access && !input.activates_at) {
      throw new BadRequestError('activates_at is required when enabling early access');
    }

    // Authorization
    let creatorRecruiterId: string | null = null;

    if (!context.isPlatformAdmin) {
      if (context.recruiterId && context.roles.includes('recruiter')) {
        creatorRecruiterId = await this.authorizeRecruiterCreate(context, input, isOffPlatform);
      } else if (context.organizationIds.length > 0) {
        if (isOffPlatform) throw new ForbiddenError('Company users cannot create off-platform jobs');
        await this.authorizeCompanyCreate(context, input.company_id!);
      } else {
        throw new ForbiddenError('Insufficient permissions to create job');
      }
    }

    // Set ownership fields
    const jobData: Record<string, any> = {
      ...input,
      job_owner_id: context.identityUserId,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (creatorRecruiterId) {
      if (isOffPlatform) {
        jobData.company_recruiter_id = creatorRecruiterId;
        jobData.job_owner_recruiter_id = null;
      } else {
        jobData.job_owner_recruiter_id = creatorRecruiterId;
        jobData.company_recruiter_id = creatorRecruiterId;
      }
    }

    const job = await this.repository.create(jobData);

    await this.eventPublisher?.publish('job.created', {
      jobId: job.id,
      companyId: job.company_id,
      status: job.status,
      createdBy: context.identityUserId,
    }, 'ats-service');

    return job;
  }

  async update(id: string, input: UpdateJobInput, clerkUserId: string) {
    const currentJob = await this.repository.findById(id);
    if (!currentJob) throw new NotFoundError('Job', id);

    const context = await this.accessResolver.resolve(clerkUserId);

    // Authorization
    if (!context.isPlatformAdmin) {
      if (context.recruiterId && context.roles.includes('recruiter')) {
        await this.authorizeRecruiterMutate(context, currentJob);
      } else if (context.organizationIds.length > 0) {
        await this.authorizeCompanyMutate(context, currentJob);
      } else {
        throw new ForbiddenError('Insufficient permissions to update job');
      }
    }

    // Status transition validation
    if (input.status && input.status !== currentJob.status) {
      if (!ALLOWED_TRANSITIONS[currentJob.status]?.includes(input.status)) {
        throw new BadRequestError(`Invalid status transition: ${currentJob.status} -> ${input.status}`);
      }
    }

    // Early access validation (on toggle or status change)
    if (input.is_early_access === true) {
      const activatesAt = input.activates_at ?? currentJob.activates_at;
      if (!activatesAt) throw new BadRequestError('activates_at is required when enabling early access');
    }

    // Salary validation
    this.validateSalaryRange(input, currentJob);

    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError('Job', id);

    // Events
    if (input.status && input.status !== currentJob.status) {
      await this.eventPublisher?.publish('job.status_changed', {
        jobId: id,
        previousStatus: currentJob.status,
        newStatus: input.status,
        changedBy: context.identityUserId,
      }, 'ats-service');
    }

    await this.eventPublisher?.publish('job.updated', {
      jobId: id,
      updatedFields: Object.keys(input),
      updatedBy: context.identityUserId,
    }, 'ats-service');

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const job = await this.repository.findById(id);
    if (!job) throw new NotFoundError('Job', id);

    const context = await this.accessResolver.resolve(clerkUserId);

    if (!context.isPlatformAdmin) {
      if (context.recruiterId && context.roles.includes('recruiter')) {
        await this.authorizeRecruiterMutate(context, job);
      } else if (context.organizationIds.length > 0) {
        await this.authorizeCompanyMutate(context, job);
      } else {
        throw new ForbiddenError('Insufficient permissions to delete job');
      }
    }

    await this.repository.softDelete(id);

    await this.eventPublisher?.publish('job.deleted', {
      jobId: id,
      deletedBy: context.identityUserId,
    }, 'ats-service');
  }

  // ── Private Helpers ──────────────────────────────────────────────

  private async resolveCompanyIds(organizationIds: string[]): Promise<string[]> {
    const { data } = await this.supabase
      .from('companies')
      .select('id')
      .in('identity_organization_id', organizationIds);
    return data?.map((c: any) => c.id) || [];
  }

  // ── Private Authorization Helpers ──────────────────────────────

  private async authorizeRecruiterCreate(
    context: any, input: CreateJobInput, isOffPlatform: boolean
  ): Promise<string> {
    if (isOffPlatform) {
      const { data: firmMember } = await this.supabase
        .from('firm_members')
        .select('id')
        .eq('firm_id', input.source_firm_id!)
        .eq('recruiter_id', context.recruiterId)
        .eq('status', 'active')
        .maybeSingle();

      if (!firmMember) throw new ForbiddenError('You must be an active member of the firm to create off-platform jobs');
    } else {
      const { data: rel } = await this.supabase
        .from('recruiter_companies')
        .select('permissions')
        .eq('recruiter_id', context.recruiterId)
        .eq('company_id', input.company_id!)
        .eq('status', 'active')
        .maybeSingle();

      if (!rel?.permissions?.can_create_jobs) {
        throw new ForbiddenError('No active relationship with permission to create jobs for this company');
      }
    }
    return context.recruiterId;
  }

  private async authorizeCompanyCreate(context: any, companyId: string) {
    const { data: company } = await this.supabase
      .from('companies')
      .select('identity_organization_id')
      .eq('id', companyId)
      .single();

    if (!company || !context.organizationIds.includes(company.identity_organization_id)) {
      throw new ForbiddenError('Cannot create jobs for companies outside your organization');
    }
  }

  private async authorizeRecruiterMutate(context: any, job: any) {
    const isOffPlatform = job.source_firm_id && !job.company_id;

    if (isOffPlatform) {
      const { data: firmMember } = await this.supabase
        .from('firm_members')
        .select('id')
        .eq('firm_id', job.source_firm_id)
        .eq('recruiter_id', context.recruiterId)
        .eq('status', 'active')
        .maybeSingle();

      if (!firmMember) throw new ForbiddenError('You must be an active firm member to manage this off-platform job');
    } else {
      const { data: rel } = await this.supabase
        .from('recruiter_companies')
        .select('permissions')
        .eq('recruiter_id', context.recruiterId)
        .eq('company_id', job.company_id)
        .eq('status', 'active')
        .maybeSingle();

      if (!rel?.permissions?.can_edit_jobs) {
        throw new ForbiddenError('No active relationship with permission to manage jobs for this company');
      }
    }
  }

  private async authorizeCompanyMutate(context: any, job: any) {
    const { data: companies } = await this.supabase
      .from('companies')
      .select('id')
      .in('identity_organization_id', context.organizationIds);

    const allowedIds = companies?.map((c: any) => c.id) || [];
    if (!allowedIds.includes(job.company_id)) {
      throw new ForbiddenError('Cannot manage jobs outside your organization');
    }
  }

  private validateSalaryRange(input: UpdateJobInput, current: any) {
    const min = input.salary_min ?? current.salary_min;
    const max = input.salary_max ?? current.salary_max;
    if (min != null && max != null && min > max) {
      throw new BadRequestError('salary_min cannot exceed salary_max');
    }
  }
}
