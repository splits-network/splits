import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { AIReviewServiceV2 } from './v2/reviews/service';

/**
 * Domain Event Consumer for AI Service
 * 
 * Listens for application.stage_changed events and triggers AI reviews
 * when applications transition to the 'ai_review' stage.
 */
export class DomainEventConsumer {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'ai-service-queue';

    constructor(
        private rabbitMqUrl: string,
        private aiReviewService: AIReviewServiceV2,
        private logger: Logger
    ) {}

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.rabbitMqUrl) as any;
            this.channel = await (this.connection as any).createChannel();

            if (!this.channel) throw new Error('Failed to create channel');

            // Assert exchange exists
            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
            
            // Create durable queue for AI service
            await this.channel.assertQueue(this.queue, { durable: true });

            // Bind to events we care about
            // Listen for application stage changes (specifically when stage becomes 'ai_review')
            await this.channel.bindQueue(this.queue, this.exchange, 'application.stage_changed');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.created');

            this.logger.info({
                exchange: this.exchange,
                queue: this.queue,
                bindings: ['application.stage_changed', 'application.created']
            }, 'AI service connected to RabbitMQ and bound to events');

            await this.startConsuming();
        } catch (error) {
            this.logger.error({ error }, 'Failed to connect to RabbitMQ');
            throw error;
        }
    }

    private async startConsuming(): Promise<void> {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }

        await this.channel.consume(
            this.queue,
            async (msg: ConsumeMessage | null) => {
                if (!msg) {
                    return;
                }

                try {
                    const event: DomainEvent = JSON.parse(msg.content.toString());
                    
                    this.logger.info({
                        event_type: event.event_type,
                        event_id: event.event_id,
                        payload_summary: {
                            application_id: event.payload.application_id,
                            stage: event.payload.stage || event.payload.new_stage,
                        }
                    }, 'Received event');

                    await this.handleEvent(event);
                    
                    // Acknowledge message after successful processing
                    this.channel?.ack(msg);
                    
                    this.logger.info({
                        event_type: event.event_type,
                        event_id: event.event_id
                    }, 'Event processed successfully');
                    
                } catch (error) {
                    this.logger.error({
                        error,
                        message: msg.content.toString()
                    }, 'Error processing event');
                    
                    // Negative acknowledge - requeue the message
                    this.channel?.nack(msg, false, true);
                }
            },
            { noAck: false }
        );

        this.logger.info('Started consuming events from queue');
    }

    private async handleEvent(event: DomainEvent): Promise<void> {
        switch (event.event_type) {
            case 'application.created':
                await this.handleApplicationCreated(event);
                break;
            case 'application.stage_changed':
                await this.handleApplicationStageChanged(event);
                break;
            default:
                this.logger.debug({ event_type: event.event_type }, 'Unhandled event type');
        }
    }

    /**
     * Handle application.created events
     * Trigger AI review if application is created with stage='ai_review'
     */
    private async handleApplicationCreated(event: DomainEvent): Promise<void> {
        const { application_id, stage, candidate_id, job_id } = event.payload;

        // Only process if created directly in ai_review stage
        if (stage !== 'ai_review') {
            this.logger.debug({
                application_id,
                stage
            }, 'Application not in ai_review stage, skipping');
            return;
        }

        this.logger.info({
            application_id,
            candidate_id,
            job_id,
            stage
        }, 'New application created in ai_review stage, triggering AI review');

        try {
            // Enrich minimal data by fetching full application details from ATS
            const enrichedInput = await this.aiReviewService.enrichApplicationData({
                application_id,
                candidate_id,
                job_id,
            });

            await this.aiReviewService.createReview(enrichedInput);

            this.logger.info({
                application_id
            }, 'AI review triggered successfully for new application');
        } catch (error) {
            this.logger.error({
                error,
                application_id,
                candidate_id,
                job_id
            }, 'Failed to trigger AI review for new application');
            throw error;
        }
    }

    /**
     * Handle application.stage_changed events
     * Trigger AI review when application transitions TO ai_review stage
     */
    private async handleApplicationStageChanged(event: DomainEvent): Promise<void> {
        const { application_id, old_stage, new_stage, candidate_id, job_id } = event.payload;

        // Only process when transitioning TO ai_review
        if (new_stage !== 'ai_review') {
            this.logger.debug({
                application_id,
                old_stage,
                new_stage
            }, 'Not transitioning to ai_review, skipping');
            return;
        }

        this.logger.info({
            application_id,
            candidate_id,
            job_id,
            old_stage,
            new_stage
        }, 'Application transitioned to ai_review stage, triggering AI review');

        try {
            // Enrich minimal data by fetching full application details from ATS
            const enrichedInput = await this.aiReviewService.enrichApplicationData({
                application_id,
                candidate_id,
                job_id,
            });

            // Trigger AI review with enriched data
            await this.aiReviewService.createReview(enrichedInput);

            this.logger.info({
                application_id,
                transition: `${old_stage} → ${new_stage}`
            }, 'AI review triggered successfully for stage transition');
        } catch (error) {
            this.logger.error({
                error,
                application_id,
                candidate_id,
                job_id,
                old_stage,
                new_stage
            }, 'Failed to trigger AI review for stage transition');
            throw error;
        }
    }

    async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await (this.connection as any).close();
            }
            this.logger.info('AI service domain consumer closed');
        } catch (error) {
            this.logger.error({ error }, 'Error closing domain consumer');
        }
    }
}
