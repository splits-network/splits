/**
 * Reputation Event Consumer
 * Handles reputation.tier_changed events to send notifications
 */

import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { ReputationEmailService } from '../../services/reputation/service';
import { ContactLookupHelper } from '../../helpers/contact-lookup';
import { DataLookupHelper } from '../../helpers/data-lookup';

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
        private contactLookup: ContactLookupHelper,
        private dataLookup?: DataLookupHelper
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

    async handleCompanyTierChanged(event: DomainEvent): Promise<void> {
        try {
            const {
                company_id,
                old_tier,
                new_tier,
                old_score,
                new_score,
            } = event.payload;

            this.logger.info(
                { company_id, old_tier, new_tier },
                'Handling company tier change notification'
            );

            // Look up company to get org ID and name
            const company = this.dataLookup
                ? await this.dataLookup.getCompany(company_id)
                : null;

            if (!company) {
                throw new Error(`Company not found: ${company_id}`);
            }

            if (!company.identity_organization_id) {
                this.logger.warn({ company_id }, 'Company has no identity_organization_id, cannot send tier change notification');
                return;
            }

            const companyAdmins = await this.contactLookup.getCompanyAdminContacts(company.identity_organization_id);
            if (companyAdmins.length === 0) {
                this.logger.warn({ company_id }, 'No company admins found');
                return;
            }

            const dashboardUrl = `${this.portalUrl}/portal/dashboard`;

            const commonData = {
                companyName: company.name,
                oldTier: old_tier,
                newTier: new_tier,
                oldScore: old_score,
                newScore: new_score,
                dashboardUrl,
                companyId: company_id,
            };

            const oldRank = tierOrder[old_tier] ?? 0;
            const newRank = tierOrder[new_tier] ?? 0;

            for (const admin of companyAdmins) {
                if (newRank > oldRank) {
                    await this.emailService.sendCompanyTierPromotion(admin.email, {
                        ...commonData,
                        userId: admin.user_id || undefined,
                    });
                } else {
                    await this.emailService.sendCompanyTierDemotion(admin.email, {
                        ...commonData,
                        userId: admin.user_id || undefined,
                    });
                }
            }

            this.logger.info(
                { company_id, old_tier, new_tier, adminCount: companyAdmins.length },
                'Company tier change notifications sent'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send company tier change notification'
            );
            throw error;
        }
    }
}
