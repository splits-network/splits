import Stripe from 'stripe';
import { BillingRepository } from './repository';
import { Logger } from '@splits-network/shared-logging';
import { PlanService } from './services/plans/service';
import { SubscriptionService } from './services/subscriptions/service';
import { WebhookService } from './services/webhooks/service';
import { Plan, Subscription } from '@splits-network/shared-types';

/**
 * Main Billing Service Coordinator
 * Instantiates and exposes domain services, provides delegation methods
 */
export class BillingService {
    // Domain services
    public readonly plans: PlanService;
    public readonly subscriptions: SubscriptionService;
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
        this.plans = new PlanService(repository);
        this.subscriptions = new SubscriptionService(repository, stripeSecretKey, logger);
        this.webhooks = new WebhookService(this.subscriptions, logger);
    }

    // ========================================================================
    // Delegation methods for backward compatibility
    // ========================================================================

    // Plan methods
    async getPlanById(id: string): Promise<Plan> {
        return this.plans.getPlanById(id);
    }

    async getAllPlans(): Promise<Plan[]> {
        return this.plans.getAllPlans();
    }

    async createPlan(
        name: string,
        priceMonthly: number,
        stripePriceId?: string,
        features: Record<string, any> = {}
    ): Promise<Plan> {
        return this.plans.createPlan(name, priceMonthly, stripePriceId, features);
    }

    // Subscription methods
    async getSubscriptionByRecruiterId(recruiterId: string): Promise<Subscription | null> {
        return this.subscriptions.getSubscriptionByRecruiterId(recruiterId);
    }

    async isRecruiterSubscriptionActive(recruiterId: string): Promise<boolean> {
        return this.subscriptions.isRecruiterSubscriptionActive(recruiterId);
    }

    async createSubscription(
        recruiterId: string,
        planId: string,
        stripeCustomerId?: string
    ): Promise<Subscription> {
        return this.subscriptions.createSubscription(recruiterId, planId, stripeCustomerId);
    }

    async cancelSubscription(recruiterId: string): Promise<Subscription> {
        return this.subscriptions.cancelSubscription(recruiterId);
    }

    // Webhook methods
    async handleStripeWebhook(event: Stripe.Event): Promise<void> {
        return this.webhooks.handleStripeWebhook(event);
    }
}
