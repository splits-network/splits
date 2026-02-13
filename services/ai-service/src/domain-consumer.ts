import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { AIReviewServiceV2 } from './v2/reviews/service';
import { ResumeExtractionService } from './v2/resume-extraction/service';
import { ResumeExtractionRepository } from './v2/resume-extraction/repository';
import { EventPublisher } from './v2/shared/events';

/**
 * Domain Event Consumer for AI Service
 *
 * Listens for:
 * - application.stage_changed / application.created → triggers AI reviews
 * - document.processed → triggers structured resume metadata extraction
 */
export class DomainEventConsumer {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'ai-service-queue';

    constructor(
        private rabbitMqUrl: string,
        private aiReviewService: AIReviewServiceV2,
        private resumeExtractionService: ResumeExtractionService,
        private resumeExtractionRepository: ResumeExtractionRepository,
        private eventPublisher: EventPublisher | undefined,
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
            // Listen for processed documents to extract structured resume metadata
            await this.channel.bindQueue(this.queue, this.exchange, 'document.processed');

            this.logger.info({
                exchange: this.exchange,
                queue: this.queue,
                bindings: ['application.stage_changed', 'application.created', 'document.processed']
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
                            document_id: event.payload.document_id,
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
                    const errorDetails = error instanceof Error 
                        ? { message: error.message, stack: error.stack }
                        : { error: String(error) };
                    
                    this.logger.error({
                        ...errorDetails,
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
            case 'document.processed':
                await this.handleDocumentProcessed(event);
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
        // Support both old_stage (standard) and previous_stage (ATS domain consumer publishes with this)
        const { application_id, new_stage, candidate_id, job_id } = event.payload;
        const old_stage = event.payload.old_stage || event.payload.previous_stage;

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

    /**
     * Handle document.processed events
     * Extract structured metadata from resume documents using AI
     */
    private async handleDocumentProcessed(event: DomainEvent): Promise<void> {
        const { document_id, entity_type, entity_id, processing_status } = event.payload;

        // Only process successfully processed documents
        if (processing_status !== 'processed') {
            this.logger.debug({ document_id, processing_status }, 'Document not successfully processed, skipping extraction');
            return;
        }

        try {
            // Fetch document to check type and get extracted text
            const document = await this.resumeExtractionRepository.getDocument(document_id);
            if (!document) {
                this.logger.warn({ document_id }, 'Document not found for structured extraction');
                return;
            }

            // Only extract from resume documents attached to candidates
            if (document.document_type !== 'resume' || document.entity_type !== 'candidate') {
                this.logger.debug(
                    { document_id, document_type: document.document_type, entity_type: document.entity_type },
                    'Not a candidate resume, skipping structured extraction'
                );
                return;
            }

            const extractedText = document.metadata?.extracted_text;
            if (!extractedText || typeof extractedText !== 'string' || extractedText.length < 50) {
                this.logger.warn({ document_id, text_length: extractedText?.length }, 'Insufficient extracted text for structured extraction');
                return;
            }

            // Check if structured data already exists (avoid re-processing)
            if (document.metadata?.structured_data) {
                this.logger.debug({ document_id }, 'Structured data already exists, skipping');
                return;
            }

            this.logger.info({ document_id, entity_id, text_length: extractedText.length }, 'Starting structured resume extraction');

            // Extract structured metadata using AI
            const structuredData = await this.resumeExtractionService.extractStructuredData(extractedText, document_id);

            // Write structured data to document metadata
            await this.resumeExtractionRepository.writeStructuredData(document_id, structuredData);

            // Publish event for downstream consumers (ats-service will sync to candidate if primary)
            if (this.eventPublisher) {
                await this.eventPublisher.publish('resume.metadata.extracted', {
                    document_id,
                    entity_type: document.entity_type,
                    entity_id: document.entity_id,
                    structured_data_available: true,
                    skills_count: structuredData.skills_count,
                    experience_count: structuredData.experience.length,
                    education_count: structuredData.education.length,
                });
            }

            this.logger.info(
                {
                    document_id,
                    entity_id: document.entity_id,
                    skills_count: structuredData.skills_count,
                    experience_count: structuredData.experience.length,
                },
                'Structured resume extraction completed and event published'
            );
        } catch (error) {
            this.logger.error(
                { error, document_id, entity_type, entity_id },
                'Failed to extract structured resume metadata (non-fatal)'
            );

            // Publish failure event so downstream knows extraction didn't work
            if (this.eventPublisher) {
                try {
                    await this.eventPublisher.publish('resume.metadata.extracted', {
                        document_id,
                        entity_type,
                        entity_id,
                        structured_data_available: false,
                        error: error instanceof Error ? error.message : String(error),
                    });
                } catch (publishError) {
                    this.logger.error({ publishError, document_id }, 'Failed to publish extraction failure event');
                }
            }

            // Don't rethrow - structured extraction failure should not nack the message
            // The document was processed successfully, we just couldn't extract structured data
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
