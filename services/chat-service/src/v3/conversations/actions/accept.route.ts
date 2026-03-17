/**
 * POST /api/v3/chat/conversations/:id/actions/accept
 *
 * Accept a pending conversation request.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { AcceptActionRepository } from './accept.repository';
import { AcceptActionService } from './accept.service';
import { idParamSchema } from '../types';

export function registerAcceptAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  chatEventPublisher?: IChatEventPublisher,
) {
  const repository = new AcceptActionRepository(supabase);
  const service = new AcceptActionService(repository, supabase, eventPublisher, chatEventPublisher);

  app.post('/api/v3/chat/conversations/:id/actions/accept', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.accept(id, clerkUserId);
    return reply.send({ data });
  });
}
