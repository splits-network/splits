/**
 * V3 Domain Event Consumer
 *
 * Connects to RabbitMQ, binds all notification-relevant event types,
 * and routes incoming messages to the appropriate domain consumer.
 *
 * Improvements over V2:
 *   - Event bindings extracted to a declarative registry (event-bindings.ts)
 *   - Event routing extracted to event-router.ts (no giant switch in this file)
 *   - Consumer instantiation extracted to consumer-factory.ts
 *   - Exponential backoff reconnection with jitter
 */

import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { NotificationService as EmailNotificationService } from '../../service';
import { NotificationRepository } from '../../repository';
import { EVENT_BINDINGS } from './event-bindings';
import { routeEvent, DomainConsumers } from './event-router';
import { createDomainConsumers } from './consumer-factory';

export class V3DomainEventConsumer {
    public connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'notification-service-v3-queue';
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 10;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isConnecting = false;
    private isClosing = false;
    private connectionHealthy = false;
    private consumers: DomainConsumers;

    constructor(
        private rabbitMqUrl: string,
        notificationService: EmailNotificationService,
        repository: NotificationRepository,
        private logger: Logger,
        portalUrl: string,
        candidateWebsiteUrl: string,
    ) {
        this.consumers = createDomainConsumers({
            notificationService,
            repository,
            logger,
            portalUrl,
            candidateWebsiteUrl,
        });
    }

    async connect(): Promise<void> {
        if (this.isConnecting) {
            this.logger.debug('Connection attempt already in progress, skipping');
            return;
        }

        this.isConnecting = true;

        try {
            this.logger.info('Attempting to connect to RabbitMQ (V3 consumer)');

            this.connection = await amqp.connect(this.rabbitMqUrl) as any;
            this.channel = await (this.connection as any).createChannel();

            if (!this.channel) throw new Error('Failed to create channel');

            this.setupConnectionListeners();
            await this.setupExchangeAndQueue();
            await this.bindAllEvents();
            await this.startConsuming();

            this.connectionHealthy = true;
            this.reconnectAttempts = 0;
            this.isConnecting = false;

            this.logger.info(
                { bindingCount: EVENT_BINDINGS.length },
                'V3 consumer connected and bound to all events',
            );
        } catch (error) {
            this.isConnecting = false;
            this.logger.error(
                { err: error, attempt: this.reconnectAttempts + 1 },
                'Failed to connect V3 consumer to RabbitMQ',
            );

            if (!this.isClosing) {
                this.scheduleReconnect();
            } else {
                throw error;
            }
        }
    }

    private setupConnectionListeners(): void {
        this.connection?.on('error', (err) => {
            this.logger.error({ err }, 'RabbitMQ connection error (V3)');
            this.connectionHealthy = false;
            this.scheduleReconnect();
        });

        this.connection?.on('close', () => {
            this.logger.warn('RabbitMQ connection closed (V3)');
            this.connectionHealthy = false;
            if (!this.isClosing) this.scheduleReconnect();
        });

        this.channel!.on('error', (err) => {
            this.logger.error({ err }, 'RabbitMQ channel error (V3)');
            this.connectionHealthy = false;
        });

        this.channel!.on('close', () => {
            this.logger.warn('RabbitMQ channel closed (V3)');
            this.connectionHealthy = false;
        });
    }

    private async setupExchangeAndQueue(): Promise<void> {
        await this.channel!.assertExchange(this.exchange, 'topic', { durable: true });
        await this.channel!.assertQueue(this.queue, { durable: true });
    }

    private async bindAllEvents(): Promise<void> {
        for (const routingKey of EVENT_BINDINGS) {
            await this.channel!.bindQueue(this.queue, this.exchange, routingKey);
        }
    }

    private async startConsuming(): Promise<void> {
        if (!this.channel) throw new Error('Channel not initialized');

        await this.channel.consume(
            this.queue,
            async (msg: ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const event: DomainEvent = JSON.parse(msg.content.toString());
                    this.logger.info({ event_type: event.event_type }, 'V3 processing event');

                    await routeEvent(event, this.consumers, this.logger);

                    this.channel!.ack(msg);
                } catch (error) {
                    this.logger.error({ err: error }, 'Error processing message (V3)');
                    this.channel!.nack(msg, false, false);
                }
            },
            { noAck: false },
        );

        this.logger.info('V3 consumer started consuming events');
    }

    private scheduleReconnect(): void {
        if (this.isClosing || this.reconnectTimeout) return;

        this.reconnectAttempts++;

        if (this.reconnectAttempts > this.maxReconnectAttempts) {
            this.logger.error(
                { attempts: this.reconnectAttempts, maxAttempts: this.maxReconnectAttempts },
                'Max reconnection attempts reached (V3), giving up',
            );
            return;
        }

        // Exponential backoff with jitter, max 30 seconds
        const baseDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
        const jitter = Math.floor(Math.random() * 1000);
        const delay = baseDelay + jitter;

        this.logger.info({ attempt: this.reconnectAttempts, delay }, 'Scheduling V3 reconnection');

        this.reconnectTimeout = setTimeout(async () => {
            this.reconnectTimeout = null;
            await this.cleanup();

            try {
                await this.connect();
            } catch (error) {
                this.logger.error({ err: error }, 'V3 reconnection attempt failed');
            }
        }, delay);
    }

    private async cleanup(): Promise<void> {
        try {
            if (this.channel) await this.channel.close();
        } catch (error) {
            this.logger.debug({ err: error }, 'Error closing channel during V3 cleanup');
        }

        this.connection = null;
        this.channel = null;
    }

    isConnected(): boolean {
        return this.connection !== null && this.channel !== null && this.connectionHealthy;
    }

    async close(): Promise<void> {
        this.isClosing = true;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        await this.cleanup();
        this.logger.info('V3 domain event consumer disconnected');
    }
}
