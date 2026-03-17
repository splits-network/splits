/**
 * POST /api/v3/chat/conversations/:id/actions/resync
 *
 * Resync a conversation: returns conversation with participants, caller's
 * participant state, and recent messages. Used when a client reconnects
 * or needs to refresh a conversation view.
 *
 * Note: This is modeled as an action (POST) because it may trigger side effects
 * like resetting connection state. However it also accepts GET for backward compat.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { resolveAndValidateParticipant } from '../lib/participant-helper';
import { DetailViewRepository } from '../views/detail.repository';
import { idParamSchema } from '../types';

const querySchema = {
  type: 'object',
  properties: {
    after: { type: 'string' },
    before: { type: 'string' },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
  },
};

async function handleResync(
  supabase: SupabaseClient,
  request: any,
  reply: any,
) {
  const clerkUserId = request.headers['x-clerk-user-id'] as string;
  if (!clerkUserId) {
    return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
  }
  const { id } = request.params as { id: string };
  const query = request.query as any;
  const after = query.after as string | undefined;
  const before = query.before as string | undefined;
  const limit = Math.min(parseInt(query.limit || '50', 10), 100);

  const { userId, participant } = await resolveAndValidateParticipant(supabase, clerkUserId, id);

  const detailRepo = new DetailViewRepository(supabase);
  const conversation = await detailRepo.findByIdWithParticipants(id);
  if (!conversation) {
    return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Conversation not found' } });
  }

  // Fetch messages
  let msgQuery = supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: false });

  if (after) {
    const { data: afterMsg } = await supabase.from('chat_messages').select('created_at').eq('id', after).maybeSingle();
    if (afterMsg?.created_at) msgQuery = msgQuery.gt('created_at', afterMsg.created_at);
  }
  if (before) {
    const { data: beforeMsg } = await supabase.from('chat_messages').select('created_at').eq('id', before).maybeSingle();
    if (beforeMsg?.created_at) msgQuery = msgQuery.lt('created_at', beforeMsg.created_at);
  }

  const { data: messages, error } = await msgQuery.limit(limit);
  if (error) throw error;

  return reply.send({
    data: {
      conversation,
      participant,
      messages: (messages || []).reverse(),
    },
  });
}

export function registerResyncAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  _chatEventPublisher?: IChatEventPublisher,
) {
  // GET for backward compatibility with V2 GET /conversations/:id/resync
  app.get('/api/v3/chat/conversations/:id/actions/resync', {
    schema: { params: idParamSchema, querystring: querySchema },
  }, async (request, reply) => {
    return handleResync(supabase, request, reply);
  });

  // POST as the canonical V3 action
  app.post('/api/v3/chat/conversations/:id/actions/resync', {
    schema: { params: idParamSchema, querystring: querySchema },
  }, async (request, reply) => {
    return handleResync(supabase, request, reply);
  });
}
