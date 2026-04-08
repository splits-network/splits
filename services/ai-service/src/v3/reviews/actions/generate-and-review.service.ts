/**
 * Generate and Review Service
 *
 * Combined admin action: generates a tailored resume from the candidate's
 * smart resume data for a specific job, saves it to applications.resume_data,
 * then runs a fresh AI review using the tailored resume.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@splits-network/shared-logging';
import type { IAiClient } from '@splits-network/shared-ai-client';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { AIReviewRepository } from '../../../v2/reviews/repository.js';
import { AIReviewServiceV2 } from '../../../v2/reviews/service.js';
import { GenerateResumeService } from './generate-resume.service.js';

const logger = createLogger({ serviceName: 'ai-service', level: 'info' });

export class GenerateAndReviewService {
  private generateResumeService: GenerateResumeService;
  private aiReviewService: AIReviewServiceV2;

  constructor(
    private supabase: SupabaseClient,
    aiClient: IAiClient,
    eventPublisher?: IEventPublisher,
  ) {
    this.generateResumeService = new GenerateResumeService(supabase, aiClient);

    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
    const repository = new AIReviewRepository(supabaseUrl, supabaseKey);
    this.aiReviewService = new AIReviewServiceV2(repository, eventPublisher, logger, aiClient);
  }

  async generateAndReview(applicationId: string): Promise<{ tailored_resume: any; ai_review: any }> {
    // 1. Fetch application to get candidate_id and job_id
    const { data: application, error: appError } = await this.supabase
      .from('applications')
      .select('id, candidate_id, job_id')
      .eq('id', applicationId)
      .maybeSingle();

    if (appError) throw appError;
    if (!application) {
      throw Object.assign(new Error('Application not found'), { statusCode: 404 });
    }
    if (!application.candidate_id || !application.job_id) {
      throw Object.assign(new Error('Application is missing candidate or job reference'), { statusCode: 400 });
    }

    // 2. Generate tailored resume from smart resume + job data
    logger.info({ application_id: applicationId, candidate_id: application.candidate_id, job_id: application.job_id }, 'Generating tailored resume');
    const tailoredResume = await this.generateResumeService.generate({
      candidate_id: application.candidate_id,
      job_id: application.job_id,
    });

    // 3. Save tailored resume to applications.resume_data
    const resumeData = {
      ...tailoredResume,
      source: 'admin_generated',
      generated_at: new Date().toISOString(),
    };

    const { error: updateError } = await this.supabase
      .from('applications')
      .update({ resume_data: resumeData })
      .eq('id', applicationId);

    if (updateError) throw updateError;

    logger.info({ application_id: applicationId }, 'Saved tailored resume to application');

    // 4. Run AI review using the updated resume data
    logger.info({ application_id: applicationId }, 'Running AI review');
    const enrichedInput = await this.aiReviewService.enrichApplicationData({
      application_id: applicationId,
      candidate_id: application.candidate_id,
      job_id: application.job_id,
    });
    const aiReview = await this.aiReviewService.createReview(enrichedInput);

    logger.info({ application_id: applicationId, ai_review_id: aiReview.id, fit_score: aiReview.fit_score }, 'Generate and review complete');

    return { tailored_resume: resumeData, ai_review: aiReview };
  }
}
