/**
 * Event Publisher for Identity Service - V2
 */

import * as amqp from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { randomUUID } from 'crypto';

export class EventPublisherV2 {
    private connection: amqp.ChannelModel | null = null;
    private channel: amqp.Channel | null = null;
    private readonly exchange = 'splits-network-events';

    constructor(
        private rabbitMqUrl: string,
        private logger: Logger,
        private sourceService = 'identity-service'
    ) {}

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.rabbitMqUrl);
            if (!this.connection) {
                throw new Error('Failed to establish RabbitMQ connection');
            }
            this.channel = await this.connection.createChannel();
            if (!this.channel) throw new Error('Failed to create channel');
            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
            this.logger.info('Connected to RabbitMQ for event publishing');
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to connect to RabbitMQ');
            throw error;
        }
    }

    isConnected(): boolean {
        return this.channel !== null;
    }

    async publish(eventType: string, payload: Record<string, any>, sourceService?: string): Promise<void> {
        if (!this.channel) {
            this.logger.error(
                { event_type: eventType, payload },
                '? CRITICAL: RabbitMQ not connected - event will NOT be published!'
            );
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

        this.channel.publish(
            this.exchange,
            routingKey,
            Buffer.from(JSON.stringify(event)),
            { persistent: true }
        );

        this.logger.info({ event_type: eventType, event_id: event.event_id }, 'Event published');
    }

    async close(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
        }
        if (this.connection) {
            await this.connection.close();
        }
    }
}
