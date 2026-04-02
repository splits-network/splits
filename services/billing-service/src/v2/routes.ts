import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { IEventPublisher } from './shared/events.js';
import { PlanRepository } from './plans/repository.js';
import { PlanServiceV2 } from './plans/service.js';
import { SubscriptionRepository } from './subscriptions/repository.js';
import { SubscriptionServiceV2 } from './subscriptions/service.js';
import { PayoutServiceV2 } from './payouts/service.js';
import { PayoutScheduleServiceV2 } from './payout-schedules/service.js';
import { EscrowHoldServiceV2 } from './escrow-holds/service.js';
import { PayoutAuditRepository } from './audit/repository.js';
import { PlacementSnapshotRepository } from './placement-snapshot/repository.js';
import { PlacementSplitRepository } from './payouts/placement-split-repository.js';
import { PlacementPayoutTransactionRepository } from './payouts/placement-payout-transaction-repository.js';
import { RecruiterConnectRepository } from './payouts/recruiter-connect-repository.js';
import { registerPlanRoutes } from './plans/routes.js';
import { registerSubscriptionRoutes } from './subscriptions/routes.js';
import { registerPayoutRoutes } from './payouts/routes.js';
import { payoutScheduleRoutes } from './payout-schedules/routes.js';
import { escrowHoldRoutes } from './escrow-holds/routes.js';
import { discountRoutes } from './discounts/routes.js';
import { DiscountRepository } from './discounts/repository.js';
import { DiscountServiceV2 } from './discounts/service.js';
import { StripeConnectRepository } from './connect/repository.js';
import { StripeConnectService } from './connect/service.js';
import { stripeConnectRoutes } from './connect/routes.js';
import { CompanyBillingProfileRepository } from './company-billing/repository.js';
import { CompanyBillingProfileService } from './company-billing/service.js';
import { companyBillingProfileRoutes } from './company-billing/routes.js';
import { PlacementInvoiceRepository } from './placement-invoices/repository.js';
import { PlacementInvoiceService } from './placement-invoices/service.js';
import { placementInvoiceRoutes } from './placement-invoices/routes.js';
import { placementPayoutAuditRoutes } from './audit/routes.js';
import { SplitsRateRepository } from './splits-rates/repository.js';
import { SplitsRateService } from './splits-rates/service.js';
import { registerSplitsRateRoutes } from './splits-rates/routes.js';
import { resolveAccessContext } from './shared/access.js';
import { AdminBillingRepository } from './admin/repository.js';
import { AdminBillingService } from './admin/service.js';
import { registerAdminBillingRoutes } from './admin/routes.js';
import { FirmBillingProfileRepository } from './firm-billing/repository.js';
import { FirmBillingProfileService } from './firm-billing/service.js';
import { firmBillingProfileRoutes } from './firm-billing/routes.js';
import { FirmStripeConnectRepository } from './firm-connect/repository.js';
import { FirmStripeConnectService } from './firm-connect/service.js';
import { firmStripeConnectRoutes } from './firm-connect/routes.js';
import { EntitlementRepository } from './entitlements/repository.js';
import { EntitlementService } from './entitlements/service.js';
import { registerEntitlementRoutes } from './entitlements/routes.js';

interface BillingV2Config {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: IEventPublisher;
}

export async function registerV2Routes(app: FastifyInstance, config: BillingV2Config) {
    const planRepository = new PlanRepository(config.supabaseUrl, config.supabaseKey);
    const subscriptionRepository = new SubscriptionRepository(config.supabaseUrl, config.supabaseKey);
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
    // Initialize firm billing services
    const firmBillingRepository = new FirmBillingProfileRepository(accessClient);
    const firmBillingService = new FirmBillingProfileService(
        firmBillingRepository,
        accessClient,
        accessResolver,
        config.eventPublisher
    );
    const firmConnectRepository = new FirmStripeConnectRepository(accessClient);
    const firmConnectService = new FirmStripeConnectService(
        firmConnectRepository,
        accessClient,
        accessResolver
    );

    const placementInvoiceRepository = new PlacementInvoiceRepository(accessClient);
    const placementInvoiceService = new PlacementInvoiceService(
        accessClient,
        placementInvoiceRepository,
        snapshotRepository,
        companyBillingRepository,
        companyBillingService,
        accessResolver,
        undefined, // stripeSecretKey — uses env default
        firmBillingRepository,
        firmBillingService
    );
    const payoutService = new PayoutServiceV2(
        snapshotRepository,
        splitRepository,
        transactionRepository,
        recruiterConnectRepository,
        accessResolver,
        config.eventPublisher,
        undefined,
        firmConnectRepository
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

    // Initialize splits rates domain
    const splitsRateRepository = new SplitsRateRepository(accessClient);
    const splitsRateService = new SplitsRateService(splitsRateRepository, accessResolver, config.eventPublisher);

    // Enrich plan responses with active splits rates
    planService.setSplitsRateService(splitsRateService);

    // Initialize entitlements service
    const entitlementRepository = new EntitlementRepository(accessClient);
    const entitlementService = new EntitlementService(entitlementRepository, accessResolver);

    registerPlanRoutes(app, { planService });
    registerSplitsRateRoutes(app, { splitsRateService });
    registerSubscriptionRoutes(app, { subscriptionService });
    registerEntitlementRoutes(app, { entitlementService });
    registerPayoutRoutes(app, { payoutService });
    discountRoutes(app, discountService);
    stripeConnectRoutes(app, connectService);
    companyBillingProfileRoutes(app, companyBillingService);
    firmBillingProfileRoutes(app, firmBillingService);
    firmStripeConnectRoutes(app, firmConnectService);
    placementInvoiceRoutes(app, placementInvoiceService);

    // Register automation routes
    await payoutScheduleRoutes(app, payoutScheduleService, accessClient);
    await escrowHoldRoutes(app, escrowHoldService, accessClient);
    await placementPayoutAuditRoutes(app, auditRepository);

    // Admin routes (permissive, no access filtering)
    const adminBillingRepository = new AdminBillingRepository(config.supabaseUrl, config.supabaseKey);
    const adminBillingService = new AdminBillingService(adminBillingRepository);
    registerAdminBillingRoutes(app, { adminService: adminBillingService });

    // Phase 6: Return services for use by event consumers
    return {
        planService,
        subscriptionService,
        entitlementService,
        payoutService,
        payoutScheduleService,
        escrowHoldService,
        splitsRateService,
    };
}
