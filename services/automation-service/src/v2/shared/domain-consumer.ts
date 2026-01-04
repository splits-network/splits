/**
 * Domain Event Consumer - V2
 * Listens for domain events and triggers automated workflows
 */

import * as amqp from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';

export class DomainEventConsumer {
    private connection: amqp.ChannelModel | null = null;
    private channel: amqp.Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'automation-service-v2-queue';

    constructor(
        private rabbitMqUrl: string,
        private aiServiceUrl: string,
        private logger: Logger
    ) {
    }

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.rabbitMqUrl);
            if (!this.connection) {
                throw new Error('Failed to establish RabbitMQ connection');
            }

            this.channel = await this.connection.createChannel();
            if (!this.channel) throw new Error('Failed to create channel');

            // Assert exchange and queue
            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
            await this.channel.assertQueue(this.queue, { durable: true });

            // Bind to application events that trigger automation
            await this.channel.bindQueue(this.queue, this.exchange, 'application.created');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.stage_changed');

            this.logger.info('V2 domain consumer connected to RabbitMQ');

            // Start consuming events
            await this.channel.consume(this.queue, async (msg) => {
                if (msg) {
                    try {
                        const event: DomainEvent = JSON.parse(msg.content.toString());
                        await this.handleEvent(event);
                        this.channel!.ack(msg);
                    } catch (error) {
                        this.logger.error({ err: error }, 'Failed to process event');
                        this.channel!.nack(msg, false, false); // Don't requeue on error
                    }
                }
            });

            this.logger.info('Started consuming domain events');
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to connect to RabbitMQ');
            throw error;
        }
    }

    private async handleEvent(event: DomainEvent): Promise<void> {
        this.logger.info({ event_type: event.event_type, event_id: event.event_id }, 'Processing automation event');

        switch (event.event_type) {
            // AI review triggering removed - AI service now listens directly for application events
            // This service is reserved for complex automation workflows that require orchestration
            
            default:
                this.logger.debug({ event_type: event.event_type }, 'Unhandled event type');
        }
    }

    async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.logger.info('Closed RabbitMQ connection');
        } catch (error) {
            this.logger.error({ err: error }, 'Error closing RabbitMQ connection');
        }
    }
}
