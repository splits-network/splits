/**
 * V3 Domain Event Consumer
 *
 * Subscribes to candidate and job lifecycle events via RabbitMQ
 * and routes them to the matching orchestrator for scoring.
 *
 * Events:
 * - candidate.created / candidate.updated → score candidate against open jobs
 * - job.created / job.updated → score job against eligible candidates
 * - job.status_changed → handle active/closed/paused/filled transitions
 * - resume.metadata.extracted → re-score candidate with enriched data
 */

import * as amqp from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { MatchingOrchestrator } from './matching-orchestrator.js';

interface DomainConsumerConfig {
  rabbitMqUrl: string;
  orchestrator: MatchingOrchestrator;
  logger: Logger;
}

const SUBSCRIBED_EVENTS = [
  'candidate.created',
  'candidate.updated',
  'job.created',
  'job.updated',
  'job.status_changed',
  'resume.metadata.extracted',
] as const;

export class DomainEventConsumer {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly exchange = 'splits-network-events';
  private readonly queue = 'matching-service-v3-queue';
  private orchestrator: MatchingOrchestrator;
  private logger: Logger;

  constructor(private config: DomainConsumerConfig) {
    this.orchestrator = config.orchestrator;
    this.logger = config.logger;
  }

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.config.rabbitMqUrl);
    if (!this.connection) throw new Error('Failed to establish RabbitMQ connection');

    this.channel = await this.connection.createChannel();
    if (!this.channel) throw new Error('Failed to create channel');

    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    await this.channel.assertQueue(this.queue, { durable: true });

    for (const event of SUBSCRIBED_EVENTS) {
      await this.channel.bindQueue(this.queue, this.exchange, event);
    }

    this.logger.info(
      { exchange: this.exchange, queue: this.queue, bindings: [...SUBSCRIBED_EVENTS] },
      'V3 matching domain consumer connected to RabbitMQ',
    );

    await this.channel.consume(this.queue, async (msg) => {
      if (!msg) return;
      try {
        const rawEvent = JSON.parse(msg.content.toString());
        const payload = rawEvent.payload ?? rawEvent;
        const event: DomainEvent = {
          event_type: rawEvent.event_type ?? msg.fields.routingKey,
          event_id: rawEvent.event_id ?? rawEvent.id ?? msg.properties.messageId ?? 'unknown',
          timestamp: rawEvent.timestamp ?? new Date().toISOString(),
          source_service: rawEvent.source_service ?? 'unknown',
          payload,
        };

        await this.handleEvent(event);
        this.channel!.ack(msg);
      } catch (error) {
        this.logger.error(
          { err: error, message: msg.content.toString() },
          'Failed to process matching event',
        );
        this.channel!.nack(msg, false, true);
      }
    }, { noAck: false });

    this.logger.info('Started consuming domain events for V3 matching');
  }

  private async handleEvent(event: DomainEvent): Promise<void> {
    const { payload } = event;

    this.logger.info(
      { event_type: event.event_type, event_id: event.event_id },
      'Processing matching event',
    );

    switch (event.event_type) {
      case 'candidate.created':
      case 'candidate.updated':
        await this.orchestrator.scoreCandidate(
          payload.candidateId || payload.candidate_id,
        );
        break;

      case 'job.created':
      case 'job.updated':
        await this.orchestrator.scoreJob(
          payload.jobId || payload.job_id,
        );
        break;

      case 'job.status_changed':
        await this.handleJobStatusChanged(event);
        break;

      case 'resume.metadata.extracted':
        if (payload.entity_type === 'candidate' && payload.structured_data_available) {
          await this.orchestrator.rescoreWithResumeData(payload.entity_id);
        }
        break;

      default:
        this.logger.debug({ event_type: event.event_type }, 'Unhandled event type');
    }
  }

  private async handleJobStatusChanged(event: DomainEvent): Promise<void> {
    const { jobId, job_id, newStatus, new_status } = event.payload;
    const id = jobId || job_id;
    const status = newStatus || new_status;

    await this.orchestrator.handleJobStatusChanged(id, status);
  }

  isConnected(): boolean {
    return this.channel !== null && this.connection !== null;
  }

  async close(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.info('Closed V3 matching domain consumer');
    } catch (error) {
      this.logger.error({ err: error }, 'Error closing V3 domain consumer');
    }
  }
}
