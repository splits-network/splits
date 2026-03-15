import Stripe from 'stripe';
import { Logger } from '@splits-network/shared-logging';
import { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';
import { IEventPublisher } from '../shared/events';

/**
 * V2 Webhook Service
 * Handles Stripe webhook events with proper domain event publishing.
 */
export class WebhookServiceV2 {
    private stripe: Stripe;

    constructor(
        private supabase: SupabaseClient,
        private logger: Logger,
        private eventPublisher: IEventPublisher,
        stripeSecretKey?: string
    ) {
        this.stripe = new Stripe(stripeSecretKey || process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-11-17.clover',
        });
    }

    async handleStripeWebhook(event: Stripe.Event): Promise<void> {
        this.logger.info({ type: event.type }, 'Processing Stripe webhook');

        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            case 'account.updated':
                await this.handleAccountUpdated(event.data.object as Stripe.Account);
                break;

            case 'transfer.created':
            case 'transfer.updated':
            case 'transfer.reversed':
                await this.handleTransferEvent(event.type, event.data.object as Stripe.Transfer);
                break;
            case 'payout.paid':
            case 'payout.failed':
            case 'payout.canceled':
                await this.handlePayoutEvent(event.type, event.data.object as Stripe.Payout);
                break;

            case 'balance.available':
                await this.handleBalanceAvailable(event.data.object as Stripe.Balance);
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

            case 'invoice.voided':
                await this.handleInvoiceVoided(event.data.object as Stripe.Invoice);
                break;

            case 'payment_method.attached':
                await this.handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
                break;

            case 'payment_method.updated':
                await this.handlePaymentMethodUpdated(event.data.object as Stripe.PaymentMethod);
                break;

            case 'payment_method.detached':
                await this.handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);
                break;

            case 'customer.deleted':
                await this.handleCustomerDeleted(event.data.object as Stripe.Customer);
                break;

            default:
                this.logger.debug({ type: event.type }, 'Unhandled webhook event type');
        }
    }

    // ========================================================================
    // Connect account events
    // ========================================================================

    private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
        if (!account.id) return;

        const onboarded = !!account.charges_enabled && !!account.payouts_enabled && !!account.details_submitted;
        const onboardedAt = onboarded ? new Date().toISOString() : null;

        const { data: recruiter } = await this.supabase
            .from('recruiters')
            .select('id, stripe_connect_onboarded')
            .eq('stripe_connect_account_id', account.id)
            .single();

        const previouslyOnboarded = !!recruiter?.stripe_connect_onboarded;

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
            return;
        }

        if (recruiter?.id) {
            if (!previouslyOnboarded && onboarded) {
                await this.eventPublisher.publish('recruiter.stripe_connect_onboarded', {
                    recruiter_id: recruiter.id,
                    account_id: account.id,
                    onboarded_at: onboardedAt,
                });
                this.logger.info({ recruiter_id: recruiter.id, account_id: account.id }, 'Published recruiter.stripe_connect_onboarded event');
            } else if (previouslyOnboarded && !onboarded) {
                await this.eventPublisher.publish('recruiter.stripe_connect_disabled', {
                    recruiter_id: recruiter.id,
                    account_id: account.id,
                    disabled_reason: (account.requirements as any)?.disabled_reason || 'requirements_changed',
                });
                this.logger.info({ recruiter_id: recruiter.id, account_id: account.id }, 'Published recruiter.stripe_connect_disabled event');
            }
        }
    }

    // ========================================================================
    // Subscription events
    // ========================================================================

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
            return;
        }

        await this.eventPublisher.publish('subscription.webhook_updated', {
            stripe_subscription_id: subscription.id,
            status: subscription.status,
        });

        // Check if this subscription change affects any owned firms
        await this.checkFirmOwnerSubscription(subscription.id);
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
            return;
        }

        await this.eventPublisher.publish('subscription.webhook_canceled', {
            stripe_subscription_id: subscription.id,
        });

        // Check if this cancellation affects any owned firms
        await this.checkFirmOwnerSubscription(subscription.id);
    }

    // ========================================================================
    // Firm owner subscription check
    // ========================================================================

    private async checkFirmOwnerSubscription(stripeSubscriptionId: string): Promise<void> {
        try {
            // Find the subscription record with plan tier
            const { data: sub } = await this.supabase
                .from('subscriptions')
                .select('user_id, status, plan:plans(tier)')
                .eq('stripe_subscription_id', stripeSubscriptionId)
                .single();

            if (!sub) return;

            // Find firms owned by this user
            const { data: firms } = await this.supabase
                .from('firms')
                .select('id, status')
                .eq('owner_user_id', sub.user_id);

            if (!firms?.length) return;

            const isPartner = sub.status === 'active' && (sub as any).plan?.tier === 'partner';
            const now = new Date().toISOString();

            for (const firm of firms) {
                if (!isPartner && firm.status === 'active') {
                    // Suspend: owner lost partner tier
                    await this.supabase
                        .from('firms')
                        .update({ status: 'suspended', updated_at: now })
                        .eq('id', firm.id);

                    this.logger.info({ firmId: firm.id, userId: sub.user_id }, 'Firm suspended: owner lost partner subscription');

                    await this.eventPublisher.publish('firm.suspended', {
                        firmId: firm.id,
                        reason: 'owner_subscription_lapsed',
                    });
                } else if (isPartner && firm.status === 'suspended') {
                    // Reactivate: owner regained partner tier
                    await this.supabase
                        .from('firms')
                        .update({ status: 'active', updated_at: now })
                        .eq('id', firm.id);

                    this.logger.info({ firmId: firm.id, userId: sub.user_id }, 'Firm reactivated: owner regained partner subscription');

                    await this.eventPublisher.publish('firm.reactivated', {
                        firmId: firm.id,
                    });
                }
            }
        } catch (err) {
            this.logger.error({ err, stripeSubscriptionId }, 'Failed to check firm owner subscription status');
        }
    }

    // ========================================================================
    // Transfer / payout events
    // ========================================================================

    private async handleTransferEvent(eventType: string, transfer: Stripe.Transfer): Promise<void> {
        if (!transfer.id) return;

        const status =
            eventType === 'transfer.created'
                ? 'paid'
                : eventType === 'transfer.reversed'
                    ? 'reversed'
                    : 'processing';

        const updates: Record<string, any> = {
            status,
            updated_at: new Date().toISOString(),
        };

        if (status === 'processing') {
            updates.processing_started_at = new Date().toISOString();
        }

        if (status === 'paid') {
            updates.completed_at = new Date().toISOString();
        }

        const { error } = await this.supabase
            .from('placement_payout_transactions')
            .update(updates)
            .eq('stripe_transfer_id', transfer.id);

        if (error) {
            this.logger.error({ err: error, transfer_id: transfer.id }, 'Failed to update payout transaction from transfer');
        }
    }

    private async handlePayoutEvent(eventType: string, payout: Stripe.Payout): Promise<void> {
        if (!payout.id) return;

        const status =
            eventType === 'payout.paid'
                ? 'paid'
                : eventType === 'payout.failed' || eventType === 'payout.canceled'
                    ? 'failed'
                    : 'processing';

        const updates: Record<string, any> = {
            status,
            updated_at: new Date().toISOString(),
        };

        if (status === 'paid') {
            updates.completed_at = new Date().toISOString();
        }

        if (status === 'failed') {
            updates.failed_at = new Date().toISOString();
            updates.failure_reason = payout.failure_message || 'Stripe payout failed';
        }

        const transferIds = await this.getTransferIdsForPayout(payout.id);

        if (transferIds.length === 0) {
            this.logger.warn(
                { payout_id: payout.id, metric: 'stripe_payout_missing_transfers', value: 1 },
                'No transfer IDs found for payout; attempting payout_id match'
            );
            if (process.env.SENTRY_DSN) {
                Sentry.captureMessage('Stripe payout missing transfers', {
                    level: 'warning',
                    tags: { module: 'billing-webhooks' },
                    extra: { payout_id: payout.id },
                });
            }
            const { error } = await this.supabase
                .from('placement_payout_transactions')
                .update({ ...updates, stripe_payout_id: payout.id })
                .eq('stripe_payout_id', payout.id);

            if (error) {
                this.logger.error({ err: error, payout_id: payout.id }, 'Failed to update payout transaction from payout');
            }
            return;
        }

        const { error } = await this.supabase
            .from('placement_payout_transactions')
            .update({ ...updates, stripe_payout_id: payout.id })
            .in('stripe_transfer_id', transferIds);

        if (error) {
            this.logger.error({ err: error, payout_id: payout.id }, 'Failed to update payout transaction from payout transfers');
        }

        // When funds settle (payout.paid), mark associated invoices as funds-available
        if (eventType === 'payout.paid') {
            await this.handleIncomingFundsAvailable(payout);
        }
    }

    /**
     * Handle when Stripe settles incoming customer payments into our available balance.
     * This allows us to process transfers immediately instead of waiting for settlement delay.
     */
    private async handleIncomingFundsAvailable(payout: Stripe.Payout): Promise<void> {
        this.logger.info({ payout_id: payout.id, amount: payout.amount / 100 }, 'Processing incoming funds availability from payout.paid');

        try {
            let startingAfter: string | undefined = undefined;

            while (true) {
                const response: Stripe.ApiList<Stripe.BalanceTransaction> = await this.stripe.balanceTransactions.list({
                    payout: payout.id,
                    limit: 100,
                    expand: ['data.source'],
                    ...(startingAfter ? { starting_after: startingAfter } : {}),
                });

                for (const transaction of response.data) {
                    if (transaction.type === 'charge' && transaction.source) {
                        const charge = transaction.source as any;
                        if (charge.invoice) {
                            const { error } = await this.supabase
                                .from('placement_invoices')
                                .update({
                                    funds_available: true,
                                    funds_available_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                })
                                .eq('stripe_invoice_id', charge.invoice);

                            if (error) {
                                this.logger.error({
                                    err: error,
                                    invoice_id: charge.invoice,
                                    payout_id: payout.id
                                }, 'Failed to mark invoice funds as available');
                                continue;
                            }

                            this.logger.info({
                                invoice_id: charge.invoice,
                                payout_id: payout.id,
                                amount: transaction.amount / 100
                            }, 'Invoice funds now available - can process transfers immediately');

                            try {
                                await this.eventPublisher.publish('invoice.funds_available', {
                                    stripe_invoice_id: charge.invoice,
                                    payout_id: payout.id,
                                    amount_available: transaction.amount / 100,
                                    available_at: new Date().toISOString()
                                });
                            } catch (eventError) {
                                this.logger.error({ err: eventError, invoice_id: charge.invoice }, 'Failed to publish invoice.funds_available event');
                            }
                        }
                    }
                }

                if (!response.has_more) break;
                startingAfter = response.data[response.data.length - 1]?.id;
                if (!startingAfter) break;
            }
        } catch (error) {
            this.logger.error({ err: error, payout_id: payout.id }, 'Failed to process incoming funds availability');
        }
    }

    /**
     * Handle balance.available event - fires when available balance increases.
     * Marks pending invoices as funds-available (broad approach, less precise than payout.paid).
     */
    private async handleBalanceAvailable(balance: Stripe.Balance): Promise<void> {
        this.logger.info({
            available_usd: balance.available.find(b => b.currency === 'usd')?.amount || 0,
            pending_usd: balance.pending.find(b => b.currency === 'usd')?.amount || 0
        }, 'Balance available event received - checking for newly available invoice funds');

        try {
            const { data: pendingInvoices, error } = await this.supabase
                .from('placement_invoices')
                .select('id, stripe_invoice_id, paid_at')
                .eq('invoice_status', 'paid')
                .eq('funds_available', false)
                .not('paid_at', 'is', null)
                .order('paid_at', { ascending: true })
                .limit(50);

            if (error) {
                this.logger.error({ err: error }, 'Failed to query pending invoice funds');
                return;
            }

            if (!pendingInvoices || pendingInvoices.length === 0) {
                this.logger.debug('No pending invoice funds to update on balance.available');
                return;
            }

            const now = new Date().toISOString();
            const invoiceIds = pendingInvoices.map(inv => inv.id);

            const { error: updateError } = await this.supabase
                .from('placement_invoices')
                .update({
                    funds_available: true,
                    funds_available_at: now,
                    updated_at: now
                })
                .in('id', invoiceIds);

            if (updateError) {
                this.logger.error({ err: updateError }, 'Failed to update invoice funds availability');
                return;
            }

            this.logger.info({
                updated_count: invoiceIds.length,
                invoice_ids: invoiceIds
            }, 'Marked invoice funds as available via balance.available event');

            for (const invoice of pendingInvoices) {
                if (invoice.stripe_invoice_id) {
                    try {
                        await this.eventPublisher.publish('invoice.funds_available', {
                            stripe_invoice_id: invoice.stripe_invoice_id,
                            detection_method: 'balance.available',
                            available_at: now
                        });
                    } catch (eventError) {
                        this.logger.error({
                            err: eventError,
                            invoice_id: invoice.stripe_invoice_id
                        }, 'Failed to publish invoice.funds_available event from balance.available');
                    }
                }
            }
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to process balance.available event');
        }
    }

    // ========================================================================
    // Invoice events
    // ========================================================================

    private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
        if (!invoice.id) return;

        const paidDate = invoice.status_transitions?.paid_at
            ? new Date(invoice.status_transitions.paid_at * 1000)
            : new Date();

        // 7-day settlement buffer for all payment methods (credit card 2 days, ACH 3-5 days)
        const settlementDate = new Date(paidDate);
        settlementDate.setDate(settlementDate.getDate() + 7);

        const updates: Record<string, any> = {
            invoice_status: 'paid',
            amount_paid: (invoice.amount_paid ?? 0) / 100,
            paid_at: paidDate.toISOString(),
            collectible_at: settlementDate.toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { error } = await this.supabase
            .from('placement_invoices')
            .update(updates)
            .eq('stripe_invoice_id', invoice.id);

        if (error) {
            this.logger.error({ err: error, invoice_id: invoice.id }, 'Failed to update placement invoice to paid');
            return;
        }

        this.logger.info({
            invoice_id: invoice.id,
            paid_at: paidDate.toISOString(),
            collectible_at: settlementDate.toISOString()
        }, 'Invoice marked as paid with settlement buffer');

        try {
            await this.eventPublisher.publish('invoice.paid', {
                stripe_invoice_id: invoice.id,
                amount_paid: (invoice.amount_paid ?? 0) / 100,
                paid_at: updates.paid_at,
            });
            this.logger.info({ invoice_id: invoice.id }, 'Published invoice.paid event for payout processing');
        } catch (eventError) {
            this.logger.error({ err: eventError, invoice_id: invoice.id }, 'Failed to publish invoice.paid event');
        }
    }

    private async handleInvoiceFailed(invoice: Stripe.Invoice): Promise<void> {
        if (!invoice.id) return;

        const { error } = await this.supabase
            .from('placement_invoices')
            .update({
                invoice_status: 'failed',
                failure_reason: invoice.last_finalization_error?.message || 'Unknown error',
                updated_at: new Date().toISOString(),
            })
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

        const { error } = await this.supabase
            .from('placement_invoices')
            .update({
                invoice_status: 'uncollectible',
                failure_reason: 'Invoice marked uncollectible',
                updated_at: new Date().toISOString(),
            })
            .eq('stripe_invoice_id', invoice.id);

        if (error) {
            this.logger.error({ err: error, invoice_id: invoice.id }, 'Failed to update placement invoice on uncollectible');
        }
    }

    private async handleInvoiceVoided(invoice: Stripe.Invoice): Promise<void> {
        if (!invoice.id) return;

        const { error } = await this.supabase
            .from('placement_invoices')
            .update({
                invoice_status: 'void',
                voided_at: invoice.status_transitions?.voided_at
                    ? new Date(invoice.status_transitions.voided_at * 1000).toISOString()
                    : new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('stripe_invoice_id', invoice.id);

        if (error) {
            this.logger.error({ err: error, invoice_id: invoice.id }, 'Failed to update placement invoice to voided');
        }
    }

    // ========================================================================
    // Payment method / customer removal events
    // ========================================================================

    /**
     * Handle payment_method.attached — a payment method was added to a customer.
     * If the billing profile has no default payment method, auto-sets it.
     */
    private async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
        if (!paymentMethod.id || !paymentMethod.customer) return;

        const pmId = paymentMethod.id;
        const customerId = typeof paymentMethod.customer === 'string'
            ? paymentMethod.customer
            : paymentMethod.customer.id;
        const now = new Date().toISOString();

        // Check company billing profiles — auto-set if no default PM
        const { data: companyProfile } = await this.supabase
            .from('company_billing_profiles')
            .select('company_id, stripe_default_payment_method_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();

        if (companyProfile && !companyProfile.stripe_default_payment_method_id) {
            await this.supabase
                .from('company_billing_profiles')
                .update({ stripe_default_payment_method_id: pmId, updated_at: now })
                .eq('company_id', companyProfile.company_id);

            this.logger.info(
                { company_id: companyProfile.company_id, payment_method_id: pmId },
                'Auto-set default payment method for company from payment_method.attached'
            );

            await this.eventPublisher.publish('company.billing_payment_method_attached', {
                company_id: companyProfile.company_id,
                payment_method_id: pmId,
            });
        }

        // Check firm billing profiles — auto-set if no default PM
        const { data: firmProfile } = await this.supabase
            .from('firm_billing_profiles')
            .select('firm_id, stripe_default_payment_method_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();

        if (firmProfile && !firmProfile.stripe_default_payment_method_id) {
            await this.supabase
                .from('firm_billing_profiles')
                .update({ stripe_default_payment_method_id: pmId, updated_at: now })
                .eq('firm_id', firmProfile.firm_id);

            this.logger.info(
                { firm_id: firmProfile.firm_id, payment_method_id: pmId },
                'Auto-set default payment method for firm from payment_method.attached'
            );

            await this.eventPublisher.publish('firm.billing_payment_method_attached', {
                firm_id: firmProfile.firm_id,
                payment_method_id: pmId,
            });
        }
    }

    /**
     * Handle payment_method.updated — card details changed (new expiry, issuer replacement, etc.).
     * Logs for audit. No job status changes needed since the PM ID remains valid.
     */
    private async handlePaymentMethodUpdated(paymentMethod: Stripe.PaymentMethod): Promise<void> {
        if (!paymentMethod.id) return;

        const pmId = paymentMethod.id;
        const customerId = typeof paymentMethod.customer === 'string'
            ? paymentMethod.customer
            : paymentMethod.customer?.id;

        this.logger.info(
            { payment_method_id: pmId, customer_id: customerId, type: paymentMethod.type },
            'Payment method updated — no action required, PM ID unchanged'
        );

        // Publish event so downstream consumers (e.g., notifications) can react if needed
        if (customerId) {
            await this.eventPublisher.publish('billing.payment_method_updated', {
                payment_method_id: pmId,
                customer_id: customerId,
                type: paymentMethod.type,
            });
        }
    }

    /**
     * Handle payment_method.detached — a payment method was removed from a customer.
     * Clears the default payment method from the matching billing profile and
     * reverts all non-draft jobs for that company/firm to draft status.
     */
    private async handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
        if (!paymentMethod.id) return;

        const pmId = paymentMethod.id;
        const now = new Date().toISOString();

        // Check company billing profiles
        const { data: companyProfile } = await this.supabase
            .from('company_billing_profiles')
            .select('company_id')
            .eq('stripe_default_payment_method_id', pmId)
            .maybeSingle();

        if (companyProfile) {
            await this.supabase
                .from('company_billing_profiles')
                .update({ stripe_default_payment_method_id: null, updated_at: now })
                .eq('stripe_default_payment_method_id', pmId);

            this.logger.info({ company_id: companyProfile.company_id, payment_method_id: pmId }, 'Cleared detached payment method from company billing profile');

            await this.revertJobsToDraft({ companyId: companyProfile.company_id });

            await this.eventPublisher.publish('company.billing_payment_method_removed', {
                company_id: companyProfile.company_id,
                payment_method_id: pmId,
            });
        }

        // Check firm billing profiles
        const { data: firmProfile } = await this.supabase
            .from('firm_billing_profiles')
            .select('firm_id')
            .eq('stripe_default_payment_method_id', pmId)
            .maybeSingle();

        if (firmProfile) {
            await this.supabase
                .from('firm_billing_profiles')
                .update({ stripe_default_payment_method_id: null, updated_at: now })
                .eq('stripe_default_payment_method_id', pmId);

            this.logger.info({ firm_id: firmProfile.firm_id, payment_method_id: pmId }, 'Cleared detached payment method from firm billing profile');

            await this.revertJobsToDraft({ firmId: firmProfile.firm_id });

            await this.eventPublisher.publish('firm.billing_payment_method_removed', {
                firm_id: firmProfile.firm_id,
                payment_method_id: pmId,
            });
        }
    }

    /**
     * Handle customer.deleted — a Stripe customer was deleted entirely.
     * Clears all Stripe fields from the matching billing profile and
     * reverts all non-draft jobs for that company/firm to draft status.
     */
    private async handleCustomerDeleted(customer: Stripe.Customer): Promise<void> {
        if (!customer.id) return;

        const customerId = customer.id;
        const now = new Date().toISOString();

        // Check company billing profiles
        const { data: companyProfile } = await this.supabase
            .from('company_billing_profiles')
            .select('company_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();

        if (companyProfile) {
            await this.supabase
                .from('company_billing_profiles')
                .update({
                    stripe_customer_id: null,
                    stripe_default_payment_method_id: null,
                    updated_at: now,
                })
                .eq('stripe_customer_id', customerId);

            this.logger.info({ company_id: companyProfile.company_id, customer_id: customerId }, 'Cleared deleted Stripe customer from company billing profile');

            await this.revertJobsToDraft({ companyId: companyProfile.company_id });

            await this.eventPublisher.publish('company.billing_customer_deleted', {
                company_id: companyProfile.company_id,
                stripe_customer_id: customerId,
            });
        }

        // Check firm billing profiles
        const { data: firmProfile } = await this.supabase
            .from('firm_billing_profiles')
            .select('firm_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();

        if (firmProfile) {
            await this.supabase
                .from('firm_billing_profiles')
                .update({
                    stripe_customer_id: null,
                    stripe_default_payment_method_id: null,
                    updated_at: now,
                })
                .eq('stripe_customer_id', customerId);

            this.logger.info({ firm_id: firmProfile.firm_id, customer_id: customerId }, 'Cleared deleted Stripe customer from firm billing profile');

            await this.revertJobsToDraft({ firmId: firmProfile.firm_id });

            await this.eventPublisher.publish('firm.billing_customer_deleted', {
                firm_id: firmProfile.firm_id,
                stripe_customer_id: customerId,
            });
        }
    }

    /**
     * Revert all non-draft jobs for a company or firm to draft status.
     * Called when billing is invalidated (payment method removed, customer deleted).
     */
    private async revertJobsToDraft(params: { companyId?: string; firmId?: string }): Promise<void> {
        const { companyId, firmId } = params;
        const now = new Date().toISOString();
        const activeStatuses = ['pending', 'active', 'paused'];

        try {
            let query = this.supabase
                .from('jobs')
                .update({ status: 'draft', updated_at: now })
                .in('status', activeStatuses);

            if (companyId) {
                query = query.eq('company_id', companyId);
            } else if (firmId) {
                query = query.eq('source_firm_id', firmId);
            } else {
                return;
            }

            const { data, error } = await query.select('id');

            if (error) {
                this.logger.error({ err: error, companyId, firmId }, 'Failed to revert jobs to draft after billing invalidation');
                return;
            }

            const revertedCount = data?.length || 0;
            if (revertedCount > 0) {
                const entityType = companyId ? 'company' : 'firm';
                const entityId = companyId || firmId;
                this.logger.info(
                    { entityType, entityId, revertedCount, jobIds: data?.map(j => j.id) },
                    `Reverted ${revertedCount} jobs to draft: billing invalidated`
                );

                await this.eventPublisher.publish('jobs.billing_reverted_to_draft', {
                    entity_type: entityType,
                    entity_id: entityId,
                    reverted_count: revertedCount,
                    job_ids: data?.map(j => j.id) || [],
                });
            }
        } catch (err) {
            this.logger.error({ err, companyId, firmId }, 'Failed to revert jobs to draft');
        }
    }

    // ========================================================================
    // Helpers
    // ========================================================================

    private async getTransferIdsForPayout(payoutId: string): Promise<string[]> {
        const transferIds: string[] = [];
        let startingAfter: string | undefined = undefined;

        try {
            while (true) {
                const response: Stripe.ApiList<Stripe.BalanceTransaction> = await this.stripe.balanceTransactions.list({
                    payout: payoutId,
                    limit: 100,
                    ...(startingAfter ? { starting_after: startingAfter } : {}),
                });

                for (const balanceTx of response.data) {
                    const source = balanceTx.source;
                    if (typeof source === 'string' && source.startsWith('tr_')) {
                        transferIds.push(source);
                    }
                }

                if (!response.has_more) break;
                startingAfter = response.data[response.data.length - 1]?.id;
                if (!startingAfter) break;
            }
        } catch (error) {
            this.logger.error({ err: error, payout_id: payoutId }, 'Failed to load payout balance transactions');
        }

        return Array.from(new Set(transferIds));
    }
}
