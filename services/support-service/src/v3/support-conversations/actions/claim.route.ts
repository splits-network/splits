/**
 * Admin Conversation Claim Action
 * POST /api/v3/support/conversations/:id/actions/claim
 *
 * Admin claims a conversation (assigns themselves).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events';
import { idParamSchema } from '../types';

export function registerConversationClaimAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  app.post('/api/v3/support/conversations/:id/actions/claim', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };

    const { data: conversation, error: findError } = await supabase
      .from('support_conversations')
      .select('id, status, assigned_to')
      .eq('id', id)
      .maybeSingle();

    if (findError) throw findError;
    if (!conversation) throw new NotFoundError('SupportConversation', id);

    const { data: updated, error: updateError } = await supabase
      .from('support_conversations')
      .update({ assigned_to: clerkUserId })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    if (eventPublisher) {
      await eventPublisher.publish('support_conversation.claimed', {
        conversation_id: id,
        admin_clerk_user_id: clerkUserId,
      }, 'support-service');
    }

    return reply.send({ data: updated });
  });
}
