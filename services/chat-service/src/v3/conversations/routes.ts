/**
 * Conversations V3 Routes -- Core 5 CRUD
 *
 * Views and actions are registered BEFORE :id routes to avoid collision.
 * POST (create) is handled by the "start" action (createOrFindConversation).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { IChatEventPublisher } from '../shared/chat-event-publisher';
import { ConversationRepository } from './repository';
import { ConversationService } from './service';
import {
  ConversationListParams,
  UpdateConversationInput,
  listQuerySchema,
  updateSchema,
  idParamSchema,
} from './types';

// --- View/Action registrations ---
import { registerListForUserView } from './views/list-for-user.route';
import { registerDetailView } from './views/detail.route';
import { registerStartAction } from './actions/start.route';
import { registerAcceptAction } from './actions/accept.route';
import { registerDeclineAction } from './actions/decline.route';
import { registerMuteAction } from './actions/mute.route';
import { registerArchiveAction } from './actions/archive.route';
import { registerReadReceiptAction } from './actions/read-receipt.route';
import { registerResyncAction } from './actions/resync.route';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerConversationRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  chatEventPublisher?: IChatEventPublisher,
) {
  const repository = new ConversationRepository(supabase);
  const service = new ConversationService(repository, supabase, eventPublisher, chatEventPublisher);

  // --- Views (before :id) ---
  registerListForUserView(app, supabase, chatEventPublisher);
  registerDetailView(app, supabase);

  // --- Actions (before :id) ---
  registerStartAction(app, supabase, eventPublisher, chatEventPublisher);
  registerAcceptAction(app, supabase, chatEventPublisher);
  registerDeclineAction(app, supabase, chatEventPublisher);
  registerMuteAction(app, supabase, chatEventPublisher);
  registerArchiveAction(app, supabase, chatEventPublisher);
  registerReadReceiptAction(app, supabase, chatEventPublisher);
  registerResyncAction(app, supabase, chatEventPublisher);

  // --- Core 5 CRUD ---

  // GET /api/v3/chat/conversations
  app.get('/api/v3/chat/conversations', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as ConversationListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/chat/conversations/:id
  app.get('/api/v3/chat/conversations/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/chat/conversations -- delegates to start action for createOrFind
  // The core POST is intentionally minimal; the "start" action handles
  // representation routing and context. This is a no-op to satisfy Core 5.
  // Actual creation: POST /api/v3/chat/conversations/actions/start

  // PATCH /api/v3/chat/conversations/:id
  app.patch('/api/v3/chat/conversations/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateConversationInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/chat/conversations/:id
  app.delete('/api/v3/chat/conversations/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Conversation deleted successfully' } });
  });
}
