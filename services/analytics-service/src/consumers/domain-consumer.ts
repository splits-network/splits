import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
import { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@splits-network/shared-logging';
import { CacheManager } from '../cache/cache-manager';
import { CacheInvalidator } from '../cache/invalidation';
import { EventType } from '../v2/types';
import { DashboardEventPublisher } from '../v2/shared/dashboard-events';

const logger = createLogger('DomainEventConsumer');

/**
 * Domain event consumer for analytics service
 * Listens to application.*, placement.*, job.*, candidate.* events
 * Updates metrics tables and invalidates cache
 */
export class DomainEventConsumer {
    private connection: any = null;
    private channel: any = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'analytics-service-queue';

    private dashboardPublisher?: DashboardEventPublisher;

    constructor(
        private rabbitMqUrl: string,
        private supabase: SupabaseClient,
        private cache: CacheManager,
        private cacheInvalidator: CacheInvalidator
    ) { }

    /**
     * Set the dashboard event publisher for real-time WebSocket updates.
     * Optional - if not set, dashboard events are simply not published.
     */
    setDashboardPublisher(publisher: DashboardEventPublisher) {
        this.dashboardPublisher = publisher;
    }

    /**
     * Connect to RabbitMQ and set up queue bindings
     */
    async connect(): Promise<void> {
        try {
            logger.info('Connecting to RabbitMQ...');
            this.connection = await amqp.connect(this.rabbitMqUrl);
            this.channel = await this.connection.createChannel();

            // Assert exchange
            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

            // Assert queue
            await this.channel.assertQueue(this.queue, {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': 'splits-network-events-dlx',
                },
            });

            // Bind to relevant events
            const eventPatterns = [
                'application.*',
                'placement.*',
                'job.*',
                'candidate.*',
                'recruiter.*',
                'proposal.*',
            ];

            for (const pattern of eventPatterns) {
                await this.channel.bindQueue(this.queue, this.exchange, pattern);
                logger.info(`Bound queue to pattern: ${pattern}`);
            }

            // Set prefetch to process one message at a time
            await this.channel.prefetch(1);

            logger.info('RabbitMQ connection established');
        } catch (error) {
            logger.error({ error }, 'Failed to connect to RabbitMQ');
            throw error;
        }
    }

    /**
     * Start consuming messages
     */
    async start(): Promise<void> {
        if (!this.channel) {
            throw new Error('Channel not initialized. Call connect() first.');
        }

        await this.channel.consume(
            this.queue,
            async (msg: ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const event = JSON.parse(msg.content.toString());
                    await this.handleEvent(event);
                    this.channel!.ack(msg);
                } catch (error) {
                    logger.error({ error }, 'Error processing event');
                    // Negative acknowledgment - send to dead letter queue
                    this.channel!.nack(msg, false, false);
                }
            },
            { noAck: false }
        );

        logger.info('Started consuming events from queue');
    }

    /**
     * Handle incoming event
     */
    private async handleEvent(event: any): Promise<void> {
        const { eventType, data, timestamp } = event;
        logger.info({ eventType, dataKeys: Object.keys(data) }, 'Processing event');

        try {
            // Store raw event
            await this.storeEvent(eventType, data, timestamp);

            // Update metrics based on event type
            await this.updateMetrics(eventType, data);

            // Invalidate cache
            await this.cacheInvalidator.handleEvent(eventType as EventType, data);

            // Publish real-time dashboard update via Redis → analytics-gateway → WebSocket
            await this.publishDashboardUpdate(eventType, data);

            logger.info({ eventType }, 'Successfully processed event');
        } catch (error) {
            logger.error({ error, eventType }, 'Error handling event');
            throw error;
        }
    }

    /**
     * Store raw event in analytics.events table
     */
    private async storeEvent(eventType: string, data: any, timestamp: Date): Promise<void> {
        const { error } = await this.supabase
            .schema('analytics')
            .from('events')
            .insert({
                event_type: eventType,
                entity_type: this.getEntityType(eventType),
                entity_id: this.getEntityId(data),
                user_id: data.userId || data.clerkUserId,
                user_role: data.userRole,
                organization_id: data.organizationId || data.companyId,
                metadata: data,
                created_at: timestamp || new Date(),
            });

        if (error) {
            logger.error({ error, eventType }, 'Failed to store event');
            throw error;
        }
    }

    /**
     * Update metrics based on event type
     */
    private async updateMetrics(eventType: string, data: any): Promise<void> {
        switch (eventType) {
            case 'application.created':
                await this.incrementHourlyMetric('applications_submitted', data.recruiterId);
                break;

            case 'placement.completed':
                await this.incrementHourlyMetric('placements_completed', data.recruiterId);
                break;

            case 'job.created':
                await this.incrementHourlyMetric('jobs_posted', data.companyId);
                break;

            case 'candidate.verified':
                await this.incrementHourlyMetric('candidates_verified', data.candidateId);
                break;

            // Add more event-to-metric mappings as needed
        }
    }

    /**
     * Increment hourly metric counter
     */
    private async incrementHourlyMetric(metricType: string, dimensionId?: string): Promise<void> {
        if (!dimensionId) return;

        const now = new Date();
        const timeBucket = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

        // Try to increment existing metric
        const { data: existing } = await this.supabase
            .schema('analytics')
            .from('metrics_hourly')
            .select('id, value')
            .eq('metric_type', metricType)
            .eq('time_bucket', 'hour')
            .eq('time_value', timeBucket.toISOString())
            .eq('dimension_user_id', dimensionId)
            .single();

        if (existing) {
            // Update existing metric
            await this.supabase
                .schema('analytics')
                .from('metrics_hourly')
                .update({ value: existing.value + 1 })
                .eq('id', existing.id);
        } else {
            // Insert new metric
            await this.supabase
                .schema('analytics')
                .from('metrics_hourly')
                .insert({
                    metric_type: metricType,
                    time_bucket: 'hour',
                    time_value: timeBucket,
                    dimension_user_id: dimensionId,
                    value: 1,
                });
        }
    }

    /**
     * Publish real-time dashboard updates to affected recruiters via Redis.
     */
    private async publishDashboardUpdate(eventType: string, data: any): Promise<void> {
        if (!this.dashboardPublisher) return;

        try {
            // Identify affected recruiter(s) from event data
            const recruiterIds = new Set<string>();

            if (data.recruiterId) recruiterIds.add(data.recruiterId);
            if (data.candidateRecruiterId) recruiterIds.add(data.candidateRecruiterId);
            if (data.companyRecruiterId) recruiterIds.add(data.companyRecruiterId);

            // Determine which metrics changed based on event type
            const changedMetrics: string[] = [];
            if (eventType.startsWith('application.')) {
                changedMetrics.push('candidates_in_process', 'offers_pending');
            }
            if (eventType.startsWith('placement.')) {
                changedMetrics.push('placements_this_month', 'placements_this_year', 'total_earnings_ytd');
            }
            if (eventType.startsWith('job.') || eventType.startsWith('recruiter.')) {
                changedMetrics.push('active_roles');
            }

            // Publish to each affected recruiter's dashboard channel
            for (const recruiterId of recruiterIds) {
                await this.dashboardPublisher.publishRecruiterUpdate(recruiterId, changedMetrics);
            }
        } catch (error) {
            logger.warn({ error, eventType }, 'Failed to publish dashboard update (non-critical)');
        }
    }

    /**
     * Extract entity type from event type
     */
    private getEntityType(eventType: string): string {
        return eventType.split('.')[0];
    }

    /**
     * Extract entity ID from event data
     */
    private getEntityId(data: any): string {
        return (
            data.id ||
            data.applicationId ||
            data.placementId ||
            data.jobId ||
            data.candidateId ||
            data.recruiterId ||
            'unknown'
        );
    }

    /**
     * Close connection
     */
    async close(): Promise<void> {
        if (this.channel) {
            await (this.channel as any).close();
        }
        if (this.connection) {
            await (this.connection as any).close();
        }
        logger.info('RabbitMQ connection closed');
    }
}
