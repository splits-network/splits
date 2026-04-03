/**
 * V3 Domain Event Consumer
 *
 * Subscribes to domain events and routes them to the appropriate
 * V3 service methods for XP awards, badge evaluation, and streak tracking.
 */

import amqplib, { Channel, ChannelModel } from 'amqplib';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { IEventPublisher } from '../../v2/shared/events.js';
import { XpAwardService } from '../xp/award-service.js';
import { BadgeAwardService } from '../badges/award-service.js';
import { ActivityService } from '../streaks/activity-service.js';

type EntityType = 'recruiter' | 'candidate' | 'company' | 'firm';
type XpSource = string;

interface EventMapping {
  entityType: EntityType;
  entityIdField: string;
  xpSource: XpSource;
  streakType?: string;
}

const EVENT_MAP: Record<string, EventMapping[]> = {
  'placement.completed': [
    { entityType: 'recruiter', entityIdField: 'candidate_recruiter_id', xpSource: 'placement_completed', streakType: 'weekly_placement' },
    { entityType: 'recruiter', entityIdField: 'company_recruiter_id', xpSource: 'placement_completed', streakType: 'weekly_placement' },
    { entityType: 'candidate', entityIdField: 'candidate_id', xpSource: 'candidate_hired' },
    { entityType: 'company', entityIdField: 'company_id', xpSource: 'placement_completed' },
    { entityType: 'firm', entityIdField: 'firm_id', xpSource: 'placement_completed' },
  ],
  'application.created': [
    { entityType: 'recruiter', entityIdField: 'recruiter_id', xpSource: 'application_submitted' },
  ],
  'reputation.updated': [
    { entityType: 'recruiter', entityIdField: 'recruiter_id', xpSource: 'milestone_bonus' },
  ],
  'recruiter.updated': [
    { entityType: 'recruiter', entityIdField: 'recruiter_id', xpSource: 'profile_completed' },
  ],
  'candidate.updated': [
    { entityType: 'candidate', entityIdField: 'candidate_id', xpSource: 'profile_completed' },
  ],
};

const SUBSCRIBED_EVENTS = Object.keys(EVENT_MAP);

interface DomainEvent {
  event_type: string;
  payload: Record<string, any>;
}

export class DomainConsumer {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor(
    private rabbitMqUrl: string,
    private xpAwardService: XpAwardService,
    private badgeAwardService: BadgeAwardService,
    private activityService: ActivityService,
    private logger: Logger
  ) {}

  async start(): Promise<void> {
    this.connection = await amqplib.connect(this.rabbitMqUrl);
    this.channel = await this.connection.createChannel();

    const exchange = 'domain_events';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });

    const queue = 'gamification-service-v3';
    await this.channel.assertQueue(queue, { durable: true });

    for (const event of SUBSCRIBED_EVENTS) {
      await this.channel.bindQueue(queue, exchange, event);
    }

    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        const event: DomainEvent = JSON.parse(msg.content.toString());
        await this.handleEvent(event);
        this.channel!.ack(msg);
      } catch (error) {
        this.logger.error({ error }, 'Failed to process gamification event');
        this.channel!.nack(msg, false, false);
      }
    });

    this.logger.info('V3 domain consumer started');
  }

  async stop(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  private async handleEvent(event: DomainEvent): Promise<void> {
    const { event_type, payload } = event;
    this.logger.debug({ event_type }, 'Processing gamification event');

    const mappings = EVENT_MAP[event_type] || [];

    for (const mapping of mappings) {
      const entityId = payload[mapping.entityIdField];
      if (!entityId) continue;

      const referenceId = payload.placement_id || payload.application_id;

      await this.xpAwardService.awardXp(
        mapping.entityType,
        entityId,
        mapping.xpSource,
        referenceId,
        `${event_type} event`
      );

      if (mapping.streakType) {
        await this.activityService.recordActivity(mapping.entityType, entityId, mapping.streakType);
      }
    }

    await this.badgeAwardService.evaluateForEvent(event_type, payload);
  }
}
