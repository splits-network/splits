/**
 * Recruiter Saved Candidates V3 Routes — GET, GET/:id, POST, DELETE
 * No PATCH — saved candidates have no editable fields
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { RecruiterSavedCandidateRepository } from './repository.js';
import { RecruiterSavedCandidateService } from './service.js';
import {
  CreateRecruiterSavedCandidateInput, RecruiterSavedCandidateListParams,
  idParamSchema, listQuerySchema, createSchema,
} from './types.js';

export function registerRecruiterSavedCandidateRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new RecruiterSavedCandidateRepository(supabase);
  const service = new RecruiterSavedCandidateService(repository, supabase, eventPublisher);

  // GET /api/v3/recruiter-saved-candidates
  app.get('/api/v3/recruiter-saved-candidates', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as RecruiterSavedCandidateListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/recruiter-saved-candidates/:id
  app.get('/api/v3/recruiter-saved-candidates/:id', {
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

  // POST /api/v3/recruiter-saved-candidates — idempotent
  app.post('/api/v3/recruiter-saved-candidates', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateRecruiterSavedCandidateInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/recruiter-saved-candidates/:id
  app.delete('/api/v3/recruiter-saved-candidates/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Saved candidate removed successfully' } });
  });
}
