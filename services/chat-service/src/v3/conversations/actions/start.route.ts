/**
 * POST /api/v3/chat/conversations/actions/start
 *
 * Creates or finds a conversation with representation routing and context validation.
 * This replaces the V2 POST /conversations endpoint.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { StartActionRepository } from './start.repository';
import { StartActionService } from './start.service';

const bodySchema = {
  type: 'object',
  required: ['participantUserId'],
  properties: {
    participantUserId: { type: 'string', format: 'uuid' },
    context: {
      type: 'object',
      properties: {
        application_id: { type: 'string', format: 'uuid' },
        job_id: { type: 'string', format: 'uuid' },
        company_id: { type: 'string', format: 'uuid' },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

export function registerStartAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  chatEventPublisher?: IChatEventPublisher,
) {
  const repository = new StartActionRepository(supabase);
  const service = new StartActionService(repository, supabase, eventPublisher, chatEventPublisher);

  app.post('/api/v3/chat/conversations/actions/start', {
    schema: { body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const body = request.body as any;
    const data = await service.start(body, clerkUserId);
    return reply.status(201).send({ data });
  });
}
