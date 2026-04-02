import { BadgeAwardRepository } from './repository.js';
import { BadgeAwardFilters } from './types.js';
import { BadgeEntityType } from '../definitions/types.js';
import { IEventPublisher } from '../../shared/events.js';
import { buildPaginationResponse } from '../../shared/pagination.js';

export class BadgeAwardService {
    constructor(
        private repository: BadgeAwardRepository,
        private eventPublisher: IEventPublisher
    ) {}

    async getByEntity(entityType: BadgeEntityType, entityId: string, includeRevoked = false) {
        return this.repository.findByEntity(entityType, entityId, includeRevoked);
    }

    async getByEntityIds(entityType: BadgeEntityType, entityIds: string[]) {
        const allAwards = await this.repository.findByEntityIds(entityType, entityIds);
        const grouped: Record<string, typeof allAwards> = {};
        for (const award of allAwards) {
            if (!grouped[award.entity_id]) grouped[award.entity_id] = [];
            grouped[award.entity_id].push(award);
        }
        return grouped;
    }

    async list(filters: BadgeAwardFilters) {
        const result = await this.repository.findAll(filters);
        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 25
        );
    }

    async award(
        badgeDefinitionId: string,
        entityType: BadgeEntityType,
        entityId: string,
        metadata: Record<string, any> = {},
        badgeSlug?: string,
        xpReward?: number
    ) {
        const existing = await this.repository.findExisting(badgeDefinitionId, entityType, entityId);
        if (existing && !existing.revoked_at) return existing;

        const awarded = await this.repository.award(badgeDefinitionId, entityType, entityId, metadata);

        await this.eventPublisher.publish('badge.awarded', {
            badge_definition_id: badgeDefinitionId,
            badge_slug: badgeSlug,
            entity_type: entityType,
            entity_id: entityId,
            xp_reward: xpReward || 0,
        });

        return awarded;
    }

    async revoke(badgeDefinitionId: string, entityType: BadgeEntityType, entityId: string) {
        await this.repository.revoke(badgeDefinitionId, entityType, entityId);

        await this.eventPublisher.publish('badge.revoked', {
            badge_definition_id: badgeDefinitionId,
            entity_type: entityType,
            entity_id: entityId,
        });
    }
}
