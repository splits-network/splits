/**
 * V3 Reputation Event Consumer
 *
 * Listens for domain events that trigger reputation recalculation:
 * - placement.completed / placement.failed
 * - application.stage_changed (to 'hired')
 * - application.expired
 */

import * as amqp from 'amqplib';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { IEventPublisher } from '../../v2/shared/events';
import { RecalcService } from './recalc-service';

interface ReputationConsumerConfig {
  rabbitMqUrl: string;
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  logger: Logger;
}

export class ReputationEventConsumer {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly exchange = 'splits-network-events';
  private readonly queue = 'automation-service-v3-reputation-queue';
  private recalcService: RecalcService;
  private logger: Logger;

  constructor(private config: ReputationConsumerConfig) {
    this.logger = config.logger;
    this.recalcService = new RecalcService(config.supabase, config.eventPublisher, config.logger);
  }

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.config.rabbitMqUrl);
    if (!this.connection) throw new Error('Failed to establish RabbitMQ connection');

    this.channel = await this.connection.createChannel();
    if (!this.channel) throw new Error('Failed to create channel');

    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    await this.channel.assertQueue(this.queue, { durable: true });

    await this.channel.bindQueue(this.queue, this.exchange, 'placement.completed');
    await this.channel.bindQueue(this.queue, this.exchange, 'placement.failed');
    await this.channel.bindQueue(this.queue, this.exchange, 'application.stage_changed');
    await this.channel.bindQueue(this.queue, this.exchange, 'application.expired');

    this.logger.info('V3 reputation consumer connected to RabbitMQ');

    await this.channel.consume(this.queue, async (msg) => {
      if (!msg) return;
      try {
        const event: DomainEvent = JSON.parse(msg.content.toString());
        await this.handleEvent(event);
        this.channel!.ack(msg);
      } catch (error) {
        this.logger.error({ err: error }, 'Failed to process reputation event');
        this.channel!.nack(msg, false, false);
      }
    });

    this.logger.info('Started consuming V3 reputation-related events');
  }

  private async handleEvent(event: DomainEvent): Promise<void> {
    this.logger.info(
      { event_type: event.event_type, event_id: event.event_id },
      'Processing reputation event',
    );

    switch (event.event_type) {
      case 'placement.completed':
      case 'placement.failed':
        await this.handlePlacementEvent(event);
        break;
      case 'application.stage_changed':
        await this.handleStageChangeEvent(event);
        break;
      case 'application.expired':
        await this.handleExpirationEvent(event);
        break;
      default:
        this.logger.debug({ event_type: event.event_type }, 'Unhandled event type for reputation');
    }
  }

  private async handlePlacementEvent(event: DomainEvent): Promise<void> {
    const placementId = event.payload?.placement_id;
    if (!placementId) {
      this.logger.warn({ event_type: event.event_type }, 'Placement event missing placement_id');
      return;
    }
    await this.recalcService.handlePlacementEvent(placementId);
  }

  private async handleStageChangeEvent(event: DomainEvent): Promise<void> {
    const newStage = event.payload?.new_stage || event.payload?.stage;
    if (newStage !== 'hired') return;

    const recruiterId = event.payload?.candidate_recruiter_id || event.payload?.recruiter_id;
    if (!recruiterId) {
      this.logger.warn('Stage change to hired but no recruiter_id in payload');
      return;
    }
    await this.recalcService.handleHireEvent(recruiterId);
  }

  private async handleExpirationEvent(event: DomainEvent): Promise<void> {
    const recruiterId = event.payload?.candidate_recruiter_id || event.payload?.recruiter_id;
    if (!recruiterId) {
      this.logger.warn({ event_type: event.event_type }, 'Expiration event missing recruiter_id');
      return;
    }
    await this.recalcService.recalculateForRecruiter(recruiterId);
  }

  async close(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.info('Closed V3 reputation consumer RabbitMQ connection');
    } catch (error) {
      this.logger.error({ err: error }, 'Error closing reputation consumer RabbitMQ connection');
    }
  }
}
