/**
 * V3 Domain Event Handlers — AI Service
 *
 * Handles individual event types routed by the domain consumer.
 * Preserves all V2 event names and payload structures exactly.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { IEventPublisher } from '../../v2/shared/events.js';
import { AIReviewServiceV2 } from '../../v2/reviews/service.js';
import { ResumeExtractionService } from '../../v2/resume-extraction/service.js';
import { ResumeExtractionRepository } from '../../v2/resume-extraction/repository.js';
import { CallPipelineService } from '../../v2/call-pipeline/service.js';

export interface DomainConsumerConfig {
  rabbitMqUrl: string;
  supabase: SupabaseClient;
  aiReviewService: AIReviewServiceV2;
  resumeExtractionService: ResumeExtractionService;
  resumeExtractionRepository: ResumeExtractionRepository;
  callPipelineService: CallPipelineService;
  eventPublisher?: IEventPublisher;
  logger: Logger;
}

/**
 * Trigger AI review when application transitions to ai_review or gpt_review.
 */
export async function handleStageChanged(
  event: DomainEvent,
  config: DomainConsumerConfig,
): Promise<void> {
  const { application_id, new_stage, candidate_id, job_id } = event.payload;
  const old_stage = event.payload.old_stage || event.payload.previous_stage;

  if (new_stage !== 'ai_review' && new_stage !== 'gpt_review') {
    config.logger.debug({ application_id, new_stage }, 'Not a review stage, skipping');
    return;
  }

  config.logger.info(
    { application_id, candidate_id, job_id, old_stage, new_stage },
    'Application transitioned to review stage, triggering AI review',
  );

  const enrichedInput = await config.aiReviewService.enrichApplicationData({
    application_id,
    candidate_id,
    job_id,
  });

  await config.aiReviewService.createReview(enrichedInput);

  config.logger.info(
    { application_id, transition: `${old_stage} -> ${new_stage}` },
    'AI review triggered successfully for stage transition',
  );
}

/**
 * Extract structured resume metadata from processed documents.
 */
export async function handleDocumentProcessed(
  event: DomainEvent,
  config: DomainConsumerConfig,
): Promise<void> {
  const { document_id, entity_type, entity_id, processing_status } = event.payload;

  if (processing_status !== 'processed') {
    config.logger.debug({ document_id, processing_status }, 'Document not processed, skipping');
    return;
  }

  try {
    const document = await config.resumeExtractionRepository.getDocument(document_id);
    if (!document) {
      config.logger.warn({ document_id }, 'Document not found for structured extraction');
      return;
    }

    if (
      document.document_type !== 'resume' ||
      (document.entity_type !== 'candidate' && document.entity_type !== 'application')
    ) {
      config.logger.debug(
        { document_id, document_type: document.document_type },
        'Not a resume, skipping',
      );
      return;
    }

    const extractedText = document.metadata?.extracted_text;
    if (!extractedText || typeof extractedText !== 'string' || extractedText.length < 50) {
      config.logger.warn({ document_id }, 'Insufficient extracted text for structured extraction');
      return;
    }

    if (document.structured_metadata) {
      config.logger.debug({ document_id }, 'Structured data already exists, skipping');
      return;
    }

    const structuredData = await config.resumeExtractionService.extractStructuredData(
      extractedText,
      document_id,
    );
    await config.resumeExtractionRepository.writeStructuredData(document_id, structuredData);

    if (config.eventPublisher) {
      await config.eventPublisher.publish('resume.metadata.extracted', {
        document_id,
        entity_type: document.entity_type,
        entity_id: document.entity_id,
        structured_data_available: true,
        skills_count: structuredData.skills_count,
        experience_count: structuredData.experience.length,
        education_count: structuredData.education.length,
      });
    }
  } catch (error) {
    config.logger.error(
      { err: error, document_id, entity_type, entity_id },
      'Resume extraction failed (non-fatal)',
    );

    if (config.eventPublisher) {
      try {
        await config.eventPublisher.publish('resume.metadata.extracted', {
          document_id,
          entity_type,
          entity_id,
          structured_data_available: false,
          error: error instanceof Error ? error.message : String(error),
        });
      } catch {
        // Event publish failure is non-critical
      }
    }
  }
}

/**
 * Handle resume analysis request from gpt-service (via RabbitMQ event).
 * Replaces the previous HTTP call pattern.
 */
export async function handleResumeAnalyzeRequested(
  event: DomainEvent,
  config: DomainConsumerConfig,
): Promise<void> {
  const {
    analysis_id, candidate_id, job_id,
    resume_text, job_description, job_title,
    job_location, clerk_user_id, resume_source,
  } = event.payload;

  config.logger.info(
    { analysis_id, candidate_id, job_id },
    'Resume analysis requested via event, triggering AI review',
  );

  // Let ai-service enrich with requirements from DB
  const enrichedInput = await config.aiReviewService.enrichApplicationData({
    application_id: analysis_id,
    candidate_id,
    job_id,
    resume_text,
    job_description,
    job_title,
    job_location,
  });

  const review = await config.aiReviewService.createReview(enrichedInput);

  if (config.eventPublisher) {
    await config.eventPublisher.publish('gpt.action.resume_analyzed', {
      analysis_id,
      candidate_id,
      job_id,
      fit_score: review?.fit_score,
      clerk_user_id,
      resume_source,
    });
  }

  config.logger.info(
    { analysis_id, fit_score: review?.fit_score },
    'Resume analysis completed via event handler',
  );
}

/**
 * Trigger call AI pipeline (transcription + summarization).
 */
export async function handleCallRecordingReady(
  event: DomainEvent,
  config: DomainConsumerConfig,
): Promise<void> {
  const { call_id, recording_url, duration_seconds, file_size_bytes } = event.payload;

  config.logger.info(
    { call_id, duration_seconds, file_size_bytes },
    'Call recording ready, starting AI pipeline',
  );

  await config.callPipelineService.processRecording({
    call_id,
    recording_url,
    duration_seconds,
    file_size_bytes,
  });
}
