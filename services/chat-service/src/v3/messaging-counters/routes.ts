/**
 * Messaging Counters V3 Routes — Read-only + current status view
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { MessagingCounterRepository } from './repository';
import { MessagingCounterService } from './service';
import { MessagingCounterListParams, listQuerySchema, idParamSchema } from './types';

export function registerMessagingCounterRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  const repository = new MessagingCounterRepository(supabase);
  const service = new MessagingCounterService(repository, supabase);

  // GET /api/v3/messaging-counters/views/current — current month status
  app.get('/api/v3/messaging-counters/views/current', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getCurrentStatus(clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/messaging-counters — list history
  app.get('/api/v3/messaging-counters', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as MessagingCounterListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/messaging-counters/:id
  app.get('/api/v3/messaging-counters/:id', {
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
}
