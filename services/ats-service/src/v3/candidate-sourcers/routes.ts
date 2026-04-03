/**
 * Candidate Sourcers V3 Routes — Read-only + notes update + check-protection
 *
 * Sourcer attribution is immutable — set once at signup via referral link/code.
 * Create and delete routes have been removed to enforce this rule.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { CandidateSourcerRepository } from './repository.js';
import { CandidateSourcerService } from './service.js';
import {
  UpdateCandidateSourcerInput,
  CandidateSourcerListParams,
  listQuerySchema,
  updateSchema,
  idParamSchema,
  candidateIdParamSchema,
} from './types.js';

export function registerCandidateSourcerRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new CandidateSourcerRepository(supabase);
  const service = new CandidateSourcerService(repository, supabase, eventPublisher);

  // --- Non-parameterized routes first (before :id) ---

  // GET /api/v3/candidate-sourcers/check-protection/:candidateId
  app.get('/api/v3/candidate-sourcers/check-protection/:candidateId', {
    schema: { params: candidateIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { candidateId } = request.params as { candidateId: string };
    const result = await service.checkProtection(candidateId);
    return reply.send({ data: result });
  });

  // --- Read + notes-only update ---

  // GET /api/v3/candidate-sourcers — list
  app.get('/api/v3/candidate-sourcers', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as CandidateSourcerListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/candidate-sourcers/:id — get by id
  app.get('/api/v3/candidate-sourcers/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // PATCH /api/v3/candidate-sourcers/:id — update notes only
  app.patch('/api/v3/candidate-sourcers/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateCandidateSourcerInput, clerkUserId);
    return reply.send({ data });
  });

  // POST and DELETE removed — sourcer attribution is immutable
}
