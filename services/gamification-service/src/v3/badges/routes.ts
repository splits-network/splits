/**
 * Badges V3 Routes — GET list, GET by id
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { BadgeRepository } from './repository';
import { BadgeService } from './service';
import { BadgeListParams, idParamSchema, listQuerySchema } from './types';

export function registerBadgeRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new BadgeRepository(supabase);
  const service = new BadgeService(repository, supabase);

  app.get('/api/v3/badges', { schema: { querystring: listQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const result = await service.getAll(request.query as BadgeListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/badges/:id', { schema: { params: idParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const data = await service.getById((request.params as { id: string }).id, clerkUserId);
    return reply.send({ data });
  });
}
