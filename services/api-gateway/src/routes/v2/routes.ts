import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { SupabaseClient } from '@supabase/supabase-js';
import { ServiceRegistry } from '../../clients.js';
import { registerAnalyticsRoutes } from './analytics.js';
import { registerAtsRoutes } from './ats.js';
import { registerNetworkRoutes } from './network.js';
import { registerIdentityRoutes } from './identity.js';
import { registerBillingRoutes } from './billing.js';
import { registerNotificationRoutes } from './notification.js';
import { registerDocumentRoutes } from './documents.js';
import { registerAutomationRoutes } from './automation.js';
import { registerChatRoutes } from './chat.js';
import { registerPresenceRoutes } from './presence.js';
import { registerSearchRoutes } from './search.js';
import { registerStatusRoutes } from './status.js';
import { registerSystemHealthRoutes } from './system-health.js';
import { registerSiteNotificationRoutes } from './site-notifications.js';
import { registerGptRoutes } from './gpt.js';
import { registerContentRoutes } from './content.js';
import { registerOnboardingRoutes } from './onboarding.js';
import { registerIntegrationRoutes } from './integrations.js';
import { registerMatchingRoutes } from './matching.js';
import { registerGamificationRoutes } from './gamification.js';
import { registerCallRoutes } from './calls.js';
import { registerSupportRoutes } from './support.js';
import { EventPublisher } from '../../events/event-publisher.js';

export function registerV2GatewayRoutes(
    app: FastifyInstance,
    services: ServiceRegistry,
    options?: {
        eventPublisher?: EventPublisher | null;
        redis?: Redis;
        supabase?: SupabaseClient;
    }
) {
    registerAnalyticsRoutes(app, services);
    registerAtsRoutes(app, services);
    registerAutomationRoutes(app, services);
    registerChatRoutes(app, services);
    registerBillingRoutes(app, services);
    registerDocumentRoutes(app, services);
    registerGptRoutes(app, services);
    registerIdentityRoutes(app, services);
    registerNetworkRoutes(app, services);
    registerNotificationRoutes(app, services);
    registerOnboardingRoutes(app, services);
    registerPresenceRoutes(app, services);
    registerSearchRoutes(app, services);
    registerContentRoutes(app, services);
    registerIntegrationRoutes(app, services);
    registerMatchingRoutes(app, services);
    registerGamificationRoutes(app, services);
    registerCallRoutes(app, services);
    registerSupportRoutes(app, services);
    registerStatusRoutes(app, options?.eventPublisher || null);

    if (options?.redis && options?.supabase) {
        registerSystemHealthRoutes(app, options.redis, options.supabase);
        registerSiteNotificationRoutes(app, options.supabase);
    }
}
