import Stripe from 'stripe';
import { BillingRepository } from './repository';
import { Logger } from '@splits-network/shared-logging';
// TODO: Migrate webhooks to V2 - temporarily commented out for build
// import { PlanServiceV2 } from './v2/plans/service';
// import { SubscriptionServiceV2 } from './v2/subscriptions/service';
import { WebhookService } from './services/webhooks/service';
import { Plan, Subscription } from '@splits-network/shared-types';

/**
 * Main Billing Service Coordinator
 * TODO: This is V1 legacy code kept only for webhook compatibility
 * Webhooks should be migrated to V2 architecture
 */
export class BillingService {
    // Domain services - TODO: Remove when webhooks migrated to V2
    // public readonly plans: PlanServiceV2;
    // public readonly subscriptions: SubscriptionServiceV2;
    public readonly webhooks: WebhookService;

    private stripe: Stripe;

    constructor(
        private repository: BillingRepository,
        stripeSecretKey: string,
        private logger: Logger
    ) {
        this.stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2025-11-17.clover',
        });

        // Initialize domain services
        // TODO: Properly initialize V2 services when webhooks are migrated
        // this.plans = new PlanServiceV2(repository);
        // this.subscriptions = new SubscriptionServiceV2(repository, stripeSecretKey, logger);
        this.webhooks = new WebhookService(repository.getClient(), logger, stripeSecretKey);
    }

    // ========================================================================
    // Delegation methods for backward compatibility
    // TODO: Remove when webhooks are migrated to V2 - currently commented out for build
    // ========================================================================

    // Plan methods - TODO: Use V2 plan service directly
    // async getPlanById(id: string): Promise<Plan> {
    //     return this.plans.getPlanById(id);
    // }

    // async getAllPlans(): Promise<Plan[]> {
    //     return this.plans.getAllPlans();
    // }

    // async createPlan(
    //     name: string,
    //     priceMonthly: number,
    //     stripePriceId?: string,
    //     features: Record<string, any> = {}
    // ): Promise<Plan> {
    //     return this.plans.createPlan(name, priceMonthly, stripePriceId, features);
    // }

    // Subscription methods - TODO: Use V2 subscription service directly
    // async getSubscriptionByRecruiterId(recruiterId: string): Promise<Subscription | null> {
    //     return this.subscriptions.getSubscriptionByRecruiterId(recruiterId);
    // }

    // async isRecruiterSubscriptionActive(recruiterId: string): Promise<boolean> {
    //     return this.subscriptions.isRecruiterSubscriptionActive(recruiterId);
    // }

    // async createSubscription(
    //     recruiterId: string,
    //     planId: string,
    //     stripeCustomerId?: string
    // ): Promise<Subscription> {
    //     return this.subscriptions.createSubscription(recruiterId, planId, stripeCustomerId);
    // }

    // async cancelSubscription(recruiterId: string): Promise<Subscription> {
    //     return this.subscriptions.cancelSubscription(recruiterId);
    // }

    // Webhook methods - This still works with simplified webhook service
    async handleStripeWebhook(event: Stripe.Event): Promise<void> {
        return this.webhooks.handleStripeWebhook(event);
    }
}
