/**
 * Job Recommendations V3 Service
 * Authorization: company users create, candidates update status, admins do both.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { JobRecommendationRepository } from './repository';
import {
  CreateJobRecommendationInput,
  UpdateJobRecommendationInput,
  JobRecommendationListParams,
} from './types';

export class JobRecommendationService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: JobRecommendationRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: JobRecommendationListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    let scopeFilter: { candidate_id?: string } | undefined;

    if (context.isPlatformAdmin) {
      // Admins see all
    } else if (context.candidateId) {
      scopeFilter = { candidate_id: context.candidateId };
    } else {
      // Company users: core list returns all (no join to filter by company_id).
      // Use the detail view for enriched data with company context.
      throw new ForbiddenError('No access to job recommendations');
    }

    const { data, total } = await this.repository.findAll(params, scopeFilter);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundError('JobRecommendation', id);
    return item;
  }

  async create(input: CreateJobRecommendationInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    // Only company users or admins can create recommendations
    if (!context.isPlatformAdmin && !context.organizationIds?.length) {
      throw new ForbiddenError('Only company users or admins can create recommendations');
    }

    // Validate job exists and belongs to user's company
    const { data: job, error: jobError } = await this.supabase
      .from('jobs')
      .select('id, company_id')
      .eq('id', input.job_id)
      .single();

    if (jobError || !job) throw new NotFoundError('Job', input.job_id);

    if (!context.isPlatformAdmin && !context.organizationIds?.includes(job.company_id)) {
      throw new ForbiddenError('Job does not belong to your organization');
    }

    // Validate candidate exists
    const { data: candidate, error: candidateError } = await this.supabase
      .from('candidates')
      .select('id')
      .eq('id', input.candidate_id)
      .single();

    if (candidateError || !candidate) throw new NotFoundError('Candidate', input.candidate_id);

    // Check for duplicate
    const existing = await this.repository.findByJobAndCandidate(input.job_id, input.candidate_id);
    if (existing) {
      throw new BadRequestError('A recommendation already exists for this job and candidate');
    }

    const result = await this.repository.create({
      job_id: input.job_id,
      candidate_id: input.candidate_id,
      recommended_by: context.identityUserId!,
      message: input.message,
    });

    await this.eventPublisher?.publish('job_recommendation.created', {
      id: result.id,
      job_id: result.job_id,
      candidate_id: result.candidate_id,
      recommended_by: result.recommended_by,
    }, 'ats-service');

    return result;
  }

  async updateStatus(id: string, input: UpdateJobRecommendationInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundError('JobRecommendation', id);

    // Only the target candidate or an admin can update status
    if (!context.isPlatformAdmin && context.candidateId !== item.candidate_id) {
      throw new ForbiddenError('Only the recommended candidate can update status');
    }

    return this.repository.updateStatus(id, input.status);
  }

  async getForCandidate(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.candidateId) {
      throw new ForbiddenError('Candidate profile not found for user');
    }

    const { data, total } = await this.repository.findForCandidate(
      context.candidateId,
      ['pending', 'viewed']
    );

    return {
      data,
      pagination: { total, page: 1, limit: total, total_pages: 1 },
    };
  }
}
