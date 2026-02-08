import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import {
    stripeConnectOnboardedEmail,
    StripeConnectOnboardedData,
    stripeConnectDisabledEmail,
    StripeConnectDisabledData,
} from '../../templates/billing';

export class BillingEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
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
            channel: 'email',
            read: false,
            dismissed: false,
            priority: 'normal',
        });

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.fromEmail,
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
                'Billing email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send billing email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    async sendStripeConnectOnboarded(
        email: string,
        data: StripeConnectOnboardedData & { userId?: string; recruiterId?: string }
    ): Promise<void> {
        const html = stripeConnectOnboardedEmail(data);

        await this.sendEmail(email, 'Your Payouts Are Set Up', html, {
            eventType: 'recruiter.stripe_connect_onboarded',
            userId: data.userId,
            payload: { recruiter_id: data.recruiterId },
        });
    }

    async sendStripeConnectDisabled(
        email: string,
        data: StripeConnectDisabledData & { userId?: string; recruiterId?: string }
    ): Promise<void> {
        const html = stripeConnectDisabledEmail(data);

        await this.sendEmail(email, 'Action Required: Update Payment Info', html, {
            eventType: 'recruiter.stripe_connect_disabled',
            userId: data.userId,
            payload: { recruiter_id: data.recruiterId },
        });
    }
}
