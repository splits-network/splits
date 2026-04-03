/**
 * GET /api/v3/jobs/views/termination-impact
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { TerminationImpactRepository } from './termination-impact.repository.js';
import { TerminationImpactService } from './termination-impact.service.js';

const querySchema = {
  type: 'object',
  required: ['recruiter_id', 'company_id'],
  properties: {
    recruiter_id: { type: 'string', format: 'uuid' },
    company_id: { type: 'string', format: 'uuid' },
  },
};

export function registerTerminationImpactView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new TerminationImpactRepository(supabase);
  const service = new TerminationImpactService(repository);

  app.get('/api/v3/jobs/views/termination-impact', {
    schema: { querystring: querySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { recruiter_id, company_id } = request.query as { recruiter_id: string; company_id: string };
    const data = await service.getImpact(recruiter_id, company_id);
    return reply.send({ data });
  });
}
