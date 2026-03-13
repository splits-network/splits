import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerAiV3Routes } from './ai';
import { registerAnalyticsV3Routes } from './analytics';
import { registerAtsV3Routes } from './ats';
import { registerAutomationV3Routes } from './automation';
import { registerBillingV3Routes } from './billing';
import { registerCallV3Routes } from './call';
import { registerChatV3Routes } from './chat';
import { registerContentV3Routes } from './content';
import { registerDocumentV3Routes } from './document';
import { registerGamificationV3Routes } from './gamification';
import { registerGptV3Routes } from './gpt';
import { registerIdentityV3Routes } from './identity';
import { registerIntegrationV3Routes } from './integration';
import { registerMatchingV3Routes } from './matching';
import { registerNetworkV3Routes } from './network';
import { registerNotificationV3Routes } from './notification';
import { registerSearchV3Routes } from './search';
import { registerSupportV3Routes } from './support';
import { registerVideoV3Routes } from './video';
import { registerOnboardingV3Routes } from './onboarding';

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
}
