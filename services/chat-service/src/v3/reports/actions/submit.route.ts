/**
 * Submit Action Route
 *
 * POST /api/v3/chat/reports/actions/submit
 * User-facing. Submits a report against another user in a conversation.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { SubmitActionRepository } from './submit.repository.js';
import { SubmitActionService, SubmitReportInput } from './submit.service.js';
import { IEventPublisher } from '../../../v2/shared/events.js';

const bodySchema = {
  type: 'object',
  required: ['conversationId', 'reportedUserId', 'category'],
  properties: {
    conversationId: { type: 'string', format: 'uuid' },
    reportedUserId: { type: 'string', format: 'uuid' },
    category: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', maxLength: 2000 },
  },
  additionalProperties: false,
};

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerSubmitAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const repository = new SubmitActionRepository(supabase);
  const service = new SubmitActionService(repository, supabase, eventPublisher);

  app.post('/api/v3/chat/reports/actions/submit', {
    schema: { body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.submit(request.body as SubmitReportInput, clerkUserId);
    return reply.code(201).send({ data: result });
  });
}
