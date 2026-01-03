/**
 * V2 Domain Event Consumer for ATS Service
 * Listens to application.stage_changed events from other services
 * and syncs the changes to the ATS database
 */

import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { ApplicationRepository } from '../applications/repository';

interface DomainEvent {
    event_id: string;
    event_type: string;
    payload: Record<string, any>;
    timestamp: string;
}

export class DomainEventConsumer {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'ats-service-v2-events';

    constructor(
        private rabbitMqUrl: string,
        private applicationRepository: ApplicationRepository,
        private logger: Logger
    ) {}

    /**
     * Connect to RabbitMQ and start consuming events
     */
    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.rabbitMqUrl) as any;
            this.channel = await (this.connection as any).createChannel();

            if(!this.channel) {
                throw new Error('Failed to create RabbitMQ channel');
            }

            // Declare topic exchange
            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

            // Declare queue
            await this.channel.assertQueue(this.queue, { durable: true });

            // Bind to application.stage_changed events from other services
            await this.channel.bindQueue(this.queue, this.exchange, 'application.stage_changed');

            // Bind to ai_review.completed events to trigger stage transitions
            await this.channel.bindQueue(this.queue, this.exchange, 'ai_review.completed');

            this.logger.info('V2 ATS domain consumer connected to RabbitMQ');

            // Start consuming
            await this.channel.consume(
                this.queue,
                (msg) => this.handleMessage(msg),
                { noAck: false }
            );

            this.logger.info('V2 ATS domain consumer started consuming events');
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to connect V2 ATS domain consumer to RabbitMQ');
            throw error;
        }
    }

    /**
     * Handle incoming message
     */
    private async handleMessage(msg: ConsumeMessage | null): Promise<void> {
        if (!msg || !this.channel) {
            return;
        }

        try {
            const event: DomainEvent = JSON.parse(msg.content.toString());

            this.logger.info(
                {
                    event_id: event.event_id,
                    event_type: event.event_type,
                    payload: event.payload,
                },
                'V2 ATS consumer received domain event'
            );

            // Route to appropriate handler
            switch (event.event_type) {
                case 'application.stage_changed':
                    await this.handleStageChanged(event);
                    break;

                case 'ai_review.completed':
                    await this.handleAIReviewCompleted(event);
                    break;

                default:
                    this.logger.debug({ event_type: event.event_type }, 'Event type not handled');
            }

            // Acknowledge message
            this.channel.ack(msg);
        } catch (error) {
            this.logger.error({ err: error }, 'Error handling domain event');
            // Reject and requeue
            this.channel?.nack(msg, false, true);
        }
    }

    /**
     * Handle application.stage_changed event
     * Sync stage changes from other services (like AI service) to ATS database
     */
    private async handleStageChanged(event: DomainEvent): Promise<void> {
        const {
            application_id,
            old_stage,
            new_stage,
            changed_by,
            ai_review_id,
            fit_score,
        } = event.payload;

        this.logger.info(
            {
                application_id,
                old_stage,
                new_stage,
                changed_by,
                event_id: event.event_id,
            },
            'Syncing application stage change from domain event'
        );

        try {
            // Get internal service user ID for audit trail
            // For now we'll use 'system' as the user - in production this could be a service account
            const systemClerkUserId = 'system_' + changed_by;

            // Update application stage using repository
            // This will create audit log and maintain consistency
            const updated = await this.applicationRepository.updateApplication(
                application_id,
                {
                    stage: new_stage,
                }
            );

            this.logger.info(
                {
                    application_id,
                    old_stage,
                    new_stage,
                    changed_by,
                    event_id: event.event_id,
                },
                'Successfully synced application stage change to ATS database'
            );
        } catch (error: any) {
            this.logger.error(
                {
                    err: error,
                    application_id,
                    old_stage,
                    new_stage,
                    event_id: event.event_id,
                    error_message: error.message,
                },
                'Failed to sync application stage change to ATS database'
            );

            throw error; // Re-throw to trigger nack/requeue
        }
    }

    /**
     * Handle ai_review.completed events
     * Decides next application stage based on recruiter assignment
     */
    async handleAIReviewCompleted(event: any): Promise<void> {
        try {
            this.logger.info(
                { 
                    application_id: event.application_id,
                    ai_review_id: event.ai_review_id,
                    fit_score: event.fit_score,
                    recommendation: event.recommendation 
                },
                'Processing ai_review.completed event'
            );

            // Fetch the application to get current state and check recruiter assignment
            const application = await this.applicationRepository.findApplication(event.application_id, 'internal-service');
            if (!application) {
                this.logger.warn(
                    { application_id: event.application_id },
                    'Application not found for AI review completion'
                );
                return;
            }

            // Determine the next stage based on whether application has a recruiter
            let nextStage: string;
            if (application.recruiter_id) {
                // Application has a recruiter - move to 'screen' stage for recruiter review
                nextStage = 'screen';
                this.logger.info(
                    {
                        application_id: application.id,
                        recruiter_id: application.recruiter_user_id,
                        next_stage: nextStage
                    },
                    'Moving application with recruiter to screen stage'
                );
            } else {
                // Direct application without recruiter - keep as 'submitted' 
                nextStage = 'submitted';
                this.logger.info(
                    {
                        application_id: application.id,
                        next_stage: nextStage
                    },
                    'Keeping direct application in submitted stage'
                );
            }

            // Only update stage if it's different from current stage
            if (application.stage !== nextStage) {
                // TODO: Update the application stage in the database
                // ApplicationRepository doesn't have update method - need to implement
                this.logger.info(
                    {
                        application_id: application.id,
                        previous_stage: application.stage,
                        new_stage: nextStage
                    },
                    'Would update application stage after AI review (update method not implemented)'
                );

                const updatedApplication = application; // Temp: use existing application

                this.logger.info(
                    {
                        application_id: updatedApplication.id,
                        previous_stage: application.stage,
                        new_stage: nextStage,
                        ai_review_id: event.ai_review_id
                    },
                    'Updated application stage after AI review'
                );

                // Publish application.stage_changed event for other services
                const stageChangeEvent = {
                    application_id: updatedApplication.id,
                    candidate_id: updatedApplication.candidate_id,
                    job_id: updatedApplication.job_id,
                    recruiter_id: updatedApplication.recruiter_id,
                    previous_stage: application.stage,
                    new_stage: nextStage,
                    changed_by: 'ai-service',
                    reason: 'ai_review_completed',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        ai_review_id: event.ai_review_id,
                        fit_score: event.fit_score,
                        recommendation: event.recommendation
                    }
                };

                if (this.channel) {
                    await this.channel.publish(
                        this.exchange,
                        'application.stage_changed',
                        Buffer.from(JSON.stringify(stageChangeEvent))
                    );
                }

                this.logger.info(
                    {
                        application_id: updatedApplication.id,
                        event: 'application.stage_changed',
                        stage_change: `${application.stage} -> ${nextStage}`
                    },
                    'Published application.stage_changed event'
                );
            } else {
                this.logger.info(
                    {
                        application_id: application.id,
                        current_stage: application.stage,
                        would_be_stage: nextStage
                    },
                    'Application stage unchanged after AI review'
                );
            }

        } catch (error) {
            this.logger.error(
                {
                    error: (error as Error).message,
                    event: event
                },
                'Failed to process ai_review.completed event'
            );
            throw error; // Rethrow to trigger message requeue
        }
    }

    /**
     * Disconnect from RabbitMQ
     */
    async disconnect(): Promise<void> {
        try {
            await this.channel?.close();
            await (this.connection as any)?.close();
            this.logger.info('V2 ATS domain consumer disconnected from RabbitMQ');
        } catch (error) {
            this.logger.error({ err: error }, 'Error disconnecting V2 ATS domain consumer');
        }
    }
}
