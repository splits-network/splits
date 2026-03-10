/**
 * GET /api/v3/saved-jobs/views/enriched
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { EnrichedSavedJobRepository } from './enriched.repository';
import { EnrichedSavedJobService } from './enriched.service';
import { listQuerySchema, SavedJobListParams } from '../types';

export function registerEnrichedView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new EnrichedSavedJobRepository(supabase);
  const service = new EnrichedSavedJobService(repository, supabase);

  app.get('/api/v3/saved-jobs/views/enriched', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getEnriched(request.query as SavedJobListParams, clerkUserId);
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send(result);
  });
}
