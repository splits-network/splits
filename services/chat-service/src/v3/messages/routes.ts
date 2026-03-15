/**
 * Messages V3 Routes — List & Send
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { IChatEventPublisher } from '../shared/chat-event-publisher';
import { MessageRepository } from './repository';
import { MessageService } from './service';
import {
  MessageListParams,
  SendMessageInput,
  messageListQuerySchema,
  sendMessageSchema,
  conversationIdParamSchema,
} from './types';

export function registerMessageRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  chatEventPublisher?: IChatEventPublisher,
) {
  const repository = new MessageRepository(supabase);
  const service = new MessageService(repository, supabase, eventPublisher, chatEventPublisher);

  // GET /api/v3/chat/conversations/:conversationId/messages
  app.get('/api/v3/chat/conversations/:conversationId/messages', {
    schema: { params: conversationIdParamSchema, querystring: messageListQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { conversationId } = request.params as { conversationId: string };
    const params = request.query as MessageListParams;
    const result = await service.getAll(conversationId, params, clerkUserId);
    return reply.send(result);
  });

  // POST /api/v3/chat/conversations/:conversationId/messages
  app.post('/api/v3/chat/conversations/:conversationId/messages', {
    schema: { params: conversationIdParamSchema, body: sendMessageSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { conversationId } = request.params as { conversationId: string };
    const data = await service.send(conversationId, request.body as SendMessageInput, clerkUserId);
    return reply.status(201).send({ data });
  });
}
