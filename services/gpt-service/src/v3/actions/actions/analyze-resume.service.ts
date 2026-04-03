/**
 * Analyze Resume Action Service
 *
 * Publishes a `resume.analyze.requested` event via RabbitMQ
 * instead of making a direct HTTP call to ai-service.
 * The ai-service domain consumer picks up the event for processing.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { GptActionsRepository } from '../repository.js';
import { ResumeAnalysisInput } from '../types.js';

export class AnalyzeResumeService {
  private repository: GptActionsRepository;
  private accessResolver: AccessContextResolver;

  constructor(
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.repository = new GptActionsRepository(supabase);
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async execute(input: ResumeAnalysisInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.candidateId) throw new ForbiddenError('Candidate profile not found');

    if (!input.job_id) throw new BadRequestError('job_id is required');

    const job = await this.repository.getJobById(input.job_id);
    if (!job) throw new NotFoundError('Job', input.job_id);

    let resumeText = input.resume_text || null;

    if (!resumeText) {
      const storedResume = await this.repository.getCandidateResume(context.candidateId);
      if (storedResume?.metadata?.extracted_text) {
        resumeText = storedResume.metadata.extracted_text;
      }
    }

    if (!resumeText) {
      throw new BadRequestError(
        'No resume available. Upload your resume or provide resume_text.',
      );
    }

    if (!this.eventPublisher) {
      throw new Error('Event publisher not configured');
    }

    const analysisId = `gpt-analysis-${context.candidateId}-${input.job_id}-${Date.now()}`;

    // Publish event for ai-service to process (no HTTP call).
    // Pass resume_text and basic job info; ai-service enriches
    // with requirements and other details via its own DB queries.
    await this.eventPublisher.publish('resume.analyze.requested', {
      analysis_id: analysisId,
      candidate_id: context.candidateId,
      job_id: input.job_id,
      resume_text: resumeText,
      job_description: job.description,
      job_title: job.title,
      job_location: job.location,
      clerk_user_id: clerkUserId,
      resume_source: input.resume_text ? 'gpt_upload' : 'stored',
    });

    // Publish audit event
    await this.eventPublisher.publish('gpt.action.resume_analyze_requested', {
      analysis_id: analysisId,
      candidate_id: context.candidateId,
      job_id: input.job_id,
      clerk_user_id: clerkUserId,
      resume_source: input.resume_text ? 'gpt_upload' : 'stored',
    });

    return {
      status: 'PROCESSING',
      message: 'Resume analysis has been queued. Results will be available shortly.',
      analysis_id: analysisId,
      job_title: job.title,
    };
  }
}
