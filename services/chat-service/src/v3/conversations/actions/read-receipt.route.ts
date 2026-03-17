/**
 * POST /api/v3/chat/conversations/:id/actions/read-receipt
 *
 * Update the read receipt for the caller in a conversation.
 * Uses the chat_mark_read RPC for atomic unread count reset.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { ReadReceiptActionRepository } from './read-receipt.repository';
import { ReadReceiptActionService } from './read-receipt.service';
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
  const repository = new ReadReceiptActionRepository(supabase);
  const service = new ReadReceiptActionService(repository, supabase, chatEventPublisher);

  app.post('/api/v3/chat/conversations/:id/actions/read-receipt', {
    schema: { params: idParamSchema, body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const body = request.body as { lastReadMessageId?: string };
    const data = await service.markRead(id, body.lastReadMessageId ?? null, clerkUserId);
    return reply.send({ data });
  });
}
