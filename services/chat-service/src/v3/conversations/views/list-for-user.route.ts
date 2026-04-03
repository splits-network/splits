/**
 * GET /api/v3/chat/conversations/views/list-for-user
 *
 * Enriched conversation list with participant details, filtered by
 * inbox/requests/archived. This is the primary list endpoint for the frontend.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher.js';
import { ListForUserRepository } from './list-for-user.repository.js';
import { ListForUserService } from './list-for-user.service.js';

const querySchema = {
  type: 'object',
  properties: {
    filter: { type: 'string', enum: ['inbox', 'requests', 'archived'], default: 'inbox' },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    cursor: { type: 'string' },
  },
};

export function registerListForUserView(
  app: FastifyInstance,
  supabase: SupabaseClient,
  _chatEventPublisher?: IChatEventPublisher,
) {
  const repository = new ListForUserRepository(supabase);
  const service = new ListForUserService(repository, supabase);

  app.get('/api/v3/chat/conversations/views/list-for-user', {
    schema: { querystring: querySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const query = request.query as any;
    const filter = (query.filter || 'inbox') as 'inbox' | 'requests' | 'archived';
    const limit = Math.min(parseInt(query.limit || '25', 10), 100);
    const cursor = query.cursor as string | undefined;

    const result = await service.getListForUser(clerkUserId, filter, limit, cursor);
    reply.header('Cache-Control', 'private, max-age=5');
    return reply.send({ data: result.data, pagination: { total: result.total, limit, cursor } });
  });
}
