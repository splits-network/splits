import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import type { EmailSource } from '../../templates/base';
import { referralCodeRedeemedEmail, ReferralCodeRedeemedData } from '../../templates/recruiter-codes';

export class RecruiterCodesEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private candidateFromEmail: string,
        private logger: Logger
    ) { }

    private async sendEmail(
        to: string,
        subject: string,
        html: string,
        options: {
            eventType: string;
            userId?: string;
            payload?: Record<string, any>;
            channel?: 'email' | 'in_app' | 'both';
            priority?: 'low' | 'normal' | 'high' | 'urgent';
            category?: string;
            actionUrl?: string;
            actionLabel?: string;
            source?: EmailSource;
        }
    ): Promise<void> {
        const log = await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.userId,
            recipient_email: to,
            subject,
            template: 'custom',
            payload: options.payload,
            status: 'pending',
            channel: options.channel || 'email',
            read: false,
            dismissed: false,
            priority: options.priority || 'normal',
            category: options.category,
            action_url: options.actionUrl,
            action_label: options.actionLabel,
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
                'Recruiter code email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send recruiter code email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    async sendReferralCodeRedeemed(
        email: string,
        data: ReferralCodeRedeemedData,
        userId?: string
    ): Promise<void> {
        const html = referralCodeRedeemedEmail(data);

        await this.sendEmail(email, `Your referral code was used by ${data.newUserName}`, html, {
            eventType: 'recruiter_code.used',
            userId,
            channel: 'email',
            priority: 'normal',
            category: 'referral',
            actionUrl: data.dashboardUrl,
            actionLabel: 'View Referrals',
            payload: {
                code: data.code,
                new_user_name: data.newUserName,
            },
        });
    }
}
