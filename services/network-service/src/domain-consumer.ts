import amqp, { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { NetworkService } from './service';
import { RecruiterCandidateConsumer } from './consumers/recruiter-candidates';

/**
 * Domain Event Consumer for Network Service
 * Listens to events from other services (primarily ATS) to maintain
 * recruiter-candidate relationships and other network data.
 */
export class DomainEventConsumer {
    private connection: amqp.Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'network-service-queue';

    private recruiterCandidateConsumer: RecruiterCandidateConsumer;

    constructor(
        private rabbitMqUrl: string,
        networkService: NetworkService,
        private logger: Logger
    ) {
        this.recruiterCandidateConsumer = new RecruiterCandidateConsumer(networkService);
    }

    async start(): Promise<void> {
        try {
            // Connect to RabbitMQ
            this.connection = await amqp.connect(this.rabbitMqUrl) as any;
            this.channel = await (this.connection as any).createChannel();

            if (!this.channel) throw new Error('Failed to create channel');

            // Assert exchange exists
            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

            // Assert queue and bind to relevant event patterns
            await this.channel.assertQueue(this.queue, { durable: true });
            
            // Bind to events we care about
            await this.channel.bindQueue(this.queue, this.exchange, 'application.created');
            await this.channel.bindQueue(this.queue, this.exchange, 'candidate.created');

            // Set up consumer
            this.channel.consume(
                this.queue,
                (msg) => this.handleMessage(msg),
                { noAck: false }
            );

            this.logger.info(`[DomainEventConsumer] Listening for events on queue: ${this.queue}`);
        } catch (error) {
            this.logger.error({ err: error }, '[DomainEventConsumer] Failed to start consumer');
            throw error;
        }
    }

    private async handleMessage(msg: ConsumeMessage | null): Promise<void> {
        if (!msg || !this.channel) return;

        try {
            const content = msg.content.toString();
            const event: DomainEvent = JSON.parse(content);

            this.logger.debug({ event }, '[DomainEventConsumer] Received event');

            // Route to appropriate consumer
            await this.routeEvent(event);

            // Acknowledge message
            this.channel.ack(msg);
        } catch (error) {
            this.logger.error({ err: error, msg: msg.content.toString() }, '[DomainEventConsumer] Error processing message');
            
            // Reject and requeue (could add retry logic/dead letter queue here)
            if (this.channel) {
                this.channel.nack(msg, false, true);
            }
        }
    }

    private async routeEvent(event: DomainEvent): Promise<void> {
        const { event_type, payload } = event;

        try {
            switch (event_type) {
                case 'application.created':
                case 'candidate.created':
                    await this.recruiterCandidateConsumer.handleEvent(event_type, payload);
                    break;
                default:
                    this.logger.debug({ event_type }, '[DomainEventConsumer] Ignoring unhandled event type');
            }
        } catch (error) {
            this.logger.error({ err: error, event_type }, '[DomainEventConsumer] Error routing event');
            throw error;
        }
    }

    async stop(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection) {
                await (this.connection as any).close();
                this.connection = null;
            }
            this.logger.info('[DomainEventConsumer] Stopped gracefully');
        } catch (error) {
            this.logger.error({ err: error }, '[DomainEventConsumer] Error stopping consumer');
        }
    }
}
