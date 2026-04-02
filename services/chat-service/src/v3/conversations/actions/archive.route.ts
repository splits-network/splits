/**
 * POST /api/v3/chat/conversations/:id/actions/archive
 *
 * Toggle archive state for a conversation. V3 uses a single POST with boolean body
 * instead of V2's POST+DELETE pair.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher.js';
import { ArchiveActionRepository } from './archive.repository.js';
import { ArchiveActionService } from './archive.service.js';
import { idParamSchema } from '../types.js';

const bodySchema = {
  type: 'object',
  required: ['archived'],
  properties: {
    archived: { type: 'boolean' },
  },
  additionalProperties: false,
};

export function registerArchiveAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  chatEventPublisher?: IChatEventPublisher,
) {
  const repository = new ArchiveActionRepository(supabase);
  const service = new ArchiveActionService(repository, supabase, eventPublisher, chatEventPublisher);

  app.post('/api/v3/chat/conversations/:id/actions/archive', {
    schema: { params: idParamSchema, body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const { archived } = request.body as { archived: boolean };
    const data = await service.archive(id, archived, clerkUserId);
    return reply.send({ data });
  });
}
