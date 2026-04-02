/**
 * Messaging Counters V3 Routes — Read-only + current status view
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { MessagingCounterRepository } from './repository.js';
import { MessagingCounterService } from './service.js';
import { MessagingCounterListParams, listQuerySchema, idParamSchema } from './types.js';

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

  // POST /api/v3/messaging-counters — not supported (system-managed)
  app.post('/api/v3/messaging-counters', async (_request, reply) => {
    return reply.status(400).send({
      error: {
        code: 'NOT_SUPPORTED',
        message: 'Messaging counters are system-managed and cannot be created manually.',
      },
    });
  });

  // PATCH /api/v3/messaging-counters/:id — not supported (system-managed)
  app.patch('/api/v3/messaging-counters/:id', {
    schema: { params: idParamSchema },
  }, async (_request, reply) => {
    return reply.status(400).send({
      error: {
        code: 'NOT_SUPPORTED',
        message: 'Messaging counters are system-managed and cannot be updated manually.',
      },
    });
  });

  // DELETE /api/v3/messaging-counters/:id — not supported (system-managed)
  app.delete('/api/v3/messaging-counters/:id', {
    schema: { params: idParamSchema },
  }, async (_request, reply) => {
    return reply.status(400).send({
      error: {
        code: 'NOT_SUPPORTED',
        message: 'Messaging counters are system-managed and cannot be deleted.',
      },
    });
  });
}
