/**
 * GPT Service V3 Route Registry
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { GptConfig } from '@splits-network/shared-config';
import { Logger } from '@splits-network/shared-logging';
import { IEventPublisher } from '../v2/shared/events.js';
import { registerGptActionRoutes } from './actions/routes.js';
import { registerOAuthSessionRoutes } from './oauth/routes.js';
import { registerOAuthAuthRoutes } from './oauth/auth-routes.js';
import { registerClerkWebhookRoutes } from './webhooks/clerk-handler.js';
import { OAuthAuthService } from './oauth/auth-service.js';

interface V3RouteDeps {
  supabase: SupabaseClient;
  gptConfig: GptConfig;
  eventPublisher: IEventPublisher;
  logger: Logger;
  clerkWebhookSecret?: string;
}

export function registerV3Routes(app: FastifyInstance, deps: V3RouteDeps) {
  const { supabase, gptConfig, eventPublisher, logger, clerkWebhookSecret } = deps;

  // Session listing / CRUD routes (existing)
  registerGptActionRoutes(app, supabase, eventPublisher);
  registerOAuthSessionRoutes(app, supabase);

  // OAuth2 auth flow routes (authorize, token, refresh, revoke)
  registerOAuthAuthRoutes(app, { supabase, gptConfig, eventPublisher, logger });

  // Clerk webhook handler (user.deleted -> revoke all sessions)
  const authService = new OAuthAuthService(supabase, gptConfig, eventPublisher, logger);
  registerClerkWebhookRoutes(app, { authService, logger, clerkWebhookSecret });
}
