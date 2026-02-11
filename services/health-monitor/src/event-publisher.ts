import * as amqp from "amqplib";
import { Logger } from "@splits-network/shared-logging";
import { DomainEvent } from "@splits-network/shared-types";
import { randomUUID } from "crypto";

export class EventPublisher {
    connection: amqp.ChannelModel | null = null;
    channel: amqp.Channel | null = null;
    private readonly exchange = "splits-network-events";

    constructor(
        private rabbitMqUrl: string,
        private logger: Logger,
        private sourceService = "health-monitor",
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
        } catch (error) {
            this.logger.error({ err: error }, "Failed to connect to RabbitMQ");
            throw error;
        }
    }

    isConnected(): boolean {
        return this.channel !== null;
    }

    async publish(
        eventType: string,
        payload: Record<string, any>,
    ): Promise<void> {
        if (!this.channel) {
            this.logger.error(
                { event_type: eventType },
                "RabbitMQ not connected - event not published",
            );
            return;
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
            { persistent: true },
        );

        this.logger.info(
            { event_type: eventType, event_id: event.event_id },
            "Event published",
        );
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
