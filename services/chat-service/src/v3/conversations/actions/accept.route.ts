/**
 * POST /api/v3/chat/conversations/:id/actions/accept
 *
 * Accept a pending conversation request.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { resolveAndValidateParticipant, findOtherParticipant } from './participant-helper';
import { idParamSchema } from '../types';

export function registerAcceptAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  chatEventPublisher?: IChatEventPublisher,
) {
  app.post('/api/v3/chat/conversations/:id/actions/accept', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const { userId } = await resolveAndValidateParticipant(supabase, clerkUserId, id);

    await supabase
      .from('chat_conversation_participants')
      .update({ request_state: 'accepted', updated_at: new Date().toISOString() })
      .eq('conversation_id', id)
      .eq('user_id', userId);

    const other = await findOtherParticipant(supabase, id, userId);
    if (other) {
      await chatEventPublisher?.conversationAccepted(other.user_id, { conversationId: id, acceptedBy: userId });
    }

    return reply.send({ data: { message: 'Conversation accepted' } });
  });
}
