/**
 * Reputation Email Service
 * Handles sending reputation tier change notifications
 */

import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import type { EmailSource } from '../../templates/base';
import {
    tierPromotionEmail,
    tierDemotionEmail,
    TierChangeData,
} from '../../templates/reputation';
import {
    companyTierPromotionEmail,
    companyTierDemotionEmail,
    CompanyTierChangeData,
} from '../../templates/reputation/company-emails';

export class ReputationEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private candidateFromEmail: string,
        private logger: Logger
    ) {}

    private async sendEmail(
        to: string,
        subject: string,
        html: string,
        options: {
            eventType: string;
            userId?: string;
            payload?: Record<string, any>;
            source?: EmailSource;
        }
    ): Promise<void> {
        const effectiveChannel = await this.repository.resolveChannelWithPreferences(options.userId, 'email', null);
        if (!effectiveChannel) return;

        const log = await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.userId,
            recipient_email: to,
            subject,
            template: 'custom',
            payload: options.payload,
            status: 'pending',
            channel: effectiveChannel,
            read: false,
            dismissed: false,
            priority: 'normal',
        });

        try {
            const { data, error } = await this.resend.emails.send({
                from: options.source === 'candidate' ? this.candidateFromEmail : this.fromEmail,
                to,
                subject,
                html,
            });

            if (error) {
                throw error;
            }

            await this.repository.updateNotificationLog(log.id, {
                status: 'sent',
                resend_message_id: data?.id,
            });

            this.logger.info(
                { email: to, subject, message_id: data?.id },
                'Reputation email sent successfully'
            );
        } catch (error: any) {
            this.logger.error(
                { email: to, error },
                'Failed to send reputation email'
            );

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    /**
     * Send tier promotion notification.
     */
    async sendTierPromotion(
        email: string,
        data: TierChangeData & { userId?: string; recruiterId?: string }
    ): Promise<void> {
        const html = tierPromotionEmail(data);

        await this.sendEmail(
            email,
            `Congratulations! You've reached ${this.formatTier(data.newTier)} status`,
            html,
            {
                eventType: 'reputation.tier_changed',
                userId: data.userId,
                payload: {
                    recruiter_id: data.recruiterId,
                    old_tier: data.oldTier,
                    new_tier: data.newTier,
                    change_type: 'promotion',
                },
            }
        );
    }

    /**
     * Send tier demotion notification.
     */
    async sendTierDemotion(
        email: string,
        data: TierChangeData & { userId?: string; recruiterId?: string }
    ): Promise<void> {
        const html = tierDemotionEmail(data);

        await this.sendEmail(
            email,
            'Your Reputation Tier Has Changed',
            html,
            {
                eventType: 'reputation.tier_changed',
                userId: data.userId,
                payload: {
                    recruiter_id: data.recruiterId,
                    old_tier: data.oldTier,
                    new_tier: data.newTier,
                    change_type: 'demotion',
                },
            }
        );
    }

    /**
     * Send company tier promotion notification.
     */
    async sendCompanyTierPromotion(
        email: string,
        data: CompanyTierChangeData & { userId?: string; companyId?: string }
    ): Promise<void> {
        const html = companyTierPromotionEmail(data);

        await this.sendEmail(
            email,
            `Congratulations! ${data.companyName} has reached ${this.formatTier(data.newTier)} status`,
            html,
            {
                eventType: 'company_reputation.tier_changed',
                userId: data.userId,
                payload: {
                    company_id: data.companyId,
                    old_tier: data.oldTier,
                    new_tier: data.newTier,
                    change_type: 'promotion',
                },
            }
        );
    }

    /**
     * Send company tier demotion notification.
     */
    async sendCompanyTierDemotion(
        email: string,
        data: CompanyTierChangeData & { userId?: string; companyId?: string }
    ): Promise<void> {
        const html = companyTierDemotionEmail(data);

        await this.sendEmail(
            email,
            `${data.companyName}'s Reputation Tier Has Changed`,
            html,
            {
                eventType: 'company_reputation.tier_changed',
                userId: data.userId,
                payload: {
                    company_id: data.companyId,
                    old_tier: data.oldTier,
                    new_tier: data.newTier,
                    change_type: 'demotion',
                },
            }
        );
    }

    private formatTier(tier: string): string {
        const tierLabels: Record<string, string> = {
            elite: 'Elite',
            pro: 'Pro',
            active: 'Active',
            new: 'New',
        };
        return tierLabels[tier] || tier;
    }
}
