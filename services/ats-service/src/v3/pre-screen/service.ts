/**
 * Pre-Screen V3 Service — Business Logic
 *
 * Handles authorization, validation, and event publishing
 * for pre-screen questions (on jobs) and answers (on applications).
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { PreScreenRepository } from './repository.js';
import {
  PreScreenListParams,
  CreatePreScreenInput,
  UpdatePreScreenInput,
  PreScreenQuestion,
} from './types.js';

export class PreScreenService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: PreScreenRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  /**
   * List jobs with their pre-screen questions.
   * Scoped by role: admins see all, company users see their jobs,
   * recruiters see jobs they own.
   */
  async getAll(params: PreScreenListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopeFilters: { company_ids?: string[]; recruiter_id?: string } = {};

    if (context.isPlatformAdmin) {
      // Admins see everything
    } else if (context.organizationIds.length > 0) {
      scopeFilters.company_ids = context.organizationIds;
    } else if (context.recruiterId && context.roles.includes('recruiter')) {
      scopeFilters.recruiter_id = context.recruiterId;
    } else {
      return { data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } };
    }

    const { data, total } = await this.repository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  /**
   * Get pre-screen questions for a specific job.
   */
  async getByJobId(jobId: string, clerkUserId: string) {
    const job = await this.repository.findById(jobId);
    if (!job) throw new NotFoundError('Job', jobId);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      const isCompanyUser = context.organizationIds.includes(job.company_id);
      const isJobOwner = context.recruiterId === job.job_owner_recruiter_id;
      if (!isCompanyUser && !isJobOwner) {
        throw new ForbiddenError('You do not have access to this job\'s pre-screen questions');
      }
    }

    return {
      job_id: job.id,
      title: job.title,
      questions: job.pre_screen_questions || [],
    };
  }

  /**
   * Create (set) pre-screen questions on a job.
   * Fails if the job already has questions — use update instead.
   */
  async create(input: CreatePreScreenInput, clerkUserId: string) {
    const job = await this.repository.findById(input.job_id);
    if (!job) throw new NotFoundError('Job', input.job_id);

    const context = await this.accessResolver.resolve(clerkUserId);
    this.assertCanManageQuestions(context, job);

    const existingQuestions = job.pre_screen_questions || [];
    if (existingQuestions.length > 0) {
      throw new BadRequestError(
        'Pre-screen questions already exist for this job. Use PATCH to update.'
      );
    }

    this.validateQuestions(input.questions);
    const updated = await this.repository.create(input.job_id, input.questions);

    await this.eventPublisher?.publish('pre_screen.questions_created', {
      job_id: input.job_id,
      question_count: input.questions.length,
      created_by: context.identityUserId,
    }, 'ats-service');

    return {
      job_id: updated.id,
      title: updated.title,
      questions: updated.pre_screen_questions || [],
    };
  }

  /**
   * Update (replace) pre-screen questions on a job.
   */
  async update(jobId: string, input: UpdatePreScreenInput, clerkUserId: string) {
    const job = await this.repository.findById(jobId);
    if (!job) throw new NotFoundError('Job', jobId);

    const context = await this.accessResolver.resolve(clerkUserId);
    this.assertCanManageQuestions(context, job);
    this.validateQuestions(input.questions);

    const updated = await this.repository.update(jobId, input.questions);
    if (!updated) throw new NotFoundError('Job', jobId);

    await this.eventPublisher?.publish('pre_screen.questions_updated', {
      job_id: jobId,
      question_count: input.questions.length,
      updated_by: context.identityUserId,
    }, 'ats-service');

    return {
      job_id: updated.id,
      title: updated.title,
      questions: updated.pre_screen_questions || [],
    };
  }

  /**
   * Delete (clear) all pre-screen questions from a job.
   */
  async delete(jobId: string, clerkUserId: string) {
    const job = await this.repository.findById(jobId);
    if (!job) throw new NotFoundError('Job', jobId);

    const context = await this.accessResolver.resolve(clerkUserId);
    this.assertCanManageQuestions(context, job);

    await this.repository.delete(jobId);

    await this.eventPublisher?.publish('pre_screen.questions_deleted', {
      job_id: jobId,
      deleted_by: context.identityUserId,
    }, 'ats-service');
  }

  /**
   * Get pre-screen answers for an application.
   * Accessible by company users, the owning recruiter, or admins.
   */
  async getAnswers(applicationId: string, clerkUserId: string) {
    const application = await this.repository.findAnswersByApplicationId(applicationId);
    if (!application) throw new NotFoundError('Application', applicationId);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      const isRecruiter = context.recruiterId === application.candidate_recruiter_id;

      // Check if user belongs to the company that owns the job
      const job = await this.repository.findById(application.job_id);
      const isCompanyUser = job && context.organizationIds.includes(job.company_id);

      if (!isRecruiter && !isCompanyUser) {
        throw new ForbiddenError('You do not have access to these pre-screen answers');
      }
    }

    return {
      application_id: application.id,
      job_id: application.job_id,
      candidate_id: application.candidate_id,
      answers: application.pre_screen_answers || [],
    };
  }

  // --- Private Helpers ---

  private assertCanManageQuestions(context: any, job: any): void {
    if (context.isPlatformAdmin) return;

    const isCompanyUser = context.organizationIds.includes(job.company_id);
    const isJobOwner = context.recruiterId === job.job_owner_recruiter_id;

    if (!isCompanyUser && !isJobOwner) {
      throw new ForbiddenError('Only the job owner or company users can manage pre-screen questions');
    }
  }

  private validateQuestions(questions: PreScreenQuestion[]): void {
    for (const q of questions) {
      if (!q.question.trim()) {
        throw new BadRequestError('Question text cannot be empty');
      }

      const requiresOptions = ['select', 'multi_select'].includes(q.question_type);
      if (requiresOptions && (!q.options || q.options.length < 2)) {
        throw new BadRequestError(
          `Question "${q.question}" requires at least 2 options for type "${q.question_type}"`
        );
      }
    }
  }
}
