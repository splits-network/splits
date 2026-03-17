/**
 * POST /api/v3/chat/conversations/:id/actions/mute
 *
 * Toggle mute state for a conversation. V3 uses a single POST with boolean body
 * instead of V2's POST+DELETE pair.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { MuteActionRepository } from './mute.repository';
import { MuteActionService } from './mute.service';
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
  eventPublisher?: IEventPublisher,
  chatEventPublisher?: IChatEventPublisher,
) {
  const repository = new MuteActionRepository(supabase);
  const service = new MuteActionService(repository, supabase, eventPublisher, chatEventPublisher);

  app.post('/api/v3/chat/conversations/:id/actions/mute', {
    schema: { params: idParamSchema, body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const { muted } = request.body as { muted: boolean };
    const data = await service.mute(id, muted, clerkUserId);
    return reply.send({ data });
  });
}
