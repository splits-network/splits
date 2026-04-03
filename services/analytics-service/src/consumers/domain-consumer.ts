import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
import { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@splits-network/shared-logging';
import { CacheManager } from '../cache/cache-manager.js';
import { CacheInvalidator } from '../cache/invalidation.js';
import { EventType } from '../v2/types.js';
import { DashboardEventPublisher } from '../v2/shared/dashboard-events.js';

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
                user_id: data.user_id || data.changed_by || data.created_by,
                user_role: data.user_role,
                organization_id: data.organization_id || data.company_id,
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
                await this.incrementHourlyMetric('applications_submitted', data.recruiter_id || data.candidate_recruiter_id);
                break;

            case 'placement.completed':
                await this.incrementHourlyMetric('placements_completed', data.recruiter_id || data.candidate_recruiter_id);
                break;

            case 'job.created':
                await this.incrementHourlyMetric('jobs_posted', data.company_id);
                break;

            case 'candidate.verified':
                await this.incrementHourlyMetric('candidates_verified', data.candidate_id);
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

        const { data: existing, error: selectError } = await this.supabase
            .schema('analytics')
            .from('metrics_hourly')
            .select('id, value')
            .eq('metric_type', metricType)
            .eq('time_bucket', 'hour')
            .eq('time_value', timeBucket.toISOString())
            .eq('dimension_user_id', dimensionId)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            logger.error({ error: selectError, metricType, dimensionId }, 'Failed to query metrics_hourly');
            throw selectError;
        }

        if (existing) {
            const { error: updateError } = await this.supabase
                .schema('analytics')
                .from('metrics_hourly')
                .update({ value: existing.value + 1 })
                .eq('id', existing.id);

            if (updateError) {
                logger.error({ error: updateError, metricType, dimensionId }, 'Failed to update metrics_hourly');
                throw updateError;
            }
        } else {
            const { error: insertError } = await this.supabase
                .schema('analytics')
                .from('metrics_hourly')
                .insert({
                    metric_type: metricType,
                    time_bucket: 'hour',
                    time_value: timeBucket,
                    dimension_user_id: dimensionId,
                    value: 1,
                });

            if (insertError) {
                logger.error({ error: insertError, metricType, dimensionId }, 'Failed to insert metrics_hourly');
                throw insertError;
            }
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

            if (data.recruiter_id) recruiterIds.add(data.recruiter_id);
            if (data.candidate_recruiter_id) recruiterIds.add(data.candidate_recruiter_id);
            if (data.company_recruiter_id) recruiterIds.add(data.company_recruiter_id);

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
            data.application_id ||
            data.placement_id ||
            data.job_id ||
            data.candidate_id ||
            data.recruiter_id ||
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
