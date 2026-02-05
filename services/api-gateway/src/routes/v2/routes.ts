import { FastifyInstance } from 'fastify';
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
import { registerStatusRoutes } from './status';
import { EventPublisher } from '../../events/event-publisher';

export function registerV2GatewayRoutes(
    app: FastifyInstance,
    services: ServiceRegistry,
    options?: { eventPublisher?: EventPublisher | null }
) {
    registerAnalyticsRoutes(app, services);
    registerAtsRoutes(app, services);
    registerAutomationRoutes(app, services);
    registerChatRoutes(app, services);
    registerBillingRoutes(app, services);
    registerDocumentRoutes(app, services);
    registerIdentityRoutes(app, services);
    registerNetworkRoutes(app, services);
    registerNotificationRoutes(app, services);
    registerPresenceRoutes(app, services);
    registerStatusRoutes(app, options?.eventPublisher || null);
}
