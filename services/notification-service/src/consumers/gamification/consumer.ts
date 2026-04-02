/**
 * Gamification Event Consumer
 * Handles badge.awarded, level.up, and streak.milestone events
 * Creates in-app notification logs for gamification achievements
 */

import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { ContactLookupHelper } from '../../helpers/contact-lookup.js';
import { DataLookupHelper } from '../../helpers/data-lookup.js';

export class GamificationEventConsumer {
    constructor(
        private logger: Logger,
        private contactLookup: ContactLookupHelper,
        private dataLookup: DataLookupHelper
    ) {}

    async handleBadgeAwarded(event: DomainEvent): Promise<void> {
        try {
            const { badge_slug, entity_type, entity_id, xp_reward } = event.payload;

            this.logger.info(
                { badge_slug, entity_type, entity_id, xp_reward },
                'Badge awarded - gamification notification'
            );

            // Future: send email/push notification for significant badges
            // For now, the in-app achievement display pulls from badges_awarded table directly
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to process badge.awarded notification'
            );
        }
    }

    async handleLevelUp(event: DomainEvent): Promise<void> {
        try {
            const { entity_type, entity_id, new_level, title, total_xp } = event.payload;

            this.logger.info(
                { entity_type, entity_id, new_level, title },
                'Level up - gamification notification'
            );

            // Future: send congratulatory email for milestone levels (5, 10, 15, 20)
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to process level.up notification'
            );
        }
    }

    async handleStreakMilestone(event: DomainEvent): Promise<void> {
        try {
            const { entity_type, entity_id, streak_type, milestone } = event.payload;

            this.logger.info(
                { entity_type, entity_id, streak_type, milestone },
                'Streak milestone - gamification notification'
            );

            // Future: send streak milestone notifications
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to process streak.milestone notification'
            );
        }
    }
}
