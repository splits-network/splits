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

        // candidate.sourcer_assignment_requested — REMOVED
        // Sourcer attribution is immutable, set only at signup via referral link/code.
        // The event and handler have been removed to enforce this rule.

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
   * Link a Clerk user ID to a candidate profile when they accept invitation.
   * Also ensures user_roles entry exists so resolveAccessContext can resolve
   * the candidateId — the webhook's ensureCandidateExists may not have run
   * (wrong sourceApp) or may have created a different candidate (email mismatch).
   */
  private async handleCandidateLinkRequested(event: DomainEvent): Promise<void> {
    const { candidate_id, user_id } = event.payload;

    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', user_id)
      .single();

    if (userError || !user) {
      // Throw to nack/requeue — user record may not exist yet (webhook race)
      throw userError || new Error(`User not found for clerk_user_id: ${user_id}`);
    }

    const { error: linkError } = await this.supabase
      .from('candidates')
      .update({ user_id: user.id })
      .eq('id', candidate_id);

    if (linkError) throw linkError;

    // Ensure user_roles entry exists for this candidate
    const { error: roleError } = await this.supabase
      .from('user_roles')
      .upsert(
        {
          user_id: user.id,
          role_name: 'candidate',
          role_entity_id: candidate_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,role_name,role_entity_id' }
      );

    if (roleError) {
      this.logger.warn(
        { candidate_id, user_id: user.id, error: roleError.message },
        'Failed to upsert user_roles for candidate (non-fatal)'
      );
    }

    this.logger.info({ candidate_id, user_id }, 'Linked user to candidate profile');
  }

  // handleSourcerAssignment — REMOVED
  // Sourcer attribution is immutable, set only at signup via referral link/code.
  // See identity-service user registration flow for the only legitimate sourcer creation path.

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
