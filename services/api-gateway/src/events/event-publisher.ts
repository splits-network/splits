import * as amqp from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { randomUUID } from 'crypto';

export class EventPublisher {
    private connection: amqp.ChannelModel | null = null;
    private channel: amqp.Channel | null = null;
    private readonly exchange = 'splits-network-events';

    constructor(
        private rabbitMqUrl: string,
        private logger: Logger,
        private sourceService = 'api-gateway'
    ) {}

    async connect(): Promise<void> {
        this.connection = await amqp.connect(this.rabbitMqUrl);
        if (!this.connection) {
            throw new Error('Failed to connect to RabbitMQ');
        }
        this.channel = await this.connection.createChannel();
        if (!this.channel) {
            throw new Error('Failed to create RabbitMQ channel');
        }
        await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
        this.logger.info('Connected to RabbitMQ for event publishing');
    }

    isConnected(): boolean {
        return !!this.channel;
    }

    async publish(eventType: string, payload: Record<string, any>): Promise<void> {
        if (!this.channel) {
            this.logger.error({ eventType }, 'Cannot publish event - channel not initialized');
            throw new Error('Event publisher not connected');
        }

        const event: DomainEvent = {
            event_id: randomUUID(),
            event_type: eventType,
            timestamp: new Date().toISOString(),
            source_service: this.sourceService,
            payload,
        };

        this.channel.publish(
            this.exchange,
            eventType,
            Buffer.from(JSON.stringify(event)),
            { persistent: true }
        );

        this.logger.info({ eventType, eventId: event.event_id }, 'Status contact event published');
    }

    async close(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
            this.channel = null;
        }
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }
}
