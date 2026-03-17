/**
 * POST /api/v3/chat/conversations/:id/actions/archive
 *
 * Toggle archive state for a conversation. V3 uses a single POST with boolean body
 * instead of V2's POST+DELETE pair.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { resolveAndValidateParticipant } from './participant-helper';
import { idParamSchema } from '../types';

const bodySchema = {
  type: 'object',
  required: ['archived'],
  properties: {
    archived: { type: 'boolean' },
  },
  additionalProperties: false,
};

export function registerArchiveAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  chatEventPublisher?: IChatEventPublisher,
) {
  app.post('/api/v3/chat/conversations/:id/actions/archive', {
    schema: { params: idParamSchema, body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const { archived } = request.body as { archived: boolean };
    const { userId } = await resolveAndValidateParticipant(supabase, clerkUserId, id);

    const now = new Date().toISOString();
    await supabase
      .from('chat_conversation_participants')
      .update({ archived_at: archived ? now : null, updated_at: now })
      .eq('conversation_id', id)
      .eq('user_id', userId);

    await chatEventPublisher?.conversationUpdated(userId, { conversationId: id, archived });

    return reply.send({ data: { message: archived ? 'Conversation archived' : 'Conversation unarchived' } });
  });
}
