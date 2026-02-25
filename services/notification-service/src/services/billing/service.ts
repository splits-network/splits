import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import {
    stripeConnectOnboardedEmail,
    StripeConnectOnboardedData,
    stripeConnectDisabledEmail,
    StripeConnectDisabledData,
    companyBillingSetupCompleteEmail,
    CompanyBillingSetupCompleteData,
    payoutConnectRequiredEmail,
    PayoutConnectRequiredData,
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
            channel?: 'email' | 'in_app' | 'both';
            priority?: 'low' | 'normal' | 'high' | 'urgent';
            category?: string;
            actionUrl?: string;
            actionLabel?: string;
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

    async sendCompanyBillingSetupComplete(
        email: string,
        data: CompanyBillingSetupCompleteData & { companyId?: string }
    ): Promise<void> {
        const html = companyBillingSetupCompleteEmail(data);

        await this.sendEmail(email, 'Your Company Billing Is Set Up', html, {
            eventType: 'company.billing_profile_completed',
            payload: { company_id: data.companyId },
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

    async sendPayoutConnectRequired(
        email: string,
        data: PayoutConnectRequiredData & { userId?: string; recruiterId?: string }
    ): Promise<void> {
        const html = payoutConnectRequiredEmail(data);

        await this.sendEmail(
            email,
            `Set Up Payouts — $${data.amount.toLocaleString()} Commission Waiting`,
            html,
            {
                eventType: 'payout_transaction.connect_required',
                userId: data.userId,
                channel: 'both',
                priority: 'high',
                category: 'billing',
                actionUrl: data.connectUrl,
                actionLabel: 'Set Up Payouts',
                payload: { recruiter_id: data.recruiterId, amount: data.amount, reason: data.reason },
            }
        );
    }
}
