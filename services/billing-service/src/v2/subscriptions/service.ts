import Stripe from 'stripe';
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
} from './types';

export class SubscriptionServiceV2 {
    private stripe: Stripe;

    constructor(
        private repository: SubscriptionRepository,
        private planRepository: PlanRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: EventPublisher,
        stripeSecretKey?: string
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

        const updated = await this.repository.updateSubscription(id, updates);
        await this.publishEvent('subscription.updated', {
            id: updated.id,
            changes: updates,
        });

        return updated;
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
            const customer = await this.stripe.customers.create({
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
        const stripeSubscription = await this.stripe.subscriptions.create({
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
        });

        // Calculate period end from Stripe response
        // Stripe subscription's current_period_end is a Unix timestamp
        const periodEndTimestamp = (stripeSubscription as any).current_period_end;
        const periodEnd = periodEndTimestamp
            ? new Date(periodEndTimestamp * 1000).toISOString()
            : null;

        // Create local subscription record
        const subscription = await this.repository.createSubscription({
            user_id: access.identityUserId,
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

    private async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publish(eventType, payload);
    }
}
