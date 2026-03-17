/**
 * Recruiter Saved Jobs V3 Routes — GET, GET/:id, POST, DELETE
 * No PATCH — saved jobs have no editable fields
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { RecruiterSavedJobRepository } from './repository';
import { RecruiterSavedJobService } from './service';
import {
  CreateRecruiterSavedJobInput, RecruiterSavedJobListParams,
  idParamSchema, listQuerySchema, createSchema,
} from './types';

export function registerRecruiterSavedJobRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new RecruiterSavedJobRepository(supabase);
  const service = new RecruiterSavedJobService(repository, supabase, eventPublisher);

  // GET /api/v3/recruiter-saved-jobs
  app.get('/api/v3/recruiter-saved-jobs', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as RecruiterSavedJobListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/recruiter-saved-jobs/:id
  app.get('/api/v3/recruiter-saved-jobs/:id', {
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

  // POST /api/v3/recruiter-saved-jobs — idempotent
  app.post('/api/v3/recruiter-saved-jobs', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateRecruiterSavedJobInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/recruiter-saved-jobs/:id
  app.delete('/api/v3/recruiter-saved-jobs/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Saved job removed successfully' } });
  });
}
