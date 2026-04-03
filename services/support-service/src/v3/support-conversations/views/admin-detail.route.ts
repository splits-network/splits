/**
 * Admin Conversation Detail View
 * GET /api/v3/support/conversations/:id/view/admin-detail
 *
 * Returns conversation with joined messages — a view because it
 * queries multiple tables (support_conversations + support_messages).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@splits-network/shared-fastify';
import { idParamSchema } from '../types.js';

export function registerAdminDetailView(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  app.get('/api/v3/support/conversations/:id/view/admin-detail', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };

    const { data: conversation, error: convError } = await supabase
      .from('support_conversations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (convError) throw convError;
    if (!conversation) throw new NotFoundError('SupportConversation', id);

    const { data: messages, error: msgError } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
      .limit(200);

    if (msgError) throw msgError;

    return reply.send({
      data: {
        ...conversation,
        messages: messages || [],
      },
    });
  });
}
