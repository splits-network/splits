import { BadgeProgressRepository } from './repository.js';
import { BadgeEntityType } from '../definitions/types.js';

export class BadgeProgressService {
    constructor(private repository: BadgeProgressRepository) {}

    async getByEntity(entityType: BadgeEntityType, entityId: string) {
        return this.repository.findByEntity(entityType, entityId);
    }

    async updateProgress(
        badgeDefinitionId: string,
        entityType: BadgeEntityType,
        entityId: string,
        currentValue: number,
        targetValue: number
    ) {
        return this.repository.upsert(badgeDefinitionId, entityType, entityId, currentValue, targetValue);
    }

    async removeProgress(badgeDefinitionId: string, entityType: BadgeEntityType, entityId: string) {
        return this.repository.deleteByBadge(badgeDefinitionId, entityType, entityId);
    }
}
