/**
 * Conversations V3 Routes — Core 5 CRUD
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { IChatEventPublisher } from '../shared/chat-event-publisher';
import { ConversationRepository } from './repository';
import { ConversationService } from './service';
import {
  ConversationListParams,
  CreateConversationInput,
  UpdateConversationInput,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types';

export function registerConversationRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  chatEventPublisher?: IChatEventPublisher,
) {
  const repository = new ConversationRepository(supabase);
  const service = new ConversationService(repository, supabase, eventPublisher, chatEventPublisher);

  // GET /api/v3/chat/conversations — handled by V3 alias in V2 routes
  // (uses listConversationsWithParticipants for enriched { conversation, participant } shape)

  // GET /api/v3/chat/conversations/:id
  app.get('/api/v3/chat/conversations/:id', {
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

  // POST /api/v3/chat/conversations — handled by V3 alias in V2 routes
  // (uses createOrFindConversation with representation routing + context)

  // PATCH /api/v3/chat/conversations/:id
  app.patch('/api/v3/chat/conversations/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateConversationInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/chat/conversations/:id — archive
  app.delete('/api/v3/chat/conversations/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.archive(id, clerkUserId);
    return reply.send({ data: { message: 'Conversation archived successfully' } });
  });
}
