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
    payoutProcessedEmail,
    PayoutProcessedData,
    payoutFailedEmail,
    PayoutFailedData,
    escrowReleasedEmail,
    EscrowReleasedData,
    escrowAutoReleasedEmail,
    EscrowAutoReleasedData,
    invoicePaidEmail,
    InvoicePaidData,
    subscriptionCancelledEmail,
    SubscriptionCancelledData,
} from '../../templates/billing';
import type { EmailSource } from '../../templates/base';

export class BillingEmailService {
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
        const requestedChannel = options.channel || 'email';
        const effectiveChannel = await this.repository.resolveChannelWithPreferences(options.userId, requestedChannel, options.category || null);
        if (!effectiveChannel) return;

        const log = await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.userId,
            recipient_email: to,
            subject,
            template: 'custom',
            payload: options.payload,
            status: effectiveChannel === 'in_app' ? 'sent' : 'pending',
            channel: effectiveChannel,
            read: false,
            dismissed: false,
            priority: options.priority || 'normal',
            category: options.category,
            action_url: options.actionUrl,
            action_label: options.actionLabel,
        });

        // Skip actual email send if downgraded to in-app only
        if (effectiveChannel === 'in_app') return;

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

    async sendPayoutProcessed(
        email: string,
        data: PayoutProcessedData & { userId?: string; recruiterId?: string }
    ): Promise<void> {
        const html = payoutProcessedEmail(data);

        await this.sendEmail(email, `Payout Sent — ${data.amount}`, html, {
            eventType: 'payout.processed',
            userId: data.userId,
            category: 'billing',
            actionUrl: data.payoutUrl,
            actionLabel: 'View Payout Details',
            payload: { recruiter_id: data.recruiterId, amount: data.amount },
        });
    }

    async sendPayoutFailed(
        email: string,
        data: PayoutFailedData & { userId?: string; recruiterId?: string }
    ): Promise<void> {
        const html = payoutFailedEmail(data);

        await this.sendEmail(email, 'Payout Failed — Action Required', html, {
            eventType: 'payout.failed',
            userId: data.userId,
            channel: 'both',
            priority: 'high',
            category: 'billing',
            actionUrl: data.payoutUrl,
            actionLabel: 'Update Payment Info',
            payload: { recruiter_id: data.recruiterId, amount: data.amount, reason: data.reason },
        });
    }

    async sendEscrowReleased(
        email: string,
        data: EscrowReleasedData & { userId?: string; recruiterId?: string }
    ): Promise<void> {
        const html = escrowReleasedEmail(data);

        await this.sendEmail(email, `Escrow Released — ${data.amount}`, html, {
            eventType: 'escrow.released',
            userId: data.userId,
            category: 'billing',
            actionUrl: data.billingUrl,
            actionLabel: 'View Billing Dashboard',
            payload: { recruiter_id: data.recruiterId, amount: data.amount },
        });
    }

    async sendEscrowAutoReleased(
        email: string,
        data: EscrowAutoReleasedData & { userId?: string }
    ): Promise<void> {
        const html = escrowAutoReleasedEmail(data);

        await this.sendEmail(email, `Guarantee Complete — Escrow of ${data.amount} Released`, html, {
            eventType: 'escrow.auto_released',
            userId: data.userId,
            category: 'billing',
            actionUrl: data.billingUrl,
            actionLabel: 'View Details',
            payload: { amount: data.amount, is_recruiter: data.isRecruiter },
        });
    }

    async sendInvoicePaid(
        email: string,
        data: InvoicePaidData & { companyId?: string }
    ): Promise<void> {
        const html = invoicePaidEmail(data);

        await this.sendEmail(email, `Payment Received — ${data.amount}`, html, {
            eventType: 'invoice.paid',
            category: 'billing',
            actionUrl: data.billingUrl,
            actionLabel: 'View Billing Dashboard',
            payload: { company_id: data.companyId, amount: data.amount, invoice_number: data.invoiceNumber },
        });
    }

    async sendSubscriptionCancelled(
        email: string,
        data: SubscriptionCancelledData & { companyId?: string }
    ): Promise<void> {
        const html = subscriptionCancelledEmail(data);

        await this.sendEmail(email, 'Subscription Cancelled', html, {
            eventType: 'subscription.cancelled',
            category: 'billing',
            actionUrl: data.billingUrl,
            actionLabel: 'Manage Subscription',
            payload: { company_id: data.companyId, plan_name: data.planName },
        });
    }
}
