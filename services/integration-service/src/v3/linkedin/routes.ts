/**
 * LinkedIn V3 Routes
 * Profile verification and data via V3 infrastructure.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { CryptoService } from '@splits-network/shared-config/src/crypto';
import { IEventPublisher } from '../../v2/shared/events.js';
import { ConnectionAdapter } from '../connections/connection-adapter.js';
import { TokenRefreshService } from '../calendar/token-refresh-service.js';
import { LinkedInService } from '../../v2/linkedin/service.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

function mapErrorStatus(err: any): number {
  if (err.message?.includes('Unauthorized')) return 403;
  if (err.message?.includes('not found')) return 404;
  if (err.message?.includes('expired')) return 401;
  return 500;
}

interface LinkedInRouteConfig {
  supabase: SupabaseClient;
  eventPublisher: IEventPublisher;
  logger: Logger;
  crypto: CryptoService;
}

export function registerLinkedInRoutes(app: FastifyInstance, config: LinkedInRouteConfig) {
  const adapter = new ConnectionAdapter(config.supabase);
  const tokenRefresh = new TokenRefreshService(
    config.supabase, config.eventPublisher, config.logger, config.crypto,
  );
  const service = new LinkedInService(adapter as any, tokenRefresh as any, config.logger);

  // GET /api/v3/integrations/linkedin/:connectionId/profile
  app.get('/api/v3/integrations/linkedin/:connectionId/profile', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId } = request.params as { connectionId: string };

    try {
      const profile = await service.getProfile(connectionId, clerkUserId);
      return reply.send({ data: profile });
    } catch (err: any) {
      config.logger.error({ err, connectionId }, 'Failed to fetch LinkedIn profile');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });

  // GET /api/v3/integrations/linkedin/:connectionId/verification
  app.get('/api/v3/integrations/linkedin/:connectionId/verification', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId } = request.params as { connectionId: string };

    try {
      const status = await service.getVerificationStatus(connectionId, clerkUserId);
      return reply.send({ data: status });
    } catch (err: any) {
      config.logger.error({ err, connectionId }, 'Failed to check LinkedIn verification');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });

  // POST /api/v3/integrations/linkedin/:connectionId/refresh-profile
  app.post('/api/v3/integrations/linkedin/:connectionId/refresh-profile', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId } = request.params as { connectionId: string };

    try {
      const profile = await service.getProfile(connectionId, clerkUserId);

      try {
        await config.eventPublisher.publish('integration.linkedin_profile_verified', {
          type: 'integration.linkedin_profile_verified',
          connection_id: connectionId,
          provider_slug: 'linkedin',
          clerk_user_id: clerkUserId,
          timestamp: new Date().toISOString(),
          metadata: {
            linkedin_sub: profile.sub,
            linkedin_name: profile.name,
            linkedin_email: profile.email,
            email_verified: profile.email_verified,
          },
        });
      } catch (pubErr) {
        config.logger.error({ pubErr }, 'Failed to publish linkedin verification event');
      }

      return reply.send({ data: profile });
    } catch (err: any) {
      config.logger.error({ err, connectionId }, 'Failed to refresh LinkedIn profile');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });
}
