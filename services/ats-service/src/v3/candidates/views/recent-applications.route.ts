/**
 * GET /api/v3/candidates/:id/view/recent-applications
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateRecentApplicationsRepository } from './recent-applications.repository';
import { CandidateRecentApplicationsService } from './recent-applications.service';
import { idParamSchema } from '../types';

const querySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 25, default: 5 },
  },
};

export function registerCandidateRecentApplicationsView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CandidateRecentApplicationsRepository(supabase);
  const service = new CandidateRecentApplicationsService(repository, supabase);

  app.get('/api/v3/candidates/:id/view/recent-applications', {
    schema: { params: idParamSchema, querystring: querySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const { limit } = request.query as { limit?: number };
    const data = await service.getRecentApplications(id, limit || 5, clerkUserId);
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send({ data });
  });
}
