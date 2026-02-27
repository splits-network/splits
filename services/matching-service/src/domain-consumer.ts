import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { MatchingOrchestrator } from './v2/matches/matching-orchestrator';

/**
 * Domain Event Consumer for Matching Service
 *
 * Listens for:
 * - candidate.created / candidate.updated → score candidate against open jobs
 * - job.created / job.updated → score job against eligible candidates
 * - job.status_changed → remove matches for closed/paused jobs
 * - resume.metadata.extracted → re-score candidate with enriched data
 */
export class DomainEventConsumer {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'matching-service-queue';

    constructor(
        private rabbitMqUrl: string,
        private orchestrator: MatchingOrchestrator,
        private logger: Logger
    ) {}

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.rabbitMqUrl) as any;
            this.channel = await (this.connection as any).createChannel();

            if (!this.channel) throw new Error('Failed to create channel');

            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
            await this.channel.assertQueue(this.queue, { durable: true });

            // Bind to candidate and job lifecycle events
            await this.channel.bindQueue(this.queue, this.exchange, 'candidate.created');
            await this.channel.bindQueue(this.queue, this.exchange, 'candidate.updated');
            await this.channel.bindQueue(this.queue, this.exchange, 'job.created');
            await this.channel.bindQueue(this.queue, this.exchange, 'job.updated');
            await this.channel.bindQueue(this.queue, this.exchange, 'job.status_changed');
            await this.channel.bindQueue(this.queue, this.exchange, 'resume.metadata.extracted');

            this.logger.info({
                exchange: this.exchange,
                queue: this.queue,
                bindings: [
                    'candidate.created', 'candidate.updated',
                    'job.created', 'job.updated', 'job.status_changed',
                    'resume.metadata.extracted',
                ],
            }, 'Matching service connected to RabbitMQ');

            await this.startConsuming();
        } catch (error) {
            this.logger.error({ error }, 'Failed to connect to RabbitMQ');
            throw error;
        }
    }

    private async startConsuming(): Promise<void> {
        if (!this.channel) throw new Error('Channel not initialized');

        await this.channel.consume(
            this.queue,
            async (msg: ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const rawEvent = JSON.parse(msg.content.toString());
                    const payload = rawEvent.payload ?? rawEvent;
                    const event: DomainEvent = {
                        event_type: rawEvent.event_type ?? msg.fields.routingKey,
                        event_id: rawEvent.event_id ?? rawEvent.id ?? msg.properties.messageId ?? 'unknown',
                        timestamp: rawEvent.timestamp ?? new Date().toISOString(),
                        source_service: rawEvent.source_service ?? 'unknown',
                        payload,
                    };

                    await this.handleEvent(event);
                    this.channel?.ack(msg);
                } catch (error) {
                    this.logger.error({
                        error: error instanceof Error ? error.message : String(error),
                        message: msg.content.toString(),
                    }, 'Error processing event');
                    this.channel?.nack(msg, false, true);
                }
            },
            { noAck: false }
        );

        this.logger.info('Started consuming matching events');
    }

    private async handleEvent(event: DomainEvent): Promise<void> {
        const { payload } = event;

        switch (event.event_type) {
            case 'candidate.created':
            case 'candidate.updated':
                await this.orchestrator.triggerForCandidate(
                    payload.candidateId || payload.candidate_id
                );
                break;

            case 'job.created':
            case 'job.updated':
                await this.orchestrator.triggerForJob(
                    payload.jobId || payload.job_id
                );
                break;

            case 'job.status_changed':
                await this.handleJobStatusChanged(event);
                break;

            case 'resume.metadata.extracted':
                if (payload.entity_type === 'candidate' && payload.structured_data_available) {
                    await this.orchestrator.triggerForCandidate(payload.entity_id);
                }
                break;

            default:
                this.logger.debug({ event_type: event.event_type }, 'Unhandled event type');
        }
    }

    private async handleJobStatusChanged(event: DomainEvent): Promise<void> {
        const { jobId, job_id, newStatus, new_status } = event.payload;
        const id = jobId || job_id;
        const status = newStatus || new_status;

        if (status === 'active') {
            await this.orchestrator.triggerForJob(id);
        }
        // For closed/paused/filled jobs, matches stay but no new ones are generated
    }

    isConnected(): boolean {
        return this.channel !== null && this.connection !== null;
    }

    async close(): Promise<void> {
        try {
            if (this.channel) await this.channel.close();
            if (this.connection) await (this.connection as any).close();
            this.logger.info('Matching service domain consumer closed');
        } catch (error) {
            this.logger.error({ error }, 'Error closing domain consumer');
        }
    }
}
