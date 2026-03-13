/**
 * Support Conversations V3 Routes
 *
 * POST create is public (optional auth). List/get for visitors by session.
 * Admin routes use x-clerk-user-id auth.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { SupportConversationRepository } from './repository';
import { SupportConversationService } from './service';
import {
  SupportConversationListParams,
  CreateSupportConversationInput,
  UpdateSupportConversationInput,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types';

export function registerSupportConversationRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const repository = new SupportConversationRepository(supabase);
  const service = new SupportConversationService(repository, supabase, eventPublisher);

  // GET /api/v3/support/conversations — list (admin)
  app.get('/api/v3/support/conversations', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as SupportConversationListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/support/conversations/:id
  app.get('/api/v3/support/conversations/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await service.getById(id);
    return reply.send({ data });
  });

  // POST /api/v3/support/conversations — visitor creates (optional auth)
  app.post('/api/v3/support/conversations', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
    const data = await service.create(
      request.body as CreateSupportConversationInput,
      clerkUserId,
    );
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/support/conversations/:id — admin update
  app.patch('/api/v3/support/conversations/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateSupportConversationInput);
    return reply.send({ data });
  });

  // DELETE /api/v3/support/conversations/:id — close conversation
  app.delete('/api/v3/support/conversations/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.close(id);
    return reply.send({ data: { message: 'Support conversation closed successfully' } });
  });
}
