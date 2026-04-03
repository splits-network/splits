/**
 * User Roles V3 Routes — CRUD (platform admin only)
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { UserRoleRepository } from './repository.js';
import { UserRoleService } from './service.js';
import {
  CreateUserRoleInput,
  UpdateUserRoleInput,
  UserRoleListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types.js';
import { registerUserRoleDetailView } from './views/detail.route.js';

export function registerUserRoleRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new UserRoleRepository(supabase);
  const service = new UserRoleService(repository, supabase, eventPublisher);

  // Register views before parameterized CRUD routes
  registerUserRoleDetailView(app, supabase);

  // GET /api/v3/user-roles — list
  app.get('/api/v3/user-roles', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as UserRoleListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/user-roles/:id — get by id
  app.get('/api/v3/user-roles/:id', {
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

  // POST /api/v3/user-roles — create
  app.post('/api/v3/user-roles', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateUserRoleInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/user-roles/:id — update
  app.patch('/api/v3/user-roles/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateUserRoleInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/user-roles/:id — delete (soft)
  app.delete('/api/v3/user-roles/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'User role deleted successfully' } });
  });
}
