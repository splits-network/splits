import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { SupabaseClient } from '@supabase/supabase-js';
import { ServiceRegistry } from '../../clients';
import { registerAnalyticsRoutes } from './analytics';
import { registerAtsRoutes } from './ats';
import { registerNetworkRoutes } from './network';
import { registerIdentityRoutes } from './identity';
import { registerBillingRoutes } from './billing';
import { registerNotificationRoutes } from './notification';
import { registerDocumentRoutes } from './documents';
import { registerAutomationRoutes } from './automation';
import { registerChatRoutes } from './chat';
import { registerPresenceRoutes } from './presence';
import { registerSearchRoutes } from './search';
import { registerStatusRoutes } from './status';
import { registerSystemHealthRoutes } from './system-health';
import { registerSiteNotificationRoutes } from './site-notifications';
import { registerGptRoutes } from './gpt';
import { registerContentRoutes } from './content';
import { EventPublisher } from '../../events/event-publisher';

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
    registerPresenceRoutes(app, services);
    registerSearchRoutes(app, services);
    registerContentRoutes(app, services);
    registerStatusRoutes(app, options?.eventPublisher || null);

    if (options?.redis && options?.supabase) {
        registerSystemHealthRoutes(app, options.redis, options.supabase);
        registerSiteNotificationRoutes(app, options.supabase);
    }
}
