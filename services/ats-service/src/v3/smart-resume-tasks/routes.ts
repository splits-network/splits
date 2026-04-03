/**
 * Smart Resume Tasks V3 Routes -- Core 5 CRUD
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { SmartResumeTaskRepository } from './repository.js';
import { SmartResumeTaskService } from './service.js';
import {
  CreateSmartResumeTaskInput,
  UpdateSmartResumeTaskInput,
  SmartResumeTaskListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types.js';

export function registerSmartResumeTaskRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new SmartResumeTaskRepository(supabase);
  const service = new SmartResumeTaskService(repository, supabase, eventPublisher);

  // GET /api/v3/smart-resume-tasks
  app.get('/api/v3/smart-resume-tasks', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as SmartResumeTaskListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/smart-resume-tasks/:id
  app.get('/api/v3/smart-resume-tasks/:id', {
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

  // POST /api/v3/smart-resume-tasks
  app.post('/api/v3/smart-resume-tasks', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateSmartResumeTaskInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/smart-resume-tasks/:id
  app.patch('/api/v3/smart-resume-tasks/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateSmartResumeTaskInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/smart-resume-tasks/:id
  app.delete('/api/v3/smart-resume-tasks/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Smart resume task deleted successfully' } });
  });
}
