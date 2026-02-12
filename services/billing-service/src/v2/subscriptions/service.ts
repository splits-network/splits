import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { EventPublisher } from '../shared/events';
import { buildPaginationResponse, isBillingAdmin } from '../shared/helpers';
import type { AccessContext } from '../shared/access';
import { PlanRepository } from '../plans/repository';
import { SubscriptionRepository } from './repository';
import {
    SubscriptionCreateInput,
    SubscriptionListFilters,
    SubscriptionUpdateInput,
    SetupIntentRequest,
    SetupIntentResponse,
    ActivateSubscriptionRequest,
    ActivateSubscriptionResponse,
    PaymentMethodResponse,
    PaymentMethodDetails,
    UpdatePaymentMethodResponse,
    InvoicesResponse,
    Invoice,
} from './types';

export class SubscriptionServiceV2 {
    private stripe: Stripe;

    constructor(
        private repository: SubscriptionRepository,
        private planRepository: PlanRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: EventPublisher,
        stripeSecretKey?: string,
        private supabase?: SupabaseClient
    ) {
        this.stripe = new Stripe(stripeSecretKey || process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-11-17.clover',
        });
    }

    async getSubscriptions(
        filters: SubscriptionListFilters = {},
        clerkUserId: string
    ): Promise<{
        data: any[];
        pagination: ReturnType<typeof buildPaginationResponse>;
    }> {
        const access = await this.resolveAccessContext(clerkUserId);
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;

        const effectiveFilters = { ...filters };
        if (!isBillingAdmin(access)) {
            if (!access.identityUserId) {
                return {
                    data: [],
                    pagination: buildPaginationResponse(page, limit, 0),
                };
            }
            effectiveFilters.user_id = access.identityUserId;
        }

        const { data, total } = await this.repository.listSubscriptions(effectiveFilters);
        return {
            data,
            pagination: buildPaginationResponse(page, limit, total),
        };
    }

    async getSubscription(id: string, clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        const subscription = await this.repository.findSubscription(id);
        if (!subscription) {
            throw new Error(`Subscription ${id} not found`);
        }

        if (!isBillingAdmin(access)) {
            if (!access.identityUserId || subscription.user_id !== access.identityUserId) {
                throw new Error('Not authorized to view this subscription');
            }
        }

        return subscription;
    }

    async getSubscriptionByClerkId(clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.identityUserId) {
            throw new Error('Unable to resolve user for subscription');
        }

        const subscription = await this.repository.findByUserId(access.identityUserId);
        if (!subscription) {
            throw new Error('No active subscription found');
        }

        return subscription;
    }

    async createSubscription(payload: SubscriptionCreateInput, clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        const admin = isBillingAdmin(access);

        if (!payload.plan_id) {
            throw new Error('plan_id is required');
        }

        if (!admin) {
            if (!access.identityUserId) {
                throw new Error('Unable to resolve user for subscription');
            }
            payload.user_id = access.identityUserId;
        } else if (!payload.user_id) {
            throw new Error('user_id is required');
        }

        const plan = await this.planRepository.findPlan(payload.plan_id);
        if (!plan) {
            throw new Error('Plan not found');
        }

        const subscription = await this.repository.createSubscription({
            ...payload,
            recruiter_id: access.recruiterId || null,
            status: payload.status || 'active',
            current_period_start: payload.current_period_start || new Date().toISOString(),
        });

        await this.publishEvent('subscription.created', subscription);
        return subscription;
    }

    async updateSubscription(
        id: string,
        updates: SubscriptionUpdateInput,
        clerkUserId: string
    ): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        const admin = isBillingAdmin(access);
        const subscription = await this.repository.findSubscription(id);

        if (!subscription) {
            throw new Error(`Subscription ${id} not found`);
        }

        if (!admin) {
            if (!access.identityUserId || subscription.user_id !== access.identityUserId) {
                throw new Error('Not authorized to update this subscription');
            }
            if (updates.status) {
                throw new Error('Status changes require billing admin role');
            }
        }

        // Handle Stripe plan/billing period changes
        if ((updates.plan_id || updates.billing_period) && subscription.stripe_subscription_id) {
            await this.handleStripePlanChange(subscription, updates);
        }

        const updated = await this.repository.updateSubscription(id, updates);
        await this.publishEvent('subscription.updated', {
            id: updated.id,
            changes: updates,
        });

        return updated;
    }

    /**
     * Handle Stripe subscription updates when plan or billing period changes.
     * Implements proration for immediate billing adjustments.
     */
    private async handleStripePlanChange(
        subscription: any,
        updates: SubscriptionUpdateInput
    ): Promise<void> {
        const newPlanId = updates.plan_id || subscription.plan_id;
        const newBillingPeriod = updates.billing_period || subscription.billing_period || 'monthly';

        // Get the plan details
        const newPlan = await this.planRepository.findPlan(newPlanId);
        if (!newPlan) {
            throw new Error('Plan not found');
        }

        // For free tier, we don't update Stripe
        if (newPlan.tier === 'starter' || newPlan.price_monthly === 0) {
            return;
        }

        // Get the correct price ID based on billing period
        const priceId = newBillingPeriod === 'annual'
            ? newPlan.stripe_price_id_annual
            : newPlan.stripe_price_id_monthly;

        if (!priceId) {
            throw new Error(`Plan does not have Stripe pricing configured for ${newBillingPeriod} billing`);
        }

        // Get current Stripe subscription to find the subscription item ID
        const stripeSubscription = await this.stripe.subscriptions.retrieve(
            subscription.stripe_subscription_id
        );
        const itemId = stripeSubscription.items.data[0]?.id;

        if (!itemId) {
            throw new Error('Unable to find subscription item for plan change');
        }

        // Update Stripe subscription with proration
        const updatedStripeSub = await this.stripe.subscriptions.update(subscription.stripe_subscription_id, {
            items: [{ id: itemId, price: priceId }],
            proration_behavior: 'create_prorations',
            metadata: {
                ...stripeSubscription.metadata,
                plan_id: newPlanId,
                billing_period: newBillingPeriod,
            },
        });

        // Update the period end from Stripe response
        const periodEndTimestamp = (updatedStripeSub as any).current_period_end;
        if (periodEndTimestamp) {
            updates.current_period_end = new Date(periodEndTimestamp * 1000).toISOString();
        }
    }

    async cancelSubscription(id: string, clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        const admin = isBillingAdmin(access);
        const subscription = await this.repository.findSubscription(id);

        if (!subscription) {
            throw new Error(`Subscription ${id} not found`);
        }

        if (!admin) {
            if (!access.identityUserId || subscription.user_id !== access.identityUserId) {
                throw new Error('Not authorized to cancel this subscription');
            }
        }

        const updated = await this.repository.updateSubscription(id, {
            status: 'canceled',
            cancel_at: new Date().toISOString(),
            canceled_at: new Date().toISOString(),
        } as SubscriptionUpdateInput);

        await this.publishEvent('subscription.canceled', {
            id: updated.id,
        });

        return updated;
    }

    /**
     * Create a Stripe SetupIntent for collecting payment method during onboarding.
     * Creates a Stripe Customer if one doesn't exist for the user.
     */
    async createSetupIntent(
        request: SetupIntentRequest,
        clerkUserId: string
    ): Promise<SetupIntentResponse> {
        const access = await this.resolveAccessContext(clerkUserId);

        if (!access.identityUserId) {
            throw new Error('Unable to resolve user for setup intent');
        }

        // Validate the plan exists
        const plan = await this.planRepository.findPlan(request.plan_id);
        if (!plan) {
            throw new Error('Plan not found');
        }

        // Check if user already has a Stripe customer ID
        const existingSub = await this.repository.findByUserId(access.identityUserId);
        let customerId = existingSub?.stripe_customer_id;

        // Create Stripe Customer if needed
        if (!customerId) {
            // Fetch user email/name for Stripe customer record
            let userEmail: string | undefined;
            let userName: string | undefined;
            if (this.supabase) {
                const { data: user } = await this.supabase
                    .from('users')
                    .select('email, name')
                    .eq('id', access.identityUserId)
                    .single();
                userEmail = user?.email || undefined;
                userName = user?.name || undefined;
            }

            const customer = await this.stripe.customers.create({
                email: userEmail,
                name: userName,
                metadata: {
                    user_id: access.identityUserId,
                    clerk_user_id: clerkUserId,
                    plan_id: request.plan_id,
                },
            });
            customerId = customer.id;
        }

        // Create SetupIntent for collecting payment method
        const setupIntent = await this.stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: ['card'],
            metadata: {
                user_id: access.identityUserId,
                clerk_user_id: clerkUserId,
                plan_id: request.plan_id,
            },
        });

        return {
            client_secret: setupIntent.client_secret!,
            customer_id: customerId,
            plan_id: request.plan_id,
        };
    }

    /**
     * Activate a subscription after payment method collection.
     * Creates the Stripe subscription immediately (no trial periods).
     */
    async activateSubscription(
        request: ActivateSubscriptionRequest,
        clerkUserId: string
    ): Promise<ActivateSubscriptionResponse> {
        const access = await this.resolveAccessContext(clerkUserId);

        if (!access.identityUserId) {
            throw new Error('Unable to resolve user for subscription activation');
        }

        // Validate the plan exists and get details
        const plan = await this.planRepository.findPlan(request.plan_id);
        if (!plan) {
            throw new Error('Plan not found');
        }

        // Determine billing period (default to monthly)
        const billingPeriod = request.billing_period || 'monthly';

        // For free tier, create subscription without Stripe
        if (plan.tier === 'starter' || plan.price_monthly === 0) {
            const subscription = await this.repository.createSubscription({
                user_id: access.identityUserId,
                recruiter_id: access.recruiterId || null,
                plan_id: request.plan_id,
                status: 'active',
                current_period_start: new Date().toISOString(),
            });

            await this.publishEvent('subscription.created', {
                ...subscription,
                tier: plan.tier,
            });

            return {
                subscription_id: subscription.id,
                status: 'active',
                trial_end: null,
                current_period_end: null,
            };
        }

        // For paid plans, create Stripe subscription
        if (!request.payment_method_id || !request.customer_id) {
            throw new Error('Payment method and customer ID required for paid plans');
        }

        // Attach payment method to customer
        await this.stripe.paymentMethods.attach(request.payment_method_id, {
            customer: request.customer_id,
        });

        // Set as default payment method
        await this.stripe.customers.update(request.customer_id, {
            invoice_settings: {
                default_payment_method: request.payment_method_id,
            },
        });

        // Get the correct Stripe price ID based on billing period
        const stripePriceId = billingPeriod === 'annual'
            ? plan.stripe_price_id_annual
            : plan.stripe_price_id_monthly;

        if (!stripePriceId) {
            throw new Error(`Plan does not have a valid Stripe price configured for ${billingPeriod} billing`);
        }

        // Create Stripe subscription (charge immediately - no trial)
        const subscriptionCreateParams: Stripe.SubscriptionCreateParams = {
            customer: request.customer_id,
            items: [{ price: stripePriceId }],
            payment_settings: {
                payment_method_types: ['card'],
                save_default_payment_method: 'on_subscription',
            },
            metadata: {
                user_id: access.identityUserId,
                clerk_user_id: clerkUserId,
                plan_id: request.plan_id,
                billing_period: billingPeriod,
            },
        };

        // Apply promotion code if provided
        if (request.promotion_code) {
            (subscriptionCreateParams as any).promotion_code = request.promotion_code;
        }

        const stripeSubscription = await this.stripe.subscriptions.create(subscriptionCreateParams);

        // Calculate period end from Stripe response
        // Stripe subscription's current_period_end is a Unix timestamp
        const periodEndTimestamp = (stripeSubscription as any).current_period_end;
        const periodEnd = periodEndTimestamp
            ? new Date(periodEndTimestamp * 1000).toISOString()
            : null;

        // Create local subscription record
        const subscription = await this.repository.createSubscription({
            user_id: access.identityUserId,
            recruiter_id: access.recruiterId || null,
            plan_id: request.plan_id,
            status: 'active',
            stripe_subscription_id: stripeSubscription.id,
            stripe_customer_id: request.customer_id,
            current_period_start: new Date().toISOString(),
            current_period_end: periodEnd,
        });

        await this.publishEvent('subscription.created', {
            ...subscription,
            tier: plan.tier,
            billing_period: billingPeriod,
        });

        return {
            subscription_id: subscription.id,
            status: 'active',
            trial_end: null,
            current_period_end: periodEnd,
        };
    }

    /**
     * Get payment method information from Stripe.
     * We NEVER store payment data in our database - always fetch from Stripe.
     */
    async getPaymentMethods(clerkUserId: string): Promise<PaymentMethodResponse> {
        const access = await this.resolveAccessContext(clerkUserId);

        if (!access.identityUserId) {
            throw new Error('Unable to resolve user for payment methods');
        }

        // Get the subscription to find the Stripe customer ID
        const subscription = await this.repository.findByUserId(access.identityUserId);
        
        if (!subscription?.stripe_customer_id) {
            return {
                has_payment_method: false,
                default_payment_method: null,
            };
        }

        try {
            // Fetch customer with expanded payment method from Stripe
            const customer = await this.stripe.customers.retrieve(subscription.stripe_customer_id, {
                expand: ['invoice_settings.default_payment_method'],
            });

            // Handle deleted customers
            if ((customer as any).deleted) {
                return {
                    has_payment_method: false,
                    default_payment_method: null,
                };
            }

            const defaultPaymentMethod = (customer as Stripe.Customer).invoice_settings?.default_payment_method;
            
            if (!defaultPaymentMethod || typeof defaultPaymentMethod === 'string') {
                return {
                    has_payment_method: false,
                    default_payment_method: null,
                };
            }

            const paymentMethod = defaultPaymentMethod as Stripe.PaymentMethod;
            const card = paymentMethod.card;

            if (!card) {
                return {
                    has_payment_method: false,
                    default_payment_method: null,
                };
            }

            const paymentMethodDetails: PaymentMethodDetails = {
                id: paymentMethod.id,
                brand: card.brand,
                last4: card.last4,
                exp_month: card.exp_month,
                exp_year: card.exp_year,
            };

            return {
                has_payment_method: true,
                default_payment_method: paymentMethodDetails,
            };
        } catch (error: any) {
            // If customer doesn't exist in Stripe, return no payment method
            if (error.code === 'resource_missing') {
                return {
                    has_payment_method: false,
                    default_payment_method: null,
                };
            }
            throw error;
        }
    }

    /**
     * Update the default payment method for a user.
     * Attaches the new payment method to the customer and sets it as default.
     */
    async updatePaymentMethod(
        clerkUserId: string,
        paymentMethodId: string
    ): Promise<UpdatePaymentMethodResponse> {
        const access = await this.resolveAccessContext(clerkUserId);

        if (!access.identityUserId) {
            throw new Error('Unable to resolve user for payment method update');
        }

        // Get the subscription to find the Stripe customer ID
        const subscription = await this.repository.findByUserId(access.identityUserId);
        
        if (!subscription?.stripe_customer_id) {
            throw new Error('No active subscription found. Cannot update payment method.');
        }

        // Attach payment method to customer
        await this.stripe.paymentMethods.attach(paymentMethodId, {
            customer: subscription.stripe_customer_id,
        });

        // Set as default payment method
        await this.stripe.customers.update(subscription.stripe_customer_id, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // Fetch the payment method details to return
        const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
        const card = paymentMethod.card;

        if (!card) {
            throw new Error('Payment method is not a card');
        }

        const paymentMethodDetails: PaymentMethodDetails = {
            id: paymentMethod.id,
            brand: card.brand,
            last4: card.last4,
            exp_month: card.exp_month,
            exp_year: card.exp_year,
        };

        await this.publishEvent('subscription.payment_method_updated', {
            user_id: access.identityUserId,
            payment_method_id: paymentMethodId,
            last4: card.last4,
        });

        return {
            success: true,
            payment_method: paymentMethodDetails,
        };
    }

    /**
     * Get invoices/billing history from Stripe.
     * We NEVER store invoice data in our database - always fetch from Stripe.
     */
    async getInvoices(clerkUserId: string, limit: number = 10): Promise<InvoicesResponse> {
        const access = await this.resolveAccessContext(clerkUserId);

        if (!access.identityUserId) {
            throw new Error('Unable to resolve user for invoices');
        }

        // Get the subscription to find the Stripe customer ID
        const subscription = await this.repository.findByUserId(access.identityUserId);
        
        if (!subscription?.stripe_customer_id) {
            return {
                invoices: [],
                has_more: false,
            };
        }

        try {
            // Fetch invoices from Stripe
            const stripeInvoices = await this.stripe.invoices.list({
                customer: subscription.stripe_customer_id,
                limit: limit,
            });

            const invoices: Invoice[] = stripeInvoices.data.map((invoice) => ({
                id: invoice.id,
                number: invoice.number,
                amount_due: invoice.amount_due,
                amount_paid: invoice.amount_paid,
                currency: invoice.currency,
                status: invoice.status as Invoice['status'],
                created: new Date(invoice.created * 1000).toISOString(),
                invoice_pdf: invoice.invoice_pdf ?? null,
                period_start: new Date(invoice.period_start * 1000).toISOString(),
                period_end: new Date(invoice.period_end * 1000).toISOString(),
            }));

            return {
                invoices,
                has_more: stripeInvoices.has_more,
            };
        } catch (error: any) {
            // If customer doesn't exist in Stripe, return empty invoices
            if (error.code === 'resource_missing') {
                return {
                    invoices: [],
                    has_more: false,
                };
            }
            throw error;
        }
    }

    private async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publish(eventType, payload);
    }
}
