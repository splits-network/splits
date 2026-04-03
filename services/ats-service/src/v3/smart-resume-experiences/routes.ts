/**
 * Smart Resume Experiences V3 Routes -- Core 5 CRUD
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { SmartResumeExperienceRepository } from './repository.js';
import { SmartResumeExperienceService } from './service.js';
import {
  CreateSmartResumeExperienceInput,
  UpdateSmartResumeExperienceInput,
  SmartResumeExperienceListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types.js';

export function registerSmartResumeExperienceRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new SmartResumeExperienceRepository(supabase);
  const service = new SmartResumeExperienceService(repository, supabase, eventPublisher);

  // GET /api/v3/smart-resume-experiences
  app.get('/api/v3/smart-resume-experiences', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as SmartResumeExperienceListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/smart-resume-experiences/:id
  app.get('/api/v3/smart-resume-experiences/:id', {
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

  // POST /api/v3/smart-resume-experiences
  app.post('/api/v3/smart-resume-experiences', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateSmartResumeExperienceInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/smart-resume-experiences/:id
  app.patch('/api/v3/smart-resume-experiences/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateSmartResumeExperienceInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/smart-resume-experiences/:id
  app.delete('/api/v3/smart-resume-experiences/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Smart resume experience deleted successfully' } });
  });
}
