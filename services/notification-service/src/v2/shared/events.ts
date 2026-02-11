/**
 * Event Publisher for Notification Service - V2
 * Mirrors the v1 API but uses new internal structure.
 */

import * as amqp from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { randomUUID } from 'crypto';

export class EventPublisher {
    public connection: amqp.ChannelModel | null = null;
    private channel: amqp.Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 10;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isConnecting = false;
    private isClosing = false;
    private connectionHealthy = false;

    constructor(
        private rabbitMqUrl: string,
        private logger: Logger,
        private sourceService = 'notification-service'
    ) { }

    async connect(): Promise<void> {
        if (this.isConnecting) {
            this.logger.debug('Event publisher connection attempt already in progress, skipping');
            return;
        }

        this.isConnecting = true;

        try {
            this.logger.info('Attempting to connect event publisher to RabbitMQ');

            this.connection = await amqp.connect(this.rabbitMqUrl);
            if (!this.connection) {
                throw new Error('Failed to establish RabbitMQ connection');
            }

            // Setup connection event listeners
            this.connection.on('error', (err) => {
                this.logger.error({ err }, 'RabbitMQ event publisher connection error');
                this.connectionHealthy = false;
                this.scheduleReconnect();
            });

            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ event publisher connection closed');
                this.connectionHealthy = false;
                if (!this.isClosing) {
                    this.scheduleReconnect();
                }
            });

            this.channel = await this.connection.createChannel();
            if (!this.channel) throw new Error('Failed to create channel');

            // Setup channel event listeners
            this.channel.on('error', (err) => {
                this.logger.error({ err }, 'RabbitMQ event publisher channel error');
                this.connectionHealthy = false;
            });

            this.channel.on('close', () => {
                this.logger.warn('RabbitMQ event publisher channel closed');
                this.connectionHealthy = false;
            });

            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

            // Reset reconnect attempts on successful connection
            this.reconnectAttempts = 0;
            this.isConnecting = false;
            this.connectionHealthy = true;

            this.logger.info('Event publisher successfully connected to RabbitMQ');

        } catch (error) {
            this.isConnecting = false;
            this.connectionHealthy = false;
            this.logger.error({ err: error }, 'Failed to connect event publisher to RabbitMQ');

            if (!this.isClosing) {
                this.scheduleReconnect();
            } else {
                throw error;
            }
        }
    }

    private scheduleReconnect(): void {
        if (this.isClosing || this.reconnectTimeout) {
            return;
        }

        this.reconnectAttempts++;

        if (this.reconnectAttempts > this.maxReconnectAttempts) {
            this.logger.error('Event publisher max reconnection attempts reached, giving up');
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000); // Exponential backoff, max 30s

        this.reconnectTimeout = setTimeout(async () => {
            this.reconnectTimeout = null;

            // Clean up existing connections
            await this.cleanup();

            try {
                await this.connect();
            } catch (error) {
                this.logger.error({ err: error }, 'Event publisher reconnection attempt failed');
            }
        }, delay);
    }

    private async cleanup(): Promise<void> {
        this.connectionHealthy = false;

        try {
            if (this.channel) {
                await this.channel.close();
            }
        } catch (error) {
            this.logger.debug({ err: error }, 'Error closing event publisher channel during cleanup');
        }

        try {
            if (this.connection) {
                await this.connection.close();
            }
        } catch (error) {
            this.logger.debug({ err: error }, 'Error closing event publisher connection during cleanup');
        }

        this.connection = null;
        this.channel = null;
    }

    isConnected(): boolean {
        return this.connection !== null &&
            this.channel !== null &&
            this.connectionHealthy;
    }

    async publish(eventType: string, payload: Record<string, any>, sourceService?: string): Promise<void> {
        if (!this.isConnected()) {
            this.logger.error(
                { event_type: eventType, payload },
                '❌ CRITICAL: RabbitMQ event publisher not connected - event will NOT be published!'
            );

            // Attempt reconnection if not already in progress
            if (!this.isConnecting && !this.isClosing) {
                this.logger.info('Attempting to reconnect event publisher for failed publish');
                try {
                    await this.connect();
                    // Retry publish if reconnection successful
                    if (this.isConnected()) {
                        await this.publish(eventType, payload, sourceService);
                        return;
                    }
                } catch (error) {
                    this.logger.error({ err: error }, 'Failed to reconnect event publisher for publish retry');
                }
            }
            return;
        }

        const event: DomainEvent = {
            event_id: randomUUID(),
            event_type: eventType,
            timestamp: new Date().toISOString(),
            source_service: sourceService || this.sourceService,
            payload,
        };

        const routingKey = eventType;

        try {
            this.channel!.publish(
                this.exchange,
                routingKey,
                Buffer.from(JSON.stringify(event)),
                { persistent: true }
            );
        } catch (error) {
            this.logger.error(
                { err: error, event_type: eventType, event_id: event.event_id },
                'Failed to publish event'
            );
            throw error;
        }
    }

    async close(): Promise<void> {
        this.isClosing = true;

        // Clear any pending reconnect attempts
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        await this.cleanup();
        this.logger.info('Event publisher disconnected from RabbitMQ');
    }
}
