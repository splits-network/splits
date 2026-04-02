/**
 * Candidate Skills V3 Routes — List, Add, Remove, Bulk Replace
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateSkillRepository } from './repository.js';
import { CandidateSkillService } from './service.js';
import { registerWithDetailsView } from './views/with-details.route.js';
import {
  CreateCandidateSkillInput,
  BulkReplaceCandidateSkillsInput,
  listQuerySchema,
  createSchema,
  bulkReplaceSchema,
  candidateIdParamSchema,
  deleteParamSchema,
} from './types.js';

export function registerCandidateSkillRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CandidateSkillRepository(supabase);
  const service = new CandidateSkillService(repository, supabase);

  // Register views before parameterized routes
  registerWithDetailsView(app, supabase);

  // GET /api/v3/candidate-skills?candidate_id=
  app.get('/api/v3/candidate-skills', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { candidate_id } = request.query as { candidate_id: string };
    const data = await service.listByCandidateId(candidate_id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/candidate-skills — add single
  app.post('/api/v3/candidate-skills', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateCandidateSkillInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/candidate-skills/:candidateId/:skillId
  app.delete('/api/v3/candidate-skills/:candidateId/:skillId', {
    schema: { params: deleteParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { candidateId, skillId } = request.params as { candidateId: string; skillId: string };
    await service.delete(candidateId, skillId, clerkUserId);
    return reply.code(204).send();
  });

  // PUT /api/v3/candidate-skills/candidate/:candidateId/bulk-replace
  app.put('/api/v3/candidate-skills/candidate/:candidateId/bulk-replace', {
    schema: { params: candidateIdParamSchema, body: bulkReplaceSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { candidateId } = request.params as { candidateId: string };
    const { skills } = request.body as BulkReplaceCandidateSkillsInput;
    const data = await service.bulkReplace(candidateId, skills, clerkUserId);
    return reply.send({ data });
  });
}
