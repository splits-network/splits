import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients.js';
import { registerAiV3Routes } from './ai.js';
import { registerAnalyticsV3Routes } from './analytics.js';
import { registerAtsV3Routes } from './ats.js';
import { registerAutomationV3Routes } from './automation.js';
import { registerBillingV3Routes } from './billing.js';
import { registerCallV3Routes } from './call.js';
import { registerChatV3Routes } from './chat.js';
import { registerContentV3Routes } from './content.js';
import { registerDocumentV3Routes } from './document.js';
import { registerGamificationV3Routes } from './gamification.js';
import { registerGptV3Routes } from './gpt.js';
import { registerIdentityV3Routes } from './identity.js';
import { registerIntegrationV3Routes } from './integration.js';
import { registerMatchingV3Routes } from './matching.js';
import { registerNetworkV3Routes } from './network.js';
import { registerNotificationV3Routes } from './notification.js';
import { registerSearchV3Routes } from './search.js';
import { registerSiteNotificationV3Routes } from './site-notifications.js';
import { registerSupportV3Routes } from './support.js';
import { registerVideoV3Routes } from './video.js';
import { registerOnboardingV3Routes } from './onboarding.js';
import { registerStatusV3Routes } from './status.js';

/**
 * Register all V3 gateway routes.
 * Import and call each service's V3 route registration here.
 */
export function registerV3GatewayRoutes(
  app: FastifyInstance,
  services: ServiceRegistry
) {
  registerAiV3Routes(app, services);
  registerAnalyticsV3Routes(app, services);
  registerAtsV3Routes(app, services);
  registerAutomationV3Routes(app, services);
  registerBillingV3Routes(app, services);
  registerCallV3Routes(app, services);
  registerChatV3Routes(app, services);
  registerContentV3Routes(app, services);
  registerDocumentV3Routes(app, services);
  registerGamificationV3Routes(app, services);
  registerGptV3Routes(app, services);
  registerIdentityV3Routes(app, services);
  registerIntegrationV3Routes(app, services);
  registerMatchingV3Routes(app, services);
  registerNetworkV3Routes(app, services);
  registerNotificationV3Routes(app, services);
  registerOnboardingV3Routes(app, services);
  registerSearchV3Routes(app, services);
  registerSupportV3Routes(app, services);
  registerVideoV3Routes(app, services);
  registerSiteNotificationV3Routes(app, services);
  registerStatusV3Routes(app, services);
}
