import amqplib, { Channel, ChannelModel } from 'amqplib';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { BadgeDefinitionService } from './badges/definitions/service.js';
import { BadgeAwardService } from './badges/awards/service.js';
import { BadgeProgressService } from './badges/progress/service.js';
import { evaluateBadgeCriteria } from './badges/evaluator.js';
import { XpService } from './xp/service.js';
import { StreakService } from './streaks/service.js';
import { BadgeDefinition, BadgeEntityType } from './badges/definitions/types.js';
import { XpSourceType } from './xp/types.js';

/** Maps domain events to the entity type + XP source they affect */
const EVENT_MAP: Record<string, { entityType: BadgeEntityType; entityIdField: string; xpSource: XpSourceType; streakType?: string }[]> = {
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

const SUBSCRIBED_EVENTS = [
    'placement.completed', 'application.created', 'reputation.updated',
    'recruiter.updated', 'candidate.updated',
];

export class GamificationConsumer {
    private connection: ChannelModel | null = null;
    private channel: Channel | null = null;
    private supabase: SupabaseClient;

    constructor(
        private rabbitMqUrl: string,
        private supabaseUrl: string,
        private supabaseKey: string,
        private definitionService: BadgeDefinitionService,
        private awardService: BadgeAwardService,
        private progressService: BadgeProgressService,
        private xpService: XpService,
        private streakService: StreakService,
        private logger: Logger
    ) {
        this.supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'public' } });
    }

    async start(): Promise<void> {
        try {
            this.connection = await amqplib.connect(this.rabbitMqUrl);
            this.channel = await this.connection.createChannel();

            const exchange = 'domain_events';
            await this.channel.assertExchange(exchange, 'topic', { durable: true });

            const queue = 'gamification-service';
            await this.channel.assertQueue(queue, { durable: true });

            for (const event of SUBSCRIBED_EVENTS) {
                await this.channel.bindQueue(queue, exchange, event);
            }

            await this.channel.consume(queue, async (msg) => {
                if (!msg) return;
                try {
                    const event = JSON.parse(msg.content.toString());
                    await this.handleEvent(event);
                    this.channel!.ack(msg);
                } catch (error) {
                    this.logger.error({ error }, 'Failed to process gamification event');
                    this.channel!.nack(msg, false, false);
                }
            });

            this.logger.info('Gamification consumer started');
        } catch (error) {
            this.logger.error({ error }, 'Failed to start gamification consumer');
        }
    }

    async stop(): Promise<void> {
        if (this.channel) await this.channel.close();
        if (this.connection) await this.connection.close();
    }

    private async handleEvent(event: { event_type: string; payload: Record<string, any> }): Promise<void> {
        const { event_type, payload } = event;
        this.logger.debug({ event_type }, 'Processing gamification event');

        // 1. Award XP for each entity affected
        const mappings = EVENT_MAP[event_type] || [];
        for (const mapping of mappings) {
            const entityId = payload[mapping.entityIdField];
            if (!entityId) continue;

            await this.xpService.awardXp(
                mapping.entityType,
                entityId,
                mapping.xpSource,
                payload.placement_id || payload.application_id,
                `${event_type} event`
            );

            // 2. Update streaks
            if (mapping.streakType) {
                await this.streakService.recordActivity(mapping.entityType, entityId, mapping.streakType);
            }
        }

        // 3. Evaluate badges triggered by this event
        const definitions = await this.definitionService.getActiveByTriggerEvent(event_type);
        for (const def of definitions) {
            await this.evaluateAndAwardBadge(def, event_type, payload);
        }
    }

    private async evaluateAndAwardBadge(
        definition: BadgeDefinition,
        eventType: string,
        payload: Record<string, any>
    ): Promise<void> {
        // Determine entity IDs to evaluate
        const entityIds = this.extractEntityIds(definition.entity_type, payload);

        for (const entityId of entityIds) {
            try {
                // Fetch entity data from data_source
                const entityData = await this.fetchEntityData(definition.data_source, definition.entity_type, entityId);
                if (!entityData) continue;

                const isEarned = evaluateBadgeCriteria(definition.criteria, entityData);

                if (isEarned) {
                    await this.awardService.award(
                        definition.id,
                        definition.entity_type,
                        entityId,
                        { event_type: eventType },
                        definition.slug,
                        definition.xp_reward
                    );
                    // Remove progress since badge is earned
                    await this.progressService.removeProgress(definition.id, definition.entity_type, entityId);
                } else if (definition.revocable) {
                    await this.awardService.revoke(definition.id, definition.entity_type, entityId);
                }

                // Update progress for numeric badges
                await this.updateBadgeProgress(definition, entityId, entityData);
            } catch (error) {
                this.logger.error({ error, badge: definition.slug, entityId }, 'Badge evaluation failed');
            }
        }
    }

    private extractEntityIds(entityType: BadgeEntityType, payload: Record<string, any>): string[] {
        const ids: string[] = [];
        switch (entityType) {
            case 'recruiter':
                for (const field of ['recruiter_id', 'candidate_recruiter_id', 'company_recruiter_id']) {
                    if (payload[field]) ids.push(payload[field]);
                }
                break;
            case 'candidate':
                if (payload.candidate_id) ids.push(payload.candidate_id);
                break;
            case 'company':
                if (payload.company_id) ids.push(payload.company_id);
                break;
            case 'firm':
                if (payload.firm_id) ids.push(payload.firm_id);
                break;
        }
        return [...new Set(ids)];
    }

    private async fetchEntityData(
        dataSource: string,
        entityType: BadgeEntityType,
        entityId: string
    ): Promise<Record<string, any> | null> {
        const idField = dataSource === 'recruiter_reputation' ? 'recruiter_id'
            : dataSource === 'entity_streaks' ? 'entity_id'
            : 'id';

        let query = this.supabase.from(dataSource).select('*').eq(idField, entityId);

        if (dataSource === 'entity_streaks') {
            query = query.eq('entity_type', entityType);
        }

        const { data, error } = await query.limit(1).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    private async updateBadgeProgress(
        definition: BadgeDefinition,
        entityId: string,
        entityData: Record<string, any>
    ): Promise<void> {
        if (!definition.criteria.all || definition.criteria.all.length === 0) return;

        // Find the first numeric criterion for progress tracking
        const numericCriterion = definition.criteria.all.find(
            c => c.operator === 'gte' || c.operator === 'gt'
        );
        if (!numericCriterion) return;

        const currentValue = Number(entityData[numericCriterion.field] ?? 0);
        const targetValue = Number(numericCriterion.value);

        if (currentValue < targetValue) {
            await this.progressService.updateProgress(
                definition.id,
                definition.entity_type,
                entityId,
                currentValue,
                targetValue
            );
        }
    }
}
