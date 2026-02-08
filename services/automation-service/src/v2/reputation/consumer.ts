/**
 * Reputation Event Consumer
 *
 * Listens for domain events that should trigger reputation recalculation:
 * - placement.completed
 * - placement.failed
 * - application.stage_changed (to 'hired')
 */

import * as amqp from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { ReputationService } from './service';

export class ReputationEventConsumer {
    private connection: amqp.ChannelModel | null = null;
    private channel: amqp.Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'automation-service-reputation-queue';

    constructor(
        private rabbitMqUrl: string,
        private reputationService: ReputationService,
        private logger: Logger
    ) {}

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.rabbitMqUrl);
            if (!this.connection) {
                throw new Error('Failed to establish RabbitMQ connection');
            }

            this.channel = await this.connection.createChannel();
            if (!this.channel) throw new Error('Failed to create channel');

            // Assert exchange and queue
            await this.channel.assertExchange(this.exchange, 'topic', {
                durable: true,
            });
            await this.channel.assertQueue(this.queue, { durable: true });

            // Bind to events that trigger reputation recalculation
            await this.channel.bindQueue(
                this.queue,
                this.exchange,
                'placement.completed'
            );
            await this.channel.bindQueue(
                this.queue,
                this.exchange,
                'placement.failed'
            );
            await this.channel.bindQueue(
                this.queue,
                this.exchange,
                'application.stage_changed'
            );

            this.logger.info(
                'Reputation consumer connected to RabbitMQ, listening for events'
            );

            // Start consuming events
            await this.channel.consume(this.queue, async (msg) => {
                if (msg) {
                    try {
                        const event: DomainEvent = JSON.parse(
                            msg.content.toString()
                        );
                        await this.handleEvent(event);
                        this.channel!.ack(msg);
                    } catch (error) {
                        this.logger.error(
                            { err: error },
                            'Failed to process reputation event'
                        );
                        // Don't requeue on error to avoid infinite loops
                        this.channel!.nack(msg, false, false);
                    }
                }
            });

            this.logger.info('Started consuming reputation-related events');
        } catch (error) {
            this.logger.error(
                { err: error },
                'Failed to connect reputation consumer to RabbitMQ'
            );
            throw error;
        }
    }

    private async handleEvent(event: DomainEvent): Promise<void> {
        this.logger.info(
            { event_type: event.event_type, event_id: event.event_id },
            'Processing reputation event'
        );

        switch (event.event_type) {
            case 'placement.completed':
            case 'placement.failed':
                await this.handlePlacementEvent(event);
                break;

            case 'application.stage_changed':
                await this.handleStageChangeEvent(event);
                break;

            default:
                this.logger.debug(
                    { event_type: event.event_type },
                    'Unhandled event type for reputation'
                );
        }
    }

    private async handlePlacementEvent(event: DomainEvent): Promise<void> {
        const placementId = event.payload?.placement_id;

        if (!placementId) {
            this.logger.warn(
                { event_type: event.event_type },
                'Placement event missing placement_id'
            );
            return;
        }

        await this.reputationService.handlePlacementEvent(placementId);
    }

    private async handleStageChangeEvent(event: DomainEvent): Promise<void> {
        const newStage = event.payload?.new_stage || event.payload?.stage;

        // Only recalculate on hire
        if (newStage !== 'hired') {
            return;
        }

        const recruiterId =
            event.payload?.candidate_recruiter_id ||
            event.payload?.recruiter_id;

        if (!recruiterId) {
            this.logger.warn(
                'Stage change to hired but no recruiter_id in payload'
            );
            return;
        }

        await this.reputationService.handleHireEvent(recruiterId);
    }

    async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.logger.info('Closed reputation consumer RabbitMQ connection');
        } catch (error) {
            this.logger.error(
                { err: error },
                'Error closing reputation consumer RabbitMQ connection'
            );
        }
    }
}
