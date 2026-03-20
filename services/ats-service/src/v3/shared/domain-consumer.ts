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
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isClosing = false;
  private connectionHealthy = false;

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
    if (this.isConnecting) {
      this.logger.debug('V3 ATS consumer connection attempt already in progress, skipping');
      return;
    }

    this.isConnecting = true;

    try {
      this.connection = await amqp.connect(this.rabbitMqUrl, {
        heartbeat: 30,
      }) as any;
      this.channel = await (this.connection as any).createChannel();

      if (!this.channel) {
        throw new Error('Failed to create RabbitMQ channel');
      }

      // Setup connection event listeners
      this.connection!.on('error', (err) => {
        this.logger.error({ err }, 'V3 ATS consumer RabbitMQ connection error');
        this.connectionHealthy = false;
        this.scheduleReconnect();
      });

      this.connection!.on('close', () => {
        this.logger.warn('V3 ATS consumer RabbitMQ connection closed');
        this.connectionHealthy = false;
        if (!this.isClosing) this.scheduleReconnect();
      });

      this.channel.on('error', (err) => {
        this.logger.error({ err }, 'V3 ATS consumer RabbitMQ channel error');
        this.connectionHealthy = false;
        if (!this.isClosing) this.scheduleReconnect();
      });

      this.channel.on('close', () => {
        this.logger.warn('V3 ATS consumer RabbitMQ channel closed');
        this.connectionHealthy = false;
        if (!this.isClosing) this.scheduleReconnect();
      });

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

      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.connectionHealthy = true;

      this.logger.info('V3 ATS domain consumer connected to RabbitMQ');

      await this.channel.consume(
        this.queue,
        (msg) => this.handleMessage(msg),
        { noAck: false }
      );

      this.logger.info('V3 ATS domain consumer started consuming events');
    } catch (error) {
      this.isConnecting = false;
      this.connectionHealthy = false;
      this.logger.error({ err: error }, 'Failed to connect V3 ATS domain consumer to RabbitMQ');

      if (!this.isClosing) {
        this.scheduleReconnect();
      } else {
        throw error;
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.isClosing || this.reconnectTimeout) return;

    this.reconnectAttempts++;

    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      this.logger.error('V3 ATS consumer max reconnection attempts reached, giving up');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    this.logger.info({ attempt: this.reconnectAttempts, delay }, 'Scheduling V3 ATS consumer reconnection');

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null;
      await this.cleanup();
      try {
        await this.connect();
      } catch (error) {
        this.logger.error({ err: error }, 'V3 ATS consumer reconnection attempt failed');
      }
    }, delay);
  }

  private async cleanup(): Promise<void> {
    this.connectionHealthy = false;
    try { if (this.channel) await this.channel.close(); } catch (_) { }
    try { if (this.connection) await (this.connection as any).close(); } catch (_) { }
    this.connection = null;
    this.channel = null;
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null && this.connectionHealthy;
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
    this.isClosing = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    await this.cleanup();
    this.logger.info('V3 ATS domain consumer disconnected');
  }
}
