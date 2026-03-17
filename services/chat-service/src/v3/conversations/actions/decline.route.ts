/**
 * POST /api/v3/chat/conversations/:id/actions/decline
 *
 * Decline a pending conversation request. Also archives it for the decliner.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { resolveAndValidateParticipant, findOtherParticipant } from './participant-helper';
import { idParamSchema } from '../types';

export function registerDeclineAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  chatEventPublisher?: IChatEventPublisher,
) {
  app.post('/api/v3/chat/conversations/:id/actions/decline', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const { userId } = await resolveAndValidateParticipant(supabase, clerkUserId, id);

    const now = new Date().toISOString();
    await supabase
      .from('chat_conversation_participants')
      .update({ request_state: 'declined', archived_at: now, updated_at: now })
      .eq('conversation_id', id)
      .eq('user_id', userId);

    const other = await findOtherParticipant(supabase, id, userId);
    if (other) {
      await chatEventPublisher?.conversationDeclined(other.user_id, { conversationId: id, declinedBy: userId });
    }

    return reply.send({ data: { message: 'Conversation declined' } });
  });
}
