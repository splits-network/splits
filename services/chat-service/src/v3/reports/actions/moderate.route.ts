/**
 * Moderate Action Route
 *
 * POST /api/v3/chat/reports/:id/actions/moderate
 * Admin-only. Takes a moderation action on a report.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ModerateActionRepository } from './moderate.repository.js';
import { ModerateActionService, ModerateInput } from './moderate.service.js';
import { IEventPublisher } from '../../../v2/shared/events.js';

const paramsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
};

const bodySchema = {
  type: 'object',
  required: ['action'],
  properties: {
    action: { type: 'string', enum: ['warn', 'mute_user', 'suspend_messaging', 'ban_user'] },
    status: { type: 'string', enum: ['new', 'in_review', 'resolved', 'dismissed'] },
    details: { type: 'object' },
  },
  additionalProperties: false,
};

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerModerateAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const repository = new ModerateActionRepository(supabase);
  const service = new ModerateActionService(repository, supabase, eventPublisher);

  app.post('/api/v3/chat/reports/:id/actions/moderate', {
    schema: { params: paramsSchema, body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const result = await service.moderate(id, request.body as ModerateInput, clerkUserId);
    return reply.send({ data: result });
  });
}
