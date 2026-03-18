/**
 * GET /api/v3/candidate-skills/views/with-details — skills with full skill info
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { WithDetailsCandidateSkillRepository } from './with-details.repository';
import { listQuerySchema } from '../types';

export function registerWithDetailsView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new WithDetailsCandidateSkillRepository(supabase);
  const accessResolver = new AccessContextResolver(supabase);

  app.get('/api/v3/candidate-skills/views/with-details', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const context = await accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId && !context.candidateId) {
      throw new ForbiddenError('Insufficient permissions');
    }

    const { candidate_id } = request.query as { candidate_id: string };
    const data = await repository.findByCandidateId(candidate_id);
    return reply.send({ data });
  });
}
