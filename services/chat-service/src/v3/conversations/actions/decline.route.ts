/**
 * POST /api/v3/chat/conversations/:id/actions/decline
 *
 * Decline a pending conversation request. Also archives it for the decliner.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher.js';
import { DeclineActionRepository } from './decline.repository.js';
import { DeclineActionService } from './decline.service.js';
import { idParamSchema } from '../types.js';

export function registerDeclineAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  chatEventPublisher?: IChatEventPublisher,
) {
  const repository = new DeclineActionRepository(supabase);
  const service = new DeclineActionService(repository, supabase, eventPublisher, chatEventPublisher);

  app.post('/api/v3/chat/conversations/:id/actions/decline', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.decline(id, clerkUserId);
    return reply.send({ data });
  });
}
