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
import { JobAuthorizationHelper } from './authorization';
import { JobActivityService } from './activity/service';
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
  private auth: JobAuthorizationHelper;

  constructor(
    private repository: JobRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
    private activityService?: JobActivityService
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
    this.entitlementChecker = new EntitlementChecker(supabase);
    this.auth = new JobAuthorizationHelper(supabase);
  }

  async getAll(params: JobListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopedParams = { ...params };

    if (context.isPlatformAdmin) {
      // Admins see everything
    } else if (context.recruiterId && context.roles.includes('recruiter')) {
      if (!scopedParams.status) {
        scopedParams.visible_statuses = ['active'];
        scopedParams.owner_recruiter_id = context.recruiterId;
        const hasEarlyAccess = await this.entitlementChecker.hasEntitlementByClerkId(clerkUserId, 'early_access_roles');
        if (!hasEarlyAccess) scopedParams.exclude_early_access = true;
      }
    } else if (context.organizationIds.length > 0) {
      const companyIds = await this.auth.resolveCompanyIds(context.organizationIds);
      if (companyIds.length > 0) {
        scopedParams.scoped_company_ids = companyIds;
      } else {
        return { data: [], pagination: { total: 0, page: 1, limit: Math.min(params.limit || 25, 100), total_pages: 0 } };
      }
    } else {
      if (!scopedParams.status) {
        scopedParams.visible_statuses = ['active'];
        scopedParams.exclude_early_access = true;
      }
    }

    const { data, total } = await this.repository.findAll(scopedParams);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
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
    if (isOffPlatform && (!input.fee_percentage || input.fee_percentage < 5)) {
      throw new BadRequestError('Off-platform jobs require a minimum 5% fee');
    }

    const status = input.status || 'draft';
    if (input.is_early_access && !input.activates_at) {
      throw new BadRequestError('activates_at is required when enabling early access');
    }

    let creatorRecruiterId: string | null = null;
    if (!context.isPlatformAdmin) {
      if (context.recruiterId && context.roles.includes('recruiter')) {
        creatorRecruiterId = await this.auth.authorizeRecruiterCreate(context, input, isOffPlatform);
      } else if (context.organizationIds.length > 0) {
        if (isOffPlatform) throw new ForbiddenError('Company users cannot create off-platform jobs');
        await this.auth.authorizeCompanyCreate(context, input.company_id!);
      } else {
        throw new ForbiddenError('Insufficient permissions to create job');
      }
    }

    const jobData: Record<string, any> = {
      ...input, status,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };

    if (creatorRecruiterId) {
      if (isOffPlatform) {
        // Off-platform (firm) jobs: no job_owner_recruiter_id
        jobData.job_owner_recruiter_id = null;
      } else {
        // On-platform: recruiter who creates the job is the job owner
        jobData.job_owner_recruiter_id = creatorRecruiterId;
      }
      // company_recruiter_id no longer set on jobs — it's per-application now
    }

    const job = await this.repository.create(jobData);

    await this.eventPublisher?.publish('job.created', {
      jobId: job.id, companyId: job.company_id, status: job.status, createdBy: context.identityUserId,
    }, 'ats-service');

    await this.activityService?.logJobCreated(job, context.identityUserId);

    return job;
  }

  async update(id: string, input: UpdateJobInput, clerkUserId: string) {
    const currentJob = await this.repository.findById(id);
    if (!currentJob) throw new NotFoundError('Job', id);

    const context = await this.accessResolver.resolve(clerkUserId);

    if (!context.isPlatformAdmin) {
      if (context.recruiterId && context.roles.includes('recruiter')) {
        await this.auth.authorizeRecruiterMutate(context, currentJob);
      } else if (context.organizationIds.length > 0) {
        await this.auth.authorizeCompanyMutate(context, currentJob);
      } else {
        throw new ForbiddenError('Insufficient permissions to update job');
      }
    }

    if (input.status && input.status !== currentJob.status) {
      if (!ALLOWED_TRANSITIONS[currentJob.status]?.includes(input.status)) {
        throw new BadRequestError(`Invalid status transition: ${currentJob.status} -> ${input.status}`);
      }
    }

    if (input.is_early_access === true) {
      const activatesAt = input.activates_at ?? currentJob.activates_at;
      if (!activatesAt) throw new BadRequestError('activates_at is required when enabling early access');
    }

    this.validateSalaryRange(input, currentJob);

    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError('Job', id);

    if (input.status && input.status !== currentJob.status) {
      await this.eventPublisher?.publish('job.status_changed', {
        jobId: id, previousStatus: currentJob.status, newStatus: input.status, changedBy: context.identityUserId,
      }, 'ats-service');
    }

    await this.eventPublisher?.publish('job.updated', {
      jobId: id, updatedFields: Object.keys(input), updatedBy: context.identityUserId,
    }, 'ats-service');

    // Activity logging
    if (input.status && input.status !== currentJob.status) {
      await this.activityService?.logStatusChange(id, currentJob.status, input.status, context.identityUserId);
    }
    await this.activityService?.logFieldsUpdated(id, currentJob, input, context.identityUserId);

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    const job = await this.repository.findById(id);
    if (!job) throw new NotFoundError('Job', id);

    const context = await this.accessResolver.resolve(clerkUserId);

    if (!context.isPlatformAdmin) {
      if (context.recruiterId && context.roles.includes('recruiter')) {
        await this.auth.authorizeRecruiterMutate(context, job);
      } else if (context.organizationIds.length > 0) {
        await this.auth.authorizeCompanyMutate(context, job);
      } else {
        throw new ForbiddenError('Insufficient permissions to delete job');
      }
    }

    await this.repository.softDelete(id);

    await this.eventPublisher?.publish('job.deleted', {
      jobId: id, deletedBy: context.identityUserId,
    }, 'ats-service');

    await this.activityService?.logJobDeleted(id, job.status, context.identityUserId);
  }

  private validateSalaryRange(input: UpdateJobInput, current: any) {
    const min = input.salary_min ?? current.salary_min;
    const max = input.salary_max ?? current.salary_max;
    if (min != null && max != null && min > max) {
      throw new BadRequestError('salary_min cannot exceed salary_max');
    }
  }
}
