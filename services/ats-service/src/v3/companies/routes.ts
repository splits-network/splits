/**
 * Companies V3 Routes — Core 5 CRUD
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { CompanyRepository } from './repository.js';
import { CompanyService } from './service.js';
import { registerCompanyContactsView } from './views/contacts.route.js';
import {
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types.js';

export function registerCompanyRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new CompanyRepository(supabase);
  const service = new CompanyService(repository, supabase, eventPublisher);

  // --- Views (registered before :id routes to avoid collision) ---
  registerCompanyContactsView(app, supabase);

  // --- Core 5 CRUD ---

  // GET /api/v3/companies — list
  app.get('/api/v3/companies', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as CompanyListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/companies/:id — get by id
  app.get('/api/v3/companies/:id', {
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

  // POST /api/v3/companies — create
  app.post('/api/v3/companies', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateCompanyInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/companies/:id — update
  app.patch('/api/v3/companies/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateCompanyInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/companies/:id — delete (soft)
  app.delete('/api/v3/companies/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Company deleted successfully' } });
  });
}
