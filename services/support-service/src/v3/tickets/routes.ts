/**
 * Support Tickets V3 Routes
 *
 * POST create is public (optional auth). Admin routes require auth.
 * Non-parameterized routes before :id routes.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { TicketRepository } from './repository';
import { TicketService } from './service';
import {
  TicketListParams,
  CreateTicketInput,
  UpdateTicketInput,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types';

export function registerTicketRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const repository = new TicketRepository(supabase);
  const service = new TicketService(repository, supabase, eventPublisher);

  // GET /api/v3/tickets/views/mine — visitor's own tickets (optional auth)
  app.get('/api/v3/tickets/views/mine', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
    const query = request.query as any;
    const data = await service.getVisitorTickets(query.session_id, clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/tickets/views/counts — admin status counts
  app.get('/api/v3/tickets/views/counts', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getStatusCounts();
    return reply.send({ data });
  });

  // GET /api/v3/tickets — list (admin)
  app.get('/api/v3/tickets', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as TicketListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/tickets/:id
  app.get('/api/v3/tickets/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await service.getById(id);
    return reply.send({ data });
  });

  // POST /api/v3/tickets — visitor creates (optional auth)
  app.post('/api/v3/tickets', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
    const data = await service.create(request.body as CreateTicketInput, clerkUserId, request.headers);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/tickets/:id — admin update
  app.patch('/api/v3/tickets/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateTicketInput);
    return reply.send({ data });
  });
}
