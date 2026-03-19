/**
 * V3 Domain Event Consumer
 *
 * Subscribes to wildcard events across application, placement, job,
 * candidate, and recruiter domains via RabbitMQ.
 * Routes events to metrics update handlers and publishes real-time
 * dashboard updates via the DashboardPublisher.
 */

import amqp, { ConsumeMessage } from 'amqplib';
import { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@splits-network/shared-logging';
import { CacheInvalidator } from '../../cache/invalidation';
import { EventType } from '../../v2/types';
import { DashboardPublisher } from './dashboard-publisher';

const logger = createLogger('v3:DomainEventConsumer');

const EXCHANGE = 'splits-network-events';
const QUEUE = 'analytics-service-v3-queue';
const DLX = 'splits-network-events-dlx';

const EVENT_PATTERNS = [
  'application.*',
  'placement.*',
  'job.*',
  'candidate.*',
  'recruiter.*',
];

/** Maps event types to the hourly metric they increment. */
const EVENT_METRIC_MAP: Record<string, string> = {
  'application.created': 'applications_submitted',
  'application.submitted': 'applications_submitted',
  'application.stage_changed': 'application_stage_changes',
  'placement.created': 'placements_created',
  'placement.completed': 'placements_completed',
  'job.created': 'jobs_posted',
  'job.filled': 'roles_filled',
  'candidate.created': 'candidates_created',
  'candidate.verified': 'candidates_verified',
  'recruiter.activated': 'recruiter_applications',
  'recruiter.application_submitted': 'recruiter_applications',
  'recruiter.placement_completed': 'recruiter_placements',
};

export class DomainEventConsumer {
  private connection: any = null;
  private channel: any = null;
  private dashboardPublisher?: DashboardPublisher;

  constructor(
    private rabbitMqUrl: string,
    private supabase: SupabaseClient,
    private cacheInvalidator: CacheInvalidator,
  ) {}

  setDashboardPublisher(publisher: DashboardPublisher) {
    this.dashboardPublisher = publisher;
  }

  async connect(): Promise<void> {
    logger.info('Connecting to RabbitMQ...');
    this.connection = await amqp.connect(this.rabbitMqUrl);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    await this.channel.assertQueue(QUEUE, {
      durable: true,
      arguments: { 'x-dead-letter-exchange': DLX },
    });

    for (const pattern of EVENT_PATTERNS) {
      await this.channel.bindQueue(QUEUE, EXCHANGE, pattern);
      logger.info(`Bound queue to pattern: ${pattern}`);
    }

    await this.channel.prefetch(1);
    logger.info('RabbitMQ connection established');
  }

  async start(): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized. Call connect() first.');

    await this.channel.consume(
      QUEUE,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());
          await this.handleEvent(event);
          this.channel!.ack(msg);
        } catch (error) {
          logger.error({ error }, 'Error processing event');
          this.channel!.nack(msg, false, false);
        }
      },
      { noAck: false },
    );

    logger.info('Started consuming events from queue');
  }

  private async handleEvent(event: any): Promise<void> {
    const { eventType, data, timestamp } = event;
    logger.info({ eventType }, 'Processing event');

    await this.storeEvent(eventType, data, timestamp);
    await this.updateMetrics(eventType, data);
    await this.cacheInvalidator.handleEvent(eventType as EventType, data);
    await this.publishDashboardUpdate(eventType, data);
  }

  private async storeEvent(eventType: string, data: any, timestamp: Date): Promise<void> {
    const { error } = await this.supabase
      .schema('analytics')
      .from('events')
      .insert({
        event_type: eventType,
        entity_type: eventType.split('.')[0],
        entity_id: data.id || data.application_id || data.placement_id || data.job_id || data.candidate_id || data.recruiter_id || 'unknown',
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

  private async updateMetrics(eventType: string, data: any): Promise<void> {
    const metricType = EVENT_METRIC_MAP[eventType];
    if (!metricType) return;

    const dimensionId = data.recruiter_id || data.candidate_recruiter_id || data.company_id || data.candidate_id;
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

  private async publishDashboardUpdate(eventType: string, data: any): Promise<void> {
    if (!this.dashboardPublisher) return;

    const recruiterIds = new Set<string>();
    if (data.recruiter_id) recruiterIds.add(data.recruiter_id);
    if (data.candidate_recruiter_id) recruiterIds.add(data.candidate_recruiter_id);
    if (data.company_recruiter_id) recruiterIds.add(data.company_recruiter_id);

    const changedMetrics = this.resolveChangedMetrics(eventType);

    for (const recruiterId of recruiterIds) {
      await this.dashboardPublisher.publishRecruiterUpdate(recruiterId, changedMetrics);
    }
  }

  private resolveChangedMetrics(eventType: string): string[] {
    if (eventType.startsWith('application.')) {
      return ['candidates_in_process', 'offers_pending'];
    }
    if (eventType.startsWith('placement.')) {
      return ['placements_this_month', 'placements_this_year', 'total_earnings_ytd'];
    }
    if (eventType.startsWith('job.') || eventType.startsWith('recruiter.')) {
      return ['active_roles'];
    }
    if (eventType.startsWith('candidate.')) {
      return ['candidates_verified'];
    }
    return [];
  }

  async close(): Promise<void> {
    if (this.channel) await (this.channel as any).close();
    if (this.connection) await (this.connection as any).close();
    logger.info('RabbitMQ connection closed');
  }
}
