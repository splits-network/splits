import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerAtsRoutes } from './ats';
import { registerNetworkRoutes } from './network';
import { registerIdentityRoutes } from './identity';
import { registerBillingRoutes } from './billing';
import { registerNotificationRoutes } from './notification';
import { registerDocumentRoutes } from './documents';
import { registerAutomationRoutes } from './automation';

export function registerV2GatewayRoutes(app: FastifyInstance, services: ServiceRegistry) {
    registerAtsRoutes(app, services);
    registerAutomationRoutes(app, services);
    registerBillingRoutes(app, services);
    registerDocumentRoutes(app, services);
    registerIdentityRoutes(app, services);
    registerNetworkRoutes(app, services);
    registerNotificationRoutes(app, services);
}
