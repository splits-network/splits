/**
 * AI Reviews V3 Service
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { AIReviewRepository } from './repository.js';
import { CreateReviewInput, AIReviewListParams } from './types.js';

export class AIReviewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: AIReviewRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: AIReviewListParams, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const review = await this.repository.findById(id);
    if (!review) throw new NotFoundError('AIReview', id);
    return review;
  }

  async create(input: CreateReviewInput, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);

    const review = await this.repository.create({
      application_id: input.application_id,
      candidate_id: input.candidate_id,
      job_id: input.job_id,
      resume_text: input.resume_text || null,
      job_description: input.job_description,
      job_title: input.job_title,
      required_skills: input.required_skills,
      preferred_skills: input.preferred_skills || [],
      required_years: input.required_years || null,
      candidate_location: input.candidate_location || null,
      job_location: input.job_location || null,
      status: 'pending',
    });

    await this.eventPublisher?.publish('ai_review.created', {
      review_id: review.id,
      application_id: input.application_id,
      job_id: input.job_id,
    }, 'ai-service');

    return review;
  }
}
