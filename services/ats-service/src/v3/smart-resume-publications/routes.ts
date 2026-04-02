/**
 * Smart Resume Publications V3 Routes — Core 5 CRUD
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { SmartResumePublicationRepository } from './repository.js';
import { SmartResumePublicationService } from './service.js';
import {
  CreateSmartResumePublicationInput,
  UpdateSmartResumePublicationInput,
  SmartResumePublicationListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types.js';

export function registerSmartResumePublicationRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new SmartResumePublicationRepository(supabase);
  const service = new SmartResumePublicationService(repository, supabase, eventPublisher);

  // GET /api/v3/smart-resume-publications
  app.get('/api/v3/smart-resume-publications', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as SmartResumePublicationListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/smart-resume-publications/:id
  app.get('/api/v3/smart-resume-publications/:id', {
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

  // POST /api/v3/smart-resume-publications
  app.post('/api/v3/smart-resume-publications', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateSmartResumePublicationInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/smart-resume-publications/:id
  app.patch('/api/v3/smart-resume-publications/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateSmartResumePublicationInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/smart-resume-publications/:id
  app.delete('/api/v3/smart-resume-publications/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Smart resume publication deleted successfully' } });
  });
}
