/**
 * V3 Domain Event Consumer
 *
 * Subscribes to domain events via RabbitMQ and routes them
 * to rule evaluation and fraud analysis pipelines.
 */

import * as amqp from 'amqplib';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { IEventPublisher } from '../../v2/shared/events';
import { ExecutionRunner } from './execution-runner';
import { FraudRunner } from './fraud-runner';

interface DomainConsumerConfig {
  rabbitMqUrl: string;
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  logger: Logger;
}

const SUBSCRIBED_EVENTS = [
  'application.created',
  'application.stage_changed',
  'application.expired',
  'placement.created',
  'placement.status_changed',
] as const;

export class DomainEventConsumer {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly exchange = 'splits-network-events';
  private readonly queue = 'automation-service-v3-queue';
  private executionRunner: ExecutionRunner;
  private fraudRunner: FraudRunner;
  private logger: Logger;

  constructor(private config: DomainConsumerConfig) {
    this.logger = config.logger;
    this.executionRunner = new ExecutionRunner(config.supabase, config.eventPublisher, config.logger);
    this.fraudRunner = new FraudRunner(config.supabase, config.eventPublisher, config.logger);
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

    this.logger.info('V3 domain consumer connected to RabbitMQ');

    await this.channel.consume(this.queue, async (msg) => {
      if (!msg) return;
      try {
        const event: DomainEvent = JSON.parse(msg.content.toString());
        await this.handleEvent(event);
        this.channel!.ack(msg);
      } catch (error) {
        this.logger.error({ err: error }, 'Failed to process event');
        this.channel!.nack(msg, false, false);
      }
    });

    this.logger.info('Started consuming domain events for V3 rule evaluation');
  }

  private async handleEvent(event: DomainEvent): Promise<void> {
    this.logger.info(
      { event_type: event.event_type, event_id: event.event_id },
      'Processing automation event',
    );

    await Promise.all([
      this.executionRunner.evaluateRulesForEvent(event),
      this.fraudRunner.runFraudDetection(event),
    ]);
  }

  async close(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.info('Closed V3 domain consumer RabbitMQ connection');
    } catch (error) {
      this.logger.error({ err: error }, 'Error closing RabbitMQ connection');
    }
  }
}
