import Stripe from 'stripe';
import { Logger } from '@splits-network/shared-logging';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Webhook Service
 * Handles Stripe webhook events
 * TODO: Migrate to V2 architecture with proper event publishing
 */
export class WebhookService {
    constructor(
        private supabase: SupabaseClient,
        private logger: Logger
    ) {}

    async handleStripeWebhook(event: Stripe.Event): Promise<void> {
        this.logger.info({ type: event.type }, 'Processing Stripe webhook');

        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                // TODO: Replace with V2 event publishing when webhooks are migrated
                this.logger.info({ event_type: event.type }, 'Subscription webhook received - needs V2 migration');
                break;

            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                // TODO: Replace with V2 event publishing when webhooks are migrated
                this.logger.info({ event_type: event.type }, 'Subscription deletion webhook received - needs V2 migration');
                break;

            case 'account.updated':
                await this.handleAccountUpdated(event.data.object as Stripe.Account);
                break;

            case 'transfer.created':
            case 'transfer.updated':
            case 'transfer.reversed':
                await this.handleTransferEvent(event.type, event.data.object as Stripe.Transfer);
                break;

            case 'invoice.payment_succeeded':
                await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
                break;

            case 'invoice.payment_failed':
                await this.handleInvoiceFailed(event.data.object as Stripe.Invoice);
                break;

            case 'invoice.finalized':
                await this.handleInvoiceFinalized(event.data.object as Stripe.Invoice);
                break;

            case 'invoice.marked_uncollectible':
                await this.handleInvoiceMarkedUncollectible(event.data.object as Stripe.Invoice);
                break;

            default:
                this.logger.debug({ type: event.type }, 'Unhandled webhook event type');
        }
    }

    private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
        if (!account.id) return;

        const onboarded = !!account.charges_enabled && !!account.payouts_enabled && !!account.details_submitted;
        const onboardedAt = onboarded ? new Date().toISOString() : null;

        const { error } = await this.supabase
            .from('recruiters')
            .update({
                stripe_connect_onboarded: onboarded,
                stripe_connect_onboarded_at: onboardedAt,
                updated_at: new Date().toISOString(),
            })
            .eq('stripe_connect_account_id', account.id);

        if (error) {
            this.logger.error({ err: error, account_id: account.id }, 'Failed to update recruiter connect status');
        }
    }

    private async handleTransferEvent(eventType: string, transfer: Stripe.Transfer): Promise<void> {
        if (!transfer.id) return;

        const status =
            eventType === 'transfer.reversed'
                ? 'reversed'
                : 'processing';

        const updates: Record<string, any> = {
            status,
            updated_at: new Date().toISOString(),
        };

        if (status === 'processing') {
            updates.processing_started_at = new Date().toISOString();
        }

        const { error } = await this.supabase
            .from('placement_payout_transactions')
            .update(updates)
            .eq('stripe_transfer_id', transfer.id);

        if (error) {
            this.logger.error({ err: error, transfer_id: transfer.id }, 'Failed to update payout transaction from transfer');
        }
    }

    private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
        if (!invoice.id) return;

        const updates: Record<string, any> = {
            invoice_status: 'paid',
            amount_paid: (invoice.amount_paid ?? 0) / 100,
            paid_at: invoice.status_transitions?.paid_at
                ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
                : new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { error } = await this.supabase
            .from('placement_invoices')
            .update(updates)
            .eq('stripe_invoice_id', invoice.id);

        if (error) {
            this.logger.error({ err: error, invoice_id: invoice.id }, 'Failed to update placement invoice to paid');
        }
    }

    private async handleInvoiceFailed(invoice: Stripe.Invoice): Promise<void> {
        if (!invoice.id) return;

        const updates: Record<string, any> = {
            invoice_status: invoice.status === 'uncollectible' ? 'uncollectible' : 'open',
            failure_reason: invoice.last_finalization_error?.message || 'Invoice payment failed',
            updated_at: new Date().toISOString(),
        };

        const { error } = await this.supabase
            .from('placement_invoices')
            .update(updates)
            .eq('stripe_invoice_id', invoice.id);

        if (error) {
            this.logger.error({ err: error, invoice_id: invoice.id }, 'Failed to update placement invoice on failure');
        }
    }

    private async handleInvoiceFinalized(invoice: Stripe.Invoice): Promise<void> {
        if (!invoice.id) return;

        const updates: Record<string, any> = {
            invoice_status: invoice.status || 'open',
            amount_due: (invoice.amount_due ?? 0) / 100,
            amount_paid: (invoice.amount_paid ?? 0) / 100,
            hosted_invoice_url: invoice.hosted_invoice_url || null,
            invoice_pdf_url: invoice.invoice_pdf || null,
            finalized_at: invoice.status_transitions?.finalized_at
                ? new Date(invoice.status_transitions.finalized_at * 1000).toISOString()
                : new Date().toISOString(),
            due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString().slice(0, 10) : null,
            collectible_at: invoice.due_date
                ? new Date(invoice.due_date * 1000).toISOString()
                : new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { error } = await this.supabase
            .from('placement_invoices')
            .update(updates)
            .eq('stripe_invoice_id', invoice.id);

        if (error) {
            this.logger.error({ err: error, invoice_id: invoice.id }, 'Failed to update placement invoice on finalize');
        }
    }

    private async handleInvoiceMarkedUncollectible(invoice: Stripe.Invoice): Promise<void> {
        if (!invoice.id) return;

        const updates: Record<string, any> = {
            invoice_status: 'uncollectible',
            failure_reason: 'Invoice marked uncollectible',
            updated_at: new Date().toISOString(),
        };

        const { error } = await this.supabase
            .from('placement_invoices')
            .update(updates)
            .eq('stripe_invoice_id', invoice.id);

        if (error) {
            this.logger.error({ err: error, invoice_id: invoice.id }, 'Failed to update placement invoice to uncollectible');
        }
    }

    private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
        if (!subscription.id) return;

        const updates: Record<string, any> = {
            status: subscription.status,
            updated_at: new Date().toISOString(),
        };

        const itemPeriods = subscription.items?.data || [];
        const periodStarts = itemPeriods
            .map((item) => item.current_period_start)
            .filter((value): value is number => typeof value === 'number');
        const periodEnds = itemPeriods
            .map((item) => item.current_period_end)
            .filter((value): value is number => typeof value === 'number');

        if (periodStarts.length > 0) {
            updates.current_period_start = new Date(Math.min(...periodStarts) * 1000).toISOString();
        }
        if (periodEnds.length > 0) {
            updates.current_period_end = new Date(Math.max(...periodEnds) * 1000).toISOString();
        }

        const { error } = await this.supabase
            .from('subscriptions')
            .update(updates)
            .eq('stripe_subscription_id', subscription.id);

        if (error) {
            this.logger.error({ err: error, subscription_id: subscription.id }, 'Failed to update subscription from webhook');
        }
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
        if (!subscription.id) return;

        const { error } = await this.supabase
            .from('subscriptions')
            .update({
                status: 'canceled',
                canceled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

        if (error) {
            this.logger.error({ err: error, subscription_id: subscription.id }, 'Failed to cancel subscription from webhook');
        }
    }
}
