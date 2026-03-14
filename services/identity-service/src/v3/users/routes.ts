/**
 * Users V3 Routes
 *
 * Non-parameterized routes registered BEFORE :id routes.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { UserRepository } from './repository';
import { UserService, type SourceApp } from './service';
import {
  CreateUserInput,
  UpdateUserInput,
  RegisterUserInput,
  ProfileImageInput,
  UserListParams,
  listQuerySchema,
  createSchema,
  registerSchema,
  updateSchema,
  profileImageSchema,
  activitySchema,
  idParamSchema,
} from './types';

export function registerUserRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new UserRepository(supabase);
  const service = new UserService(repository, supabase, eventPublisher);

  // GET /api/v3/users — list
  app.get('/api/v3/users', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as UserListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/users/me — current user with enriched access context
  app.get('/api/v3/users/me', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getMe(clerkUserId);
    return reply.send({ data });
  });

  // PATCH /api/v3/users/me — update current user
  app.patch('/api/v3/users/me', {
    schema: { body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const sourceApp = request.headers['x-source-app'] as SourceApp | undefined;
    const data = await service.updateMe(clerkUserId, request.body as UpdateUserInput, sourceApp);
    return reply.send({ data });
  });

  // POST /api/v3/users/register — self-registration
  app.post('/api/v3/users/register', {
    schema: { body: registerSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.register(clerkUserId, request.body as RegisterUserInput);
    return reply.code(201).send({ data });
  });

  // POST /api/v3/users/activity — internal: touch last_active_at
  app.post('/api/v3/users/activity', {
    schema: { body: activitySchema },
  }, async (request, reply) => {
    const { userId } = request.body as { userId: string };
    await service.touchLastActive(userId);
    return reply.send({ data: { ok: true } });
  });

  // PATCH /api/v3/users/profile-image — update profile image
  app.patch('/api/v3/users/profile-image', {
    schema: { body: profileImageSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const sourceApp = request.headers['x-source-app'] as SourceApp | undefined;
    const body = request.body as ProfileImageInput;
    const data = await service.updateProfileImage(clerkUserId, body, sourceApp);
    return reply.send({ data });
  });

  // DELETE /api/v3/users/profile-image — delete profile image
  app.delete('/api/v3/users/profile-image', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const sourceApp = request.headers['x-source-app'] as SourceApp | undefined;
    const data = await service.deleteProfileImage(clerkUserId, sourceApp);
    return reply.send({ data });
  });

  // POST /api/v3/users — create
  app.post('/api/v3/users', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateUserInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // GET /api/v3/users/:id — get by id
  app.get('/api/v3/users/:id', {
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

  // PATCH /api/v3/users/:id — update
  app.patch('/api/v3/users/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const sourceApp = request.headers['x-source-app'] as SourceApp | undefined;
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateUserInput, clerkUserId, sourceApp);
    return reply.send({ data });
  });

  // DELETE /api/v3/users/:id — delete (soft)
  app.delete('/api/v3/users/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'User deleted successfully' } });
  });
}
