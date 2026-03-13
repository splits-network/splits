/**
 * Company Sourcers V3 Routes — Core 5 CRUD + check-protection
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { CompanySourcerRepository } from './repository';
import { CompanySourcerService } from './service';
import {
  CreateCompanySourcerInput,
  UpdateCompanySourcerInput,
  CompanySourcerListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
  companyIdParamSchema,
} from './types';

export function registerCompanySourcerRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new CompanySourcerRepository(supabase);
  const service = new CompanySourcerService(repository, supabase, eventPublisher);

  // --- Non-parameterized routes first (before :id) ---

  // GET /api/v3/company-sourcers/check-protection/:companyId
  app.get('/api/v3/company-sourcers/check-protection/:companyId', {
    schema: { params: companyIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { companyId } = request.params as { companyId: string };
    const result = await service.checkProtection(companyId);
    return reply.send({ data: result });
  });

  // --- Core 5 CRUD ---

  // GET /api/v3/company-sourcers — list
  app.get('/api/v3/company-sourcers', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as CompanySourcerListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/company-sourcers/:id — get by id
  app.get('/api/v3/company-sourcers/:id', {
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

  // POST /api/v3/company-sourcers — create
  app.post('/api/v3/company-sourcers', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateCompanySourcerInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/company-sourcers/:id — update
  app.patch('/api/v3/company-sourcers/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateCompanySourcerInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/company-sourcers/:id — delete (admin only)
  app.delete('/api/v3/company-sourcers/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Company sourcer record deleted successfully' } });
  });
}
