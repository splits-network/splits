import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { IEventPublisher } from './shared/events';
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
import { RecruiterConnectRepository } from './payouts/recruiter-connect-repository';
import { registerPlanRoutes } from './plans/routes';
import { registerSubscriptionRoutes } from './subscriptions/routes';
import { registerPayoutRoutes } from './payouts/routes';
import { payoutScheduleRoutes } from './payout-schedules/routes';
import { escrowHoldRoutes } from './escrow-holds/routes';
import { discountRoutes } from './discounts/routes';
import { DiscountRepository } from './discounts/repository';
import { DiscountServiceV2 } from './discounts/service';
import { StripeConnectRepository } from './connect/repository';
import { StripeConnectService } from './connect/service';
import { stripeConnectRoutes } from './connect/routes';
import { CompanyBillingProfileRepository } from './company-billing/repository';
import { CompanyBillingProfileService } from './company-billing/service';
import { companyBillingProfileRoutes } from './company-billing/routes';
import { PlacementInvoiceRepository } from './placement-invoices/repository';
import { PlacementInvoiceService } from './placement-invoices/service';
import { placementInvoiceRoutes } from './placement-invoices/routes';
import { resolveAccessContext } from './shared/access';

interface BillingV2Config {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: IEventPublisher;
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
    const recruiterConnectRepository = new RecruiterConnectRepository(accessClient);

    // Use provided event publisher (already initialized in main server)
    const eventPublisher = config.eventPublisher;

    const planService = new PlanServiceV2(planRepository, accessResolver, config.eventPublisher);
    const subscriptionService = new SubscriptionServiceV2(
        subscriptionRepository,
        planRepository,
        accessResolver,
        config.eventPublisher,
        undefined,
        accessClient
    );
    
    // Initialize discount service
    const discountRepository = new DiscountRepository(config.supabaseUrl, config.supabaseKey);
    const discountService = new DiscountServiceV2(
        discountRepository,
        planRepository,
        accessResolver,
        config.eventPublisher
    );
    const connectRepository = new StripeConnectRepository(accessClient);
    const connectService = new StripeConnectService(
        connectRepository,
        accessResolver
    );
    const companyBillingRepository = new CompanyBillingProfileRepository(accessClient);
    const companyBillingService = new CompanyBillingProfileService(
        companyBillingRepository,
        accessResolver,
        config.eventPublisher
    );
    const placementInvoiceRepository = new PlacementInvoiceRepository(accessClient);
    const placementInvoiceService = new PlacementInvoiceService(
        accessClient,
        placementInvoiceRepository,
        snapshotRepository,
        companyBillingRepository,
        companyBillingService,
        accessResolver
    );
    const payoutService = new PayoutServiceV2(
        payoutRepository,
        snapshotRepository,  // Phase 6: Wire in PlacementSnapshotRepository
        splitRepository,     // Phase 6: Wire in PlacementSplitRepository
        transactionRepository, // Phase 6: Wire in PlacementPayoutTransactionRepository
        recruiterConnectRepository,
        accessResolver,
        config.eventPublisher
    );

    // Create new automation services
    if (!eventPublisher) {
        throw new Error('EventPublisher is required for V2 routes');
    }

    // Create audit repository for payout automation logging
    const auditRepository = new PayoutAuditRepository(accessClient);

    const payoutScheduleService = new PayoutScheduleServiceV2(
        accessClient,
        eventPublisher,
        auditRepository,
        payoutService
    );
    const escrowHoldService = new EscrowHoldServiceV2(accessClient, eventPublisher, auditRepository);

    registerPlanRoutes(app, { planService });
    registerSubscriptionRoutes(app, { subscriptionService });
    registerPayoutRoutes(app, { payoutService });
    discountRoutes(app, discountService);
    stripeConnectRoutes(app, connectService);
    companyBillingProfileRoutes(app, companyBillingService);
    placementInvoiceRoutes(app, placementInvoiceService);

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
