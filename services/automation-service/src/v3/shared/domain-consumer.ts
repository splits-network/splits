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
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isClosing = false;
  private connectionHealthy = false;

  constructor(private config: DomainConsumerConfig) {
    this.logger = config.logger;
    this.executionRunner = new ExecutionRunner(config.supabase, config.eventPublisher, config.logger);
    this.fraudRunner = new FraudRunner(config.supabase, config.eventPublisher, config.logger);
  }

  async connect(): Promise<void> {
    if (this.isConnecting) {
      this.logger.debug('Automation consumer connection attempt already in progress, skipping');
      return;
    }

    this.isConnecting = true;

    try {
      this.connection = await amqp.connect(this.config.rabbitMqUrl, {
        heartbeat: 30,
      });
      if (!this.connection) throw new Error('Failed to establish RabbitMQ connection');

      this.connection.on('error', (err) => {
        this.logger.error({ err }, 'Automation consumer RabbitMQ connection error');
        this.connectionHealthy = false;
        this.scheduleReconnect();
      });

      this.connection.on('close', () => {
        this.logger.warn('Automation consumer RabbitMQ connection closed');
        this.connectionHealthy = false;
        if (!this.isClosing) this.scheduleReconnect();
      });

      this.channel = await this.connection.createChannel();
      if (!this.channel) throw new Error('Failed to create channel');

      this.channel.on('error', (err) => {
        this.logger.error({ err }, 'Automation consumer RabbitMQ channel error');
        this.connectionHealthy = false;
        if (!this.isClosing) this.scheduleReconnect();
      });

      this.channel.on('close', () => {
        this.logger.warn('Automation consumer RabbitMQ channel closed');
        this.connectionHealthy = false;
        if (!this.isClosing) this.scheduleReconnect();
      });

      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      await this.channel.assertQueue(this.queue, { durable: true });

      for (const event of SUBSCRIBED_EVENTS) {
        await this.channel.bindQueue(this.queue, this.exchange, event);
      }

      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.connectionHealthy = true;

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
    } catch (error) {
      this.isConnecting = false;
      this.connectionHealthy = false;
      this.logger.error({ err: error }, 'Failed to connect automation consumer to RabbitMQ');

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
      this.logger.error('Automation consumer max reconnection attempts reached, giving up');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    this.logger.info({ attempt: this.reconnectAttempts, delay }, 'Scheduling automation consumer reconnection');

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null;
      await this.cleanup();
      try {
        await this.connect();
      } catch (error) {
        this.logger.error({ err: error }, 'Automation consumer reconnection attempt failed');
      }
    }, delay);
  }

  private async cleanup(): Promise<void> {
    this.connectionHealthy = false;
    try { if (this.channel) await this.channel.close(); } catch (_) { }
    try { if (this.connection) await this.connection.close(); } catch (_) { }
    this.connection = null;
    this.channel = null;
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null && this.connectionHealthy;
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
    this.isClosing = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    await this.cleanup();
    this.logger.info('Closed V3 domain consumer RabbitMQ connection');
  }
}
