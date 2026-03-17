/**
 * POST /api/v3/chat/conversations/:id/actions/read-receipt
 *
 * Update the read receipt for the caller in a conversation.
 * Uses the chat_mark_read RPC for atomic unread count reset.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { resolveAndValidateParticipant } from './participant-helper';
import { idParamSchema } from '../types';

const bodySchema = {
  type: 'object',
  properties: {
    lastReadMessageId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export function registerReadReceiptAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  chatEventPublisher?: IChatEventPublisher,
) {
  app.post('/api/v3/chat/conversations/:id/actions/read-receipt', {
    schema: { params: idParamSchema, body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const body = request.body as { lastReadMessageId?: string };
    const { userId } = await resolveAndValidateParticipant(supabase, clerkUserId, id);

    const { error } = await supabase.rpc('chat_mark_read', {
      p_conversation_id: id,
      p_user_id: userId,
      p_last_read_message_id: body.lastReadMessageId ?? null,
    });
    if (error) throw error;

    await chatEventPublisher?.readReceipt(id, {
      conversationId: id,
      userId,
      lastReadMessageId: body.lastReadMessageId ?? null,
    });

    return reply.send({ data: { message: 'Read receipt updated' } });
  });
}
