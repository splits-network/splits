/**
 * Event Publisher (V2)
 * Publishes domain events to RabbitMQ for cross-service communication.
 */

import amqp from "amqplib";
import { Logger } from "@splits-network/shared-logging";
import { randomUUID } from "crypto";

export interface DomainEvent {
    event_id: string;
    event_type: string;
    timestamp: string;
    source_service: string;
    payload: Record<string, any>;
}

export interface IEventPublisher {
    publish(
        eventType: string,
        payload: Record<string, any>,
        sourceService?: string,
    ): Promise<void>;
}

export class EventPublisher implements IEventPublisher {
    private connection: amqp.ChannelModel | null = null;
    private channel: amqp.Channel | null = null;
    private readonly exchange = "splits-network-events";

    constructor(
        private rabbitMqUrl: string,
        private logger: Logger,
        private sourceService = "content-service",
    ) {}

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.rabbitMqUrl);
            if (!this.connection) {
                throw new Error("Failed to establish RabbitMQ connection");
            }
            this.channel = await this.connection.createChannel();
            if (!this.channel) throw new Error("Failed to create channel");
            await this.channel.assertExchange(this.exchange, "topic", {
                durable: true,
            });
            this.logger.info("Connected to RabbitMQ for event publishing");
        } catch (error: any) {
            this.logger.error({ err: error }, "Failed to connect to RabbitMQ");
            throw error;
        }
    }

    async publish(
        eventType: string,
        payload: Record<string, any>,
    ): Promise<void> {
        if (!this.channel) {
            this.logger.error(
                { event_type: eventType, payload },
                "RabbitMQ not connected - event will NOT be published",
            );
            return;
        }

        try {
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
                { persistent: true },
            );

            this.logger.info(
                { event_type: eventType, event_id: event.event_id },
                "Event published",
            );
        } catch (error: any) {
            this.logger.error(
                { err: error, event_type: eventType, payload },
                "Failed to publish event",
            );

            if (error && error.message?.includes("Channel closed")) {
                this.channel = null;
                this.connection = null;
            }

            throw error;
        }
    }

    async ensureConnection(): Promise<void> {
        if (!this.channel || !this.connection) {
            this.logger.info(
                "RabbitMQ connection lost, attempting to reconnect...",
            );
            await this.connect();
        }
    }

    async close(): Promise<void> {
        if (this.channel) await this.channel.close();
        if (this.connection) await this.connection.close();
    }
}
