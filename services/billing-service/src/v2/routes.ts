import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { EventPublisher } from './shared/events';
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
import { registerPlanRoutes } from './plans/routes';
import { registerSubscriptionRoutes } from './subscriptions/routes';
import { registerPayoutRoutes } from './payouts/routes';
import { payoutScheduleRoutes } from './payout-schedules/routes';
import { escrowHoldRoutes } from './escrow-holds/routes';
import { discountRoutes } from './discounts/routes';
import { DiscountRepository } from './discounts/repository';
import { DiscountServiceV2 } from './discounts/service';
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

    // Use provided event publisher (already initialized in main server)
    const eventPublisher = config.eventPublisher;

    const planService = new PlanServiceV2(planRepository, accessResolver, config.eventPublisher);
    const subscriptionService = new SubscriptionServiceV2(
        subscriptionRepository,
        planRepository,
        accessResolver,
        config.eventPublisher
    );
    
    // Initialize discount service
    const discountRepository = new DiscountRepository(config.supabaseUrl, config.supabaseKey);
    const discountService = new DiscountServiceV2(
        discountRepository,
        planRepository,
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
    discountRoutes(app, discountService);

    // Register automation routes
    await payoutScheduleRoutes(app, payoutScheduleService);
    await escrowHoldRoutes(app, escrowHoldService);

    // Phase 6: Return services for use by event consumers
    return {
        planService,
        subscriptionService,
        payoutService,
        payoutScheduleService,
        escrowHoldService,
    };
}
