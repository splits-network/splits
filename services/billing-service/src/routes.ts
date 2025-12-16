import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { Logger } from '@splits-network/shared-logging';
import { BillingService } from './service';
import { PayoutService } from './services/payouts/service';
import { registerPlanRoutes } from './routes/plans/routes';
import { registerSubscriptionRoutes } from './routes/subscriptions/routes';
import { registerWebhookRoutes } from './routes/webhooks/routes';
import { registerPayoutRoutes } from './routes/payouts/routes';

/**
 * Main Route Registry
 * Registers all domain-specific routes
 */
export function registerRoutes(
    app: FastifyInstance,
    service: BillingService,
    stripeWebhookSecret: string,
    payoutService?: PayoutService,
    stripe?: Stripe,
    logger?: Logger
) {
    // Register core billing routes
    registerPlanRoutes(app, service);
    registerSubscriptionRoutes(app, service);
    registerWebhookRoutes(app, service, stripeWebhookSecret);

    // Register payout routes (if services provided)
    if (payoutService && stripe && logger) {
        registerPayoutRoutes(app, service, payoutService, stripe, logger);
    }
}
