import { EventPublisher } from '../shared/events';
import { buildPaginationResponse, isBillingAdmin } from '../shared/helpers';
import type { AccessContext } from '../shared/access';
import { PlanRepository } from '../plans/repository';
import { SubscriptionRepository } from './repository';
import { StripeService } from '../shared/stripe';
import {
    SubscriptionCreateInput,
    SubscriptionListFilters,
    SubscriptionUpdateInput,
} from './types';

export class SubscriptionServiceV2 {
    constructor(
        private repository: SubscriptionRepository,
        private planRepository: PlanRepository,
        private stripeService: StripeService,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: EventPublisher
    ) { }

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
            // Default to free plan for users without a subscription
            const freePlan = await this.planRepository.findPlanBySlug('free');
            if (!freePlan) {
                throw new Error('Free plan not found - unable to provide default subscription');
            }
            
            // Return a virtual subscription object for the free plan
            return {
                id: null, // No actual subscription record
                user_id: access.identityUserId,
                plan_id: freePlan.id,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: null, // Free plan has no expiration
                plan: freePlan,
                is_virtual: true, // Flag to indicate this is not a real subscription
            };
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
     * Create a Stripe checkout session for subscription
     */
    async createCheckoutSession(
        planId: string,
        clerkUserId: string,
        successUrl?: string,
        cancelUrl?: string
    ): Promise<{ checkout_url: string; session_id: string }> {
        const access = await this.resolveAccessContext(clerkUserId);

        // Get the plan with Stripe price
        const plan = await this.planRepository.getPlanById(planId);
        if (!plan) {
            throw new Error('Plan not found');
        }

        if (!plan.stripe_price_id) {
            throw new Error('Plan does not have Stripe integration configured');
        }

        // Create or get Stripe customer
        let stripeCustomerId = '';

        // Check if user already has a subscription with Stripe customer
        const existingSubscription = await this.repository.getActiveSubscriptionByUserId(access.identityUserId!);
        if (existingSubscription?.stripe_customer_id) {
            stripeCustomerId = existingSubscription.stripe_customer_id;
        } else {
            // Get user details from identity service
            const userDetails = await this.repository.getUserDetailsByClerkId(clerkUserId);
            if (!userDetails) {
                throw new Error('User not found - user must be authenticated');
            }

            // Create new Stripe customer with proper user details
            const customer = await this.stripeService.createCustomer(
                userDetails.email || clerkUserId + '@example.com', // Fallback email if none
                userDetails.name || 'User', // User name or fallback
                {
                    user_id: access.identityUserId!,
                    clerk_user_id: clerkUserId,
                }
            );
            stripeCustomerId = customer.id;
        }

        // Create checkout session
        const session = await this.stripeService.createCheckoutSession(
            plan.stripe_price_id,
            stripeCustomerId,
            successUrl || `${process.env.FRONTEND_URL}/portal/billing/success`,
            cancelUrl || `${process.env.FRONTEND_URL}/portal/billing/canceled`,
            {
                plan_id: planId,
                user_id: access.identityUserId!,
                clerk_user_id: clerkUserId,
            }
        );

        return {
            checkout_url: session.url || '',
            session_id: session.id,
        };
    }

    /**
     * Create a Customer Portal session for managing subscription
     */
    async createPortalSession(
        clerkUserId: string,
        returnUrl?: string
    ): Promise<{ portal_url: string }> {
        const access = await this.resolveAccessContext(clerkUserId);

        // Get user's active subscription
        const subscription = await this.repository.getActiveSubscriptionByUserId(access.identityUserId!);
        if (!subscription?.stripe_customer_id) {
            throw new Error('No active subscription found');
        }

        const session = await this.stripeService.createPortalSession(
            subscription.stripe_customer_id,
            returnUrl || `${process.env.FRONTEND_URL}/portal/billing`
        );

        return {
            portal_url: session.url,
        };
    }

    /**
     * Handle successful Stripe payment (called from webhooks)
     */
    async handleSuccessfulPayment(stripeSessionId: string): Promise<any> {
        // This will be implemented in the webhook handler
        // For now, just log that it was called
        console.log('Handling successful payment for session:', stripeSessionId);

        // TODO: Implement webhook processing logic
        // 1. Retrieve session from Stripe
        // 2. Extract subscription and customer data
        // 3. Create or update subscription in database
        // 4. Publish subscription.created/updated event

        throw new Error('Method not yet implemented - will be completed in Phase 3');
    }

    /**
     * Cancel subscription via Stripe
     */
    async cancelSubscriptionViaStripe(
        subscriptionId: string,
        clerkUserId: string
    ): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);

        // Get subscription to verify ownership
        const subscription = await this.repository.getSubscriptionById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Verify ownership (unless billing admin)
        if (!isBillingAdmin(access) && subscription.user_id !== access.identityUserId) {
            throw new Error('Unauthorized to cancel this subscription');
        }

        // Cancel in Stripe
        if (subscription.stripe_subscription_id) {
            await this.stripeService.cancelSubscription(subscription.stripe_subscription_id);
        }

        // Update in database
        const updated = await this.repository.updateSubscription(subscriptionId, {
            status: 'canceled',
            cancel_at: new Date().toISOString(),
            canceled_at: new Date().toISOString(),
        });

        return updated;
    }

    private async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publish(eventType, payload);
    }
}
