import { XpRepository } from './repository';
import { BadgeEntityType } from '../badges/definitions/types';
import { XpHistoryFilters, XpSourceType, LevelThreshold } from './types';
import { IEventPublisher } from '../shared/events';
import { buildPaginationResponse } from '../shared/pagination';

export class XpService {
    private thresholdsCache: LevelThreshold[] | null = null;

    constructor(
        private repository: XpRepository,
        private eventPublisher: IEventPublisher
    ) {}

    async awardXp(
        entityType: BadgeEntityType,
        entityId: string,
        source: XpSourceType,
        referenceId?: string,
        description?: string
    ): Promise<{ points: number; newLevel: number | null }> {
        const rule = await this.repository.getRule(source, entityType);
        if (!rule) return { points: 0, newLevel: null };

        // Check daily cap
        if (rule.max_per_day) {
            const todayTotal = await this.repository.getTodayPoints(entityType, entityId, source);
            if (todayTotal >= rule.max_per_day) return { points: 0, newLevel: null };
        }

        const points = rule.base_points;

        // Record XP entry
        await this.repository.addEntry({
            entity_type: entityType,
            entity_id: entityId,
            source,
            points,
            reference_id: referenceId,
            description,
        });

        // Update level
        const newLevel = await this.updateLevel(entityType, entityId, points);

        return { points, newLevel };
    }

    private async updateLevel(
        entityType: BadgeEntityType,
        entityId: string,
        pointsAdded: number
    ): Promise<number | null> {
        let current = await this.repository.getLevel(entityType, entityId);

        if (!current) {
            current = await this.repository.upsertLevel({
                entity_type: entityType,
                entity_id: entityId,
                total_xp: 0,
                current_level: 1,
                xp_to_next_level: 100,
            });
        }

        const newTotalXp = current.total_xp + pointsAdded;
        const thresholds = await this.getThresholds();
        const newLevel = this.computeLevel(newTotalXp, thresholds);
        const nextThreshold = thresholds.find(t => t.level === newLevel + 1);
        const xpToNext = nextThreshold ? nextThreshold.xp_required - newTotalXp : 0;

        await this.repository.upsertLevel({
            entity_type: entityType,
            entity_id: entityId,
            total_xp: newTotalXp,
            current_level: newLevel,
            xp_to_next_level: Math.max(0, xpToNext),
        });

        if (newLevel > current.current_level) {
            const levelInfo = thresholds.find(t => t.level === newLevel);
            await this.eventPublisher.publish('level.up', {
                entity_type: entityType,
                entity_id: entityId,
                new_level: newLevel,
                title: levelInfo?.title || '',
                total_xp: newTotalXp,
            });
            return newLevel;
        }

        return null;
    }

    private computeLevel(totalXp: number, thresholds: LevelThreshold[]): number {
        let level = 1;
        for (const t of thresholds) {
            if (totalXp >= t.xp_required) level = t.level;
            else break;
        }
        return level;
    }

    private async getThresholds(): Promise<LevelThreshold[]> {
        if (!this.thresholdsCache) {
            this.thresholdsCache = await this.repository.getAllThresholds();
        }
        return this.thresholdsCache;
    }

    async getLevel(entityType: BadgeEntityType, entityId: string) {
        const level = await this.repository.getLevel(entityType, entityId);
        if (!level) {
            return {
                entity_type: entityType,
                entity_id: entityId,
                total_xp: 0,
                current_level: 1,
                xp_to_next_level: 100,
                title: 'Newcomer',
            };
        }
        const thresholds = await this.getThresholds();
        const info = thresholds.find(t => t.level === level.current_level);
        return { ...level, title: info?.title || 'Unknown' };
    }

    async getLevelsBatch(entityType: BadgeEntityType, entityIds: string[]) {
        if (entityIds.length === 0) return [];
        const levels = await this.repository.getLevelsByEntityIds(entityType, entityIds);
        const thresholds = await this.getThresholds();

        return entityIds.map(id => {
            const level = levels.find(l => l.entity_id === id);
            if (!level) {
                return {
                    entity_type: entityType,
                    entity_id: id,
                    total_xp: 0,
                    current_level: 1,
                    xp_to_next_level: 100,
                    title: 'Newcomer',
                };
            }
            const info = thresholds.find(t => t.level === level.current_level);
            return { ...level, title: info?.title || 'Unknown' };
        });
    }

    async getHistory(filters: XpHistoryFilters) {
        const result = await this.repository.getHistory(filters);
        return buildPaginationResponse(result.data, result.total, filters.page || 1, filters.limit || 25);
    }

    async getRules() {
        return this.repository.getAllRules();
    }

    async getThresholdsList() {
        return this.getThresholds();
    }
}
