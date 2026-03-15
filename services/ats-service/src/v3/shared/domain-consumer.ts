/**
 * V3 Domain Event Consumer for ATS Service
 *
 * Subscribes to cross-service domain events and routes them to V3 service methods.
 * Replaces V2 domain-consumer.ts with V3 service calls.
 */

import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { IEventPublisher } from '../../v2/shared/events';
import { ApplicationRepository } from '../applications/repository';
import { AIReviewService } from '../applications/actions/ai-review.service';
import { CandidateSourcerRepository } from '../candidate-sourcers/repository';

interface DomainEvent {
  event_id: string;
  event_type: string;
  payload: Record<string, any>;
  timestamp: string;
}

export class DomainEventConsumerV3 {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly exchange = 'splits-network-events';
  private readonly queue = 'ats-service-v3-events';

  constructor(
    private rabbitMqUrl: string,
    private supabase: SupabaseClient,
    private applicationRepository: ApplicationRepository,
    private candidateSourcerRepository: CandidateSourcerRepository,
    private aiReviewService: AIReviewService,
    private eventPublisher: IEventPublisher,
    private logger: Logger
  ) {}

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.rabbitMqUrl) as any;
      this.channel = await (this.connection as any).createChannel();

      if (!this.channel) {
        throw new Error('Failed to create RabbitMQ channel');
      }

      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queue, { durable: true });

      // Bind to all events this consumer handles
      const bindings = [
        'ai_review.completed',
        'ai_review.failed',
        'candidate.link_requested',
        'candidate.sourcer_assignment_requested',
        'resume.metadata.extracted',
        'resume.primary.changed',
      ];

      for (const binding of bindings) {
        await this.channel.bindQueue(this.queue, this.exchange, binding);
      }

      this.logger.info('V3 ATS domain consumer connected to RabbitMQ');

      await this.channel.consume(
        this.queue,
        (msg) => this.handleMessage(msg),
        { noAck: false }
      );

      this.logger.info('V3 ATS domain consumer started consuming events');
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to connect V3 ATS domain consumer to RabbitMQ');
      throw error;
    }
  }

  private async handleMessage(msg: ConsumeMessage | null): Promise<void> {
    if (!msg || !this.channel) return;

    try {
      const event: DomainEvent = JSON.parse(msg.content.toString());

      this.logger.info(
        { event_id: event.event_id, event_type: event.event_type },
        'V3 ATS consumer received domain event'
      );

      switch (event.event_type) {
        case 'ai_review.completed':
          await this.aiReviewService.handleAIReviewCompleted(event.payload as any);
          break;

        case 'ai_review.failed':
          await this.aiReviewService.handleAIReviewFailed(event.payload as any);
          break;

        case 'candidate.link_requested':
          await this.handleCandidateLinkRequested(event);
          break;

        case 'candidate.sourcer_assignment_requested':
          await this.handleSourcerAssignment(event);
          break;

        case 'resume.metadata.extracted':
          await this.handleResumeMetadataExtracted(event);
          break;

        case 'resume.primary.changed':
          await this.handleResumePrimaryChanged(event);
          break;

        default:
          this.logger.debug({ event_type: event.event_type }, 'Event type not handled');
      }

      this.channel.ack(msg);
    } catch (error) {
      this.logger.error({ err: error }, 'Error handling domain event');
      this.channel?.nack(msg, false, true);
    }
  }

  /**
   * Link a Clerk user ID to a candidate profile when they accept invitation
   */
  private async handleCandidateLinkRequested(event: DomainEvent): Promise<void> {
    const { candidate_id, user_id } = event.payload;

    const { data: user } = await this.supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', user_id)
      .single();

    if (!user) {
      this.logger.warn({ user_id, candidate_id }, 'User not found for candidate link');
      return;
    }

    const { error } = await this.supabase
      .from('candidates')
      .update({ user_id: user.id })
      .eq('id', candidate_id);

    if (error) throw error;

    this.logger.info({ candidate_id, user_id }, 'Linked user to candidate profile');
  }

  /**
   * Assign sourcer credit to recruiter for first contact with candidate.
   * Includes conflict detection and ownership.conflict_detected event publishing.
   */
  private async handleSourcerAssignment(event: DomainEvent): Promise<void> {
    const { candidate_id, recruiter_id, source_method } = event.payload;

    const existing = await this.candidateSourcerRepository.findByCandidateId(candidate_id);

    if (existing) {
      this.logger.warn(
        { candidate_id, existing_sourcer_id: existing.sourcer_recruiter_id, requested_sourcer_id: recruiter_id },
        'Sourcer already assigned — conflict detected'
      );

      await this.eventPublisher.publish('ownership.conflict_detected', {
        candidate_id,
        existing_sourcer_recruiter_id: existing.sourcer_recruiter_id,
        requested_sourcer_recruiter_id: recruiter_id,
        source_method,
        existing_sourced_at: existing.sourced_at,
        existing_protection_expires_at: existing.protection_expires_at,
        conflict_detected_at: new Date().toISOString(),
      });

      return;
    }

    const protectionDays = 365;
    const protectionExpiresAt = new Date(Date.now() + protectionDays * 86400000);

    const sourcer = await this.candidateSourcerRepository.create({
      candidate_id,
      sourcer_recruiter_id: recruiter_id,
      sourcer_type: 'recruiter',
      sourced_at: new Date().toISOString(),
      protection_window_days: protectionDays,
      protection_expires_at: protectionExpiresAt.toISOString(),
      notes: `Sourced via ${source_method}`,
    });

    // Update legacy candidate.recruiter_id for backward compatibility
    const { error: legacyError } = await this.supabase
      .from('candidates')
      .update({ recruiter_id })
      .eq('id', candidate_id);

    if (legacyError) {
      this.logger.warn({ candidate_id, recruiter_id, error: legacyError }, 'Failed to update legacy recruiter_id');
    }

    // Publish V2-compatible event name for notification consumers
    await this.eventPublisher.publish('candidate.sourced', {
      candidate_id,
      sourcer_user_id: recruiter_id,
      sourcer_type: 'recruiter',
      source_method,
      sourced_at: sourcer.sourced_at,
      protection_expires_at: sourcer.protection_expires_at,
    });

    this.logger.info({ candidate_id, sourcer_id: sourcer.id, recruiter_id }, 'Assigned sourcer credit');
  }

  /**
   * Sync AI-extracted resume structured data to application or candidate
   */
  private async handleResumeMetadataExtracted(event: DomainEvent): Promise<void> {
    const { document_id, entity_type, entity_id, structured_data_available } = event.payload;

    if (!structured_data_available) return;

    try {
      if (entity_type === 'application') {
        await this.syncResumeDataToApplication(document_id, entity_id);
      } else if (entity_type === 'candidate') {
        await this.syncResumeDataToCandidate(document_id, entity_id);
      }
    } catch (error: any) {
      this.logger.error({ err: error, document_id, entity_type, entity_id }, 'Failed to sync resume metadata');
      // Non-critical — don't rethrow
    }
  }

  /**
   * When primary resume changes, sync structured data to candidate
   */
  private async handleResumePrimaryChanged(event: DomainEvent): Promise<void> {
    const { document_id, entity_type, entity_id } = event.payload;

    if (entity_type !== 'candidate') return;

    try {
      await this.syncResumeDataToCandidate(document_id, entity_id);
    } catch (error: any) {
      this.logger.error({ err: error, document_id, entity_id }, 'Failed to sync resume metadata after primary change');
    }
  }

  private async syncResumeDataToCandidate(documentId: string, candidateId: string): Promise<void> {
    const { data: doc } = await this.supabase
      .from('documents')
      .select('metadata, structured_metadata')
      .eq('id', documentId)
      .single();

    if (!doc?.metadata?.is_primary_for_candidate || !doc.structured_metadata) return;

    const { error } = await this.supabase
      .from('candidates')
      .update({ resume_metadata: doc.structured_metadata })
      .eq('id', candidateId);

    if (error) throw error;

    this.logger.info({ candidate_id: candidateId, document_id: documentId }, 'Synced resume data to candidate');
  }

  private async syncResumeDataToApplication(documentId: string, applicationId: string): Promise<void> {
    const { data: doc } = await this.supabase
      .from('documents')
      .select('structured_metadata')
      .eq('id', documentId)
      .single();

    if (!doc?.structured_metadata) return;

    const resumeData = {
      source: 'document_extraction',
      created_at: new Date().toISOString(),
      summary: doc.structured_metadata.professional_summary,
      experience: doc.structured_metadata.experience,
      education: doc.structured_metadata.education,
      skills: doc.structured_metadata.skills,
      certifications: doc.structured_metadata.certifications,
    };

    const { error } = await this.supabase
      .from('applications')
      .update({ resume_data: resumeData })
      .eq('id', applicationId);

    if (error) throw error;

    this.logger.info({ application_id: applicationId, document_id: documentId }, 'Synced resume data to application');
  }

  async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await (this.connection as any)?.close();
      this.logger.info('V3 ATS domain consumer disconnected');
    } catch (error) {
      this.logger.error({ err: error }, 'Error disconnecting V3 ATS domain consumer');
    }
  }
}
