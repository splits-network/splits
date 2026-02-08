/**
 * Reputation Event Consumer
 * Handles reputation.tier_changed events to send notifications
 */

import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { ReputationEmailService } from '../../services/reputation/service';
import { ContactLookupHelper } from '../../helpers/contact-lookup';

// Tier ordering for determining promotion vs demotion
const tierOrder: Record<string, number> = {
    new: 0,
    active: 1,
    pro: 2,
    elite: 3,
};

export class ReputationEventConsumer {
    constructor(
        private emailService: ReputationEmailService,
        private logger: Logger,
        private portalUrl: string,
        private contactLookup: ContactLookupHelper
    ) {}

    async handleTierChanged(event: DomainEvent): Promise<void> {
        try {
            const {
                recruiter_id,
                recruiter_user_id,
                old_tier,
                new_tier,
                old_score,
                new_score,
            } = event.payload;

            this.logger.info(
                { recruiter_id, old_tier, new_tier },
                'Handling tier change notification'
            );

            // Get recruiter contact info
            const recruiterContact =
                await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiter_id}`);
            }

            const profileUrl = `${this.portalUrl}/portal/profile`;

            const commonData = {
                recruiterName: recruiterContact.name,
                oldTier: old_tier,
                newTier: new_tier,
                oldScore: old_score,
                newScore: new_score,
                profileUrl,
                userId: recruiterContact.user_id || undefined,
                recruiterId: recruiter_id,
            };

            // Determine if promotion or demotion
            const oldRank = tierOrder[old_tier] ?? 0;
            const newRank = tierOrder[new_tier] ?? 0;

            if (newRank > oldRank) {
                // Promotion
                await this.emailService.sendTierPromotion(
                    recruiterContact.email,
                    commonData
                );
                this.logger.info(
                    {
                        recruiter_id,
                        recipient: recruiterContact.email,
                        old_tier,
                        new_tier,
                    },
                    'Tier promotion notification sent successfully'
                );
            } else {
                // Demotion
                await this.emailService.sendTierDemotion(
                    recruiterContact.email,
                    commonData
                );
                this.logger.info(
                    {
                        recruiter_id,
                        recipient: recruiterContact.email,
                        old_tier,
                        new_tier,
                    },
                    'Tier demotion notification sent successfully'
                );
            }
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send tier change notification'
            );
            throw error;
        }
    }
}
