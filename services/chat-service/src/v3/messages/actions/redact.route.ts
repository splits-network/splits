/**
 * POST /api/v3/chat/messages/:id/actions/redact
 *
 * Admin-only: redact a message (set redacted_at, optionally replace body).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher.js';
import { RedactActionRepository } from './redact.repository.js';
import { RedactActionService, RedactInput } from './redact.service.js';

const paramsSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

const bodySchema = {
  type: 'object',
  properties: {
    reason: { type: 'string', maxLength: 500 },
    edited_body: { type: 'string', maxLength: 5000 },
  },
  additionalProperties: false,
};

export function registerRedactAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  chatEventPublisher?: IChatEventPublisher,
) {
  const repository = new RedactActionRepository(supabase);
  const service = new RedactActionService(repository, supabase, eventPublisher, chatEventPublisher);

  app.post('/api/v3/chat/messages/:id/actions/redact', {
    schema: { params: paramsSchema, body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.redact(id, request.body as RedactInput, clerkUserId);
    return reply.send({ data });
  });
}
