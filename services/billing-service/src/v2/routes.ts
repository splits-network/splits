import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { EventPublisher } from './shared/events';
import { StripeService } from './shared/stripe';
import { PlanRepository } from './plans/repository';
import { PlanServiceV2 } from './plans/service';
import { SubscriptionRepository } from './subscriptions/repository';
import { SubscriptionServiceV2 } from './subscriptions/service';
import { PayoutRepository } from './payouts/repository';
import { PayoutServiceV2 } from './payouts/service';
import { PayoutScheduleServiceV2 } from './payout-schedules/service';
import { EscrowHoldServiceV2 } from './escrow-holds/service';
import { PayoutAuditRepository } from './audit/repository';
import { PlacementSnapshotRepository } from './placement-snapshot/repository';
import { PlacementSplitRepository } from './payouts/placement-split-repository';
import { PlacementPayoutTransactionRepository } from './payouts/placement-payout-transaction-repository';
import { WebhookRepositoryV2 } from './webhooks/repository';
import { WebhookServiceV2 } from './webhooks/service-simple';
import { registerPlanRoutes } from './plans/routes';
import { registerSubscriptionRoutes } from './subscriptions/routes';
import { registerPayoutRoutes } from './payouts/routes';
import { registerWebhookRoutes } from './webhooks/routes';
import { payoutScheduleRoutes } from './payout-schedules/routes';
import { escrowHoldRoutes } from './escrow-holds/routes';
import { resolveAccessContext } from './shared/access';

interface BillingV2Config {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export async function registerV2Routes(app: FastifyInstance, config: BillingV2Config) {
    const planRepository = new PlanRepository(config.supabaseUrl, config.supabaseKey);
    const subscriptionRepository = new SubscriptionRepository(config.supabaseUrl, config.supabaseKey);
    const payoutRepository = new PayoutRepository(config.supabaseUrl, config.supabaseKey);
    const accessClient = createClient(config.supabaseUrl, config.supabaseKey);
    const accessResolver = (clerkUserId: string) => resolveAccessContext(accessClient, clerkUserId);

    // Phase 6: Initialize PlacementSnapshotRepository for commission calculator
    const snapshotRepository = new PlacementSnapshotRepository(accessClient);

    // Phase 6: Initialize new repositories for canonical payout architecture
    const splitRepository = new PlacementSplitRepository(accessClient);
    const transactionRepository = new PlacementPayoutTransactionRepository(accessClient);

    // Initialize webhook repository for V2 webhook handling
    const webhookRepository = new WebhookRepositoryV2(accessClient);

    // Use provided event publisher (already initialized in main server)
    const eventPublisher = config.eventPublisher;

    // Initialize Stripe service
    const stripeService = new StripeService();

    const planService = new PlanServiceV2(planRepository, accessResolver, config.eventPublisher);
    const subscriptionService = new SubscriptionServiceV2(
        subscriptionRepository,
        planRepository,
        stripeService, // Add Stripe service
        accessResolver,
        config.eventPublisher
    );
    const payoutService = new PayoutServiceV2(
        payoutRepository,
        snapshotRepository,  // Phase 6: Wire in PlacementSnapshotRepository
        splitRepository,     // Phase 6: Wire in PlacementSplitRepository
        transactionRepository, // Phase 6: Wire in PlacementPayoutTransactionRepository
        accessResolver,
        config.eventPublisher
    );

    // Initialize webhook service for V2 webhook processing
    if (!config.eventPublisher) {
        throw new Error('EventPublisher is required for webhook service');
    }
    
    const webhookService = new WebhookServiceV2(
        webhookRepository,
        subscriptionService,
        config.eventPublisher
    );

    // Create new automation services
    if (!eventPublisher) {
        throw new Error('EventPublisher is required for V2 routes');
    }

    // Create audit repository for payout automation logging
    const auditRepository = new PayoutAuditRepository(accessClient);

    const payoutScheduleService = new PayoutScheduleServiceV2(accessClient, eventPublisher, auditRepository);
    const escrowHoldService = new EscrowHoldServiceV2(accessClient, eventPublisher, auditRepository);

    registerPlanRoutes(app, { planService });
    registerSubscriptionRoutes(app, { subscriptionService });
    registerPayoutRoutes(app, { payoutService });
    registerWebhookRoutes(app, { webhookService });

    // Register automation routes
    await payoutScheduleRoutes(app, payoutScheduleService);
    await escrowHoldRoutes(app, escrowHoldService);

    // Phase 6: Return services for use by event consumers
    return {
        planService,
        subscriptionService,
        payoutService,
        webhookService,
        payoutScheduleService,
        escrowHoldService,
    };
}
