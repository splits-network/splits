import { createLogger } from '@splits-network/shared-logging';

const logger = createLogger('EventPublisher');

export interface EventPayload {
    eventType: string;
    data: Record<string, any>;
    timestamp: Date;
    userId?: string;
}

/**
 * Event publisher for analytics service
 * Minimal events - analytics is primarily a consumer
 */
export class EventPublisher {
    constructor(private rabbitMqUrl: string) { }

    async publish(eventType: string, data: Record<string, any>): Promise<void> {
        const event: EventPayload = {
            eventType,
            data,
            timestamp: new Date(),
        };

        // TODO: Implement RabbitMQ publishing when needed
        // For now, just log (analytics rarely publishes events)
        logger.info({ event }, 'Analytics event (not published)');
    }

    async close(): Promise<void> {
        // TODO: Close RabbitMQ connection when implemented
    }
}
