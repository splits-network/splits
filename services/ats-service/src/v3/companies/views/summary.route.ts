/**
 * GET /api/v3/companies/:id/view/summary
 *
 * Returns public display fields (name, logo, website, industry, HQ location)
 * for a company. Available to any authenticated user — no access control.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CompanySummaryRepository } from './summary.repository.js';
import { CompanySummaryService } from './summary.service.js';
import { idParamSchema } from '../types.js';

export function registerCompanySummaryView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CompanySummaryRepository(supabase);
  const service = new CompanySummaryService(repository);

  app.get('/api/v3/companies/:id/view/summary', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getById(id);
    return reply.send({ data });
  });
}
