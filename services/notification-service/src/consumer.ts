import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { EmailService } from './email';
import { ServiceRegistry } from './clients';

export class EventConsumer {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'notification-service-queue';

    constructor(
        private rabbitMqUrl: string,
        private emailService: EmailService,
        private services: ServiceRegistry,
        private logger: Logger
    ) { }

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.rabbitMqUrl) as any;
            this.channel = await (this.connection as any).createChannel();

            if (!this.channel) throw new Error('Failed to create channel');

            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
            await this.channel.assertQueue(this.queue, { durable: true });

            // Bind to events we care about
            await this.channel.bindQueue(this.queue, this.exchange, 'application_created');
            await this.channel.bindQueue(this.queue, this.exchange, 'application_stage_changed');
            await this.channel.bindQueue(this.queue, this.exchange, 'placement_created');

            this.logger.info('Connected to RabbitMQ and bound to events');

            await this.startConsuming();
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to connect to RabbitMQ');
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
                if (!msg) return;

                try {
                    const event: DomainEvent = JSON.parse(msg.content.toString());
                    this.logger.info({ event_type: event.event_type }, 'Processing event');

                    await this.handleEvent(event);

                    this.channel!.ack(msg);
                } catch (error) {
                    this.logger.error({ err: error }, 'Error processing message');
                    // Reject and requeue (consider dead letter queue in production)
                    this.channel!.nack(msg, false, false);
                }
            },
            { noAck: false }
        );

        this.logger.info('Started consuming events');
    }

    private async handleEvent(event: DomainEvent): Promise<void> {
        switch (event.event_type) {
            case 'application.created':
                await this.handleApplicationCreated(event);
                break;

            case 'application.stage_changed':
                await this.handleApplicationStageChanged(event);
                break;

            case 'placement.created':
                await this.handlePlacementCreated(event);
                break;

            default:
                this.logger.debug({ event_type: event.event_type }, 'Unhandled event type');
        }
    }

    private async handleApplicationCreated(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id } = event.payload;

            this.logger.info({ application_id, job_id, candidate_id }, 'Fetching data for application created notification');

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Fetch recruiter details
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;

            // Fetch recruiter's user profile to get email
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;

            // Send email notification
            await this.emailService.sendApplicationCreated(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                userId: recruiter.user_id,
            });

            this.logger.info(
                { application_id, recipient: user.email },
                'Application created notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send application created notification'
            );
            // Re-throw to trigger message requeue
            throw error;
        }
    }

    private async handleApplicationStageChanged(event: DomainEvent): Promise<void> {
        try {
            const { application_id, old_stage, new_stage, job_id, candidate_id } = event.payload;

            this.logger.info(
                { application_id, old_stage, new_stage },
                'Fetching data for stage changed notification'
            );

            // Fetch application to get recruiter ID
            const applicationResponse = await this.services.getAtsService().get<any>(`/applications/${application_id}`);
            const application = applicationResponse.data || applicationResponse;

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id || application.job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id || application.candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Fetch recruiter details
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${application.submitted_by_recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;

            // Fetch recruiter's user profile to get email
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;

            // Send email notification
            await this.emailService.sendApplicationStageChanged(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                oldStage: old_stage,
                newStage: new_stage,
                userId: recruiter.user_id,
            });

            this.logger.info(
                { application_id, recipient: user.email, new_stage },
                'Stage changed notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send stage changed notification'
            );
            throw error;
        }
    }

    private async handlePlacementCreated(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, recruiter_id, recruiter_share, job_id, candidate_id, salary } = event.payload;

            this.logger.info(
                { placement_id, recruiter_id, recruiter_share },
                'Fetching data for placement created notification'
            );

            // Fetch placement details if not in payload
            let placementData = event.payload;
            if (!salary || !job_id || !candidate_id) {
                const placementResponse = await this.services.getAtsService().get<any>(`/placements/${placement_id}`);
                placementData = placementResponse.data || placementResponse;
            }

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${placementData.job_id || job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${placementData.candidate_id || candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Fetch recruiter details
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${placementData.recruiter_id || recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;

            // Fetch recruiter's user profile to get email
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;

            // Send email notification
            await this.emailService.sendPlacementCreated(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                salary: placementData.salary || salary,
                recruiterShare: placementData.recruiter_share_amount || recruiter_share,
                userId: recruiter.user_id,
            });

            this.logger.info(
                { placement_id, recipient: user.email, recruiter_share: placementData.recruiter_share_amount },
                'Placement created notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send placement created notification'
            );
            throw error;
        }
    }

    async close(): Promise<void> {
        if (this.channel) await this.channel.close();
        if (this.connection) await (this.connection as any).close();
        this.logger.info('Disconnected from RabbitMQ');
    }
}
