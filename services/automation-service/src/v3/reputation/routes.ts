/**
 * Reputation V3 Routes — GET list, GET by recruiter ID
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ReputationRepository } from './repository';
import { ReputationService } from './service';
import { ReputationListParams, recruiterIdParamSchema, listQuerySchema } from './types';

export function registerReputationRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new ReputationRepository(supabase);
  const service = new ReputationService(repository, supabase);

  app.get('/api/v3/reputation', { schema: { querystring: listQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const result = await service.getAll(request.query as ReputationListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/reputation/:recruiterId', { schema: { params: recruiterIdParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { recruiterId } = request.params as { recruiterId: string };
    const data = await service.getByRecruiterId(recruiterId, clerkUserId);
    return reply.send({ data });
  });
}
