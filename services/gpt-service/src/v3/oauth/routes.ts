/**
 * OAuth Sessions V3 Routes
 * Session listing and revocation. OAuth flow (authorize/token) stays V2.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { OAuthSessionRepository } from './repository';
import { OAuthSessionService } from './service';
import { OAuthSessionListParams, sessionListQuerySchema } from './types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerOAuthSessionRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new OAuthSessionRepository(supabase);
  const service = new OAuthSessionService(repository);

  // GET /api/v3/gpt/oauth/sessions
  app.get('/api/v3/gpt/oauth/sessions', {
    schema: { querystring: sessionListQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.list(clerkUserId, request.query as OAuthSessionListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // POST /api/v3/gpt/oauth/sessions/:id/revoke
  app.post('/api/v3/gpt/oauth/sessions/:id/revoke', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.revoke(id, clerkUserId);
    return reply.send({ data: { revoked: true } });
  });
}
