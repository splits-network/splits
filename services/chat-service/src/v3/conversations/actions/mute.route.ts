/**
 * POST /api/v3/chat/conversations/:id/actions/mute
 *
 * Toggle mute state for a conversation. V3 uses a single POST with boolean body
 * instead of V2's POST+DELETE pair.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { resolveAndValidateParticipant } from './participant-helper';
import { idParamSchema } from '../types';

const bodySchema = {
  type: 'object',
  required: ['muted'],
  properties: {
    muted: { type: 'boolean' },
  },
  additionalProperties: false,
};

export function registerMuteAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  chatEventPublisher?: IChatEventPublisher,
) {
  app.post('/api/v3/chat/conversations/:id/actions/mute', {
    schema: { params: idParamSchema, body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const { muted } = request.body as { muted: boolean };
    const { userId } = await resolveAndValidateParticipant(supabase, clerkUserId, id);

    const now = new Date().toISOString();
    await supabase
      .from('chat_conversation_participants')
      .update({ muted_at: muted ? now : null, updated_at: now })
      .eq('conversation_id', id)
      .eq('user_id', userId);

    await chatEventPublisher?.conversationUpdated(userId, { conversationId: id, muted });

    return reply.send({ data: { message: muted ? 'Conversation muted' : 'Conversation unmuted' } });
  });
}
