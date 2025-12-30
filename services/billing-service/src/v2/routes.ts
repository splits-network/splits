import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { EventPublisher } from './shared/events';
import { PlanRepository } from './plans/repository';
import { PlanServiceV2 } from './plans/service';
import { SubscriptionRepository } from './subscriptions/repository';
import { SubscriptionServiceV2 } from './subscriptions/service';
import { PayoutRepository } from './payouts/repository';
import { PayoutServiceV2 } from './payouts/service';
import { registerPlanRoutes } from './plans/routes';
import { registerSubscriptionRoutes } from './subscriptions/routes';
import { registerPayoutRoutes } from './payouts/routes';
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

    const planService = new PlanServiceV2(planRepository, accessResolver, config.eventPublisher);
    const subscriptionService = new SubscriptionServiceV2(
        subscriptionRepository,
        planRepository,
        accessResolver,
        config.eventPublisher
    );
    const payoutService = new PayoutServiceV2(payoutRepository, accessResolver, config.eventPublisher);

    registerPlanRoutes(app, { planService });
    registerSubscriptionRoutes(app, { subscriptionService });
    registerPayoutRoutes(app, { payoutService });
}
