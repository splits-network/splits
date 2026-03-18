/**
 * GET /api/v3/job-skills/views/with-details — job skills with full skill info
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { WithDetailsJobSkillRepository } from './with-details.repository';
import { listQuerySchema, JobSkillListParams } from '../types';

export function registerWithDetailsView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new WithDetailsJobSkillRepository(supabase);

  app.get('/api/v3/job-skills/views/with-details', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const params = request.query as JobSkillListParams;
    const { data, total } = await repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 100, 100);
    return reply.send({
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    });
  });
}
