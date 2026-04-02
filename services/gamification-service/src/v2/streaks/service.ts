import { StreakRepository } from './repository.js';
import { BadgeEntityType } from '../badges/definitions/types.js';
import { IEventPublisher } from '../shared/events.js';

const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365];

export class StreakService {
    constructor(
        private repository: StreakRepository,
        private eventPublisher: IEventPublisher
    ) {}

    async getByEntity(entityType: BadgeEntityType, entityId: string) {
        return this.repository.getByEntity(entityType, entityId);
    }

    /**
     * Record activity for a streak. If within the valid window, increments.
     * If outside the window, resets the streak.
     */
    async recordActivity(
        entityType: BadgeEntityType,
        entityId: string,
        streakType: string,
        windowHours = 168 // default: 7 days for weekly streaks
    ): Promise<{ current_count: number; milestone_hit: number | null }> {
        const now = new Date();
        const existing = await this.repository.getStreak(entityType, entityId, streakType);

        let currentCount: number;
        let longestCount: number;
        let streakStartedAt: string;

        if (!existing || !existing.last_activity_at) {
            // New streak
            currentCount = 1;
            longestCount = 1;
            streakStartedAt = now.toISOString();
        } else {
            const lastActivity = new Date(existing.last_activity_at);
            const hoursSinceLast = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLast <= windowHours) {
                // Continue streak
                currentCount = existing.current_count + 1;
                longestCount = Math.max(existing.longest_count, currentCount);
                streakStartedAt = existing.streak_started_at || now.toISOString();
            } else {
                // Streak broken, restart
                currentCount = 1;
                longestCount = existing.longest_count;
                streakStartedAt = now.toISOString();
            }
        }

        await this.repository.upsert({
            entity_type: entityType,
            entity_id: entityId,
            streak_type: streakType,
            current_count: currentCount,
            longest_count: longestCount,
            last_activity_at: now.toISOString(),
            streak_started_at: streakStartedAt,
        });

        // Check milestones
        const milestoneHit = STREAK_MILESTONES.includes(currentCount) ? currentCount : null;

        if (milestoneHit) {
            await this.eventPublisher.publish('streak.milestone', {
                entity_type: entityType,
                entity_id: entityId,
                streak_type: streakType,
                milestone: milestoneHit,
                current_count: currentCount,
            });
        }

        // Publish streak update for badge evaluation
        await this.eventPublisher.publish('streak.updated', {
            entity_type: entityType,
            entity_id: entityId,
            streak_type: streakType,
            current_count: currentCount,
        });

        return { current_count: currentCount, milestone_hit: milestoneHit };
    }
}
