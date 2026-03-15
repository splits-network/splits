/**
 * Connections V3 Routes
 * GET list, GET by id, DELETE (disconnect)
 * OAuth initiate/callback stay in V2 (complex OAuth flow)
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { ConnectionRepository } from './repository';
import { ConnectionService } from './service';
import { ConnectionListParams, idParamSchema, listQuerySchema } from './types';

export function registerConnectionRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const repository = new ConnectionRepository(supabase);
  const service = new ConnectionService(repository, supabase, eventPublisher);

  // GET /api/v3/integrations/connections
  app.get('/api/v3/integrations/connections', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as ConnectionListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/integrations/connections/:id
  app.get('/api/v3/integrations/connections/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/integrations/connections/:id
  app.delete('/api/v3/integrations/connections/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Connection disconnected successfully' } });
  });
}
