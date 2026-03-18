/**
 * Recruiter-Codes V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { RecruiterCodeRepository } from './repository';
import { RecruiterCodeService } from './service';
import {
  RecruiterCodeListParams, CreateRecruiterCodeInput, RecruiterCodeUpdate, LogCodeUsageInput,
  listQuerySchema, createSchema, updateSchema, lookupQuerySchema, logUsageSchema, logListQuerySchema, idParamSchema,
} from './types';
import { registerRecruiterCodeDetailView } from './views/detail.route';
import { registerRecruiterCodeListView } from './views/list.route';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerRecruiterCodeRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new RecruiterCodeRepository(supabase);
  const service = new RecruiterCodeService(repository, supabase, eventPublisher);

  // --- Non-parameterized routes FIRST ---

  // GET /api/v3/recruiter-codes/lookup (public, no auth)
  app.get('/api/v3/recruiter-codes/lookup', {
    schema: { querystring: lookupQuerySchema },
  }, async (request, reply) => {
    const { code } = request.query as { code: string };
    const data = await service.lookupByCode(code);
    return reply.send({ data });
  });

  // GET /api/v3/recruiter-codes/default
  app.get('/api/v3/recruiter-codes/default', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.getDefault(clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/recruiter-codes/log
  app.get('/api/v3/recruiter-codes/log', {
    schema: { querystring: logListQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const params = request.query as { page?: number; limit?: number; recruiter_code_id?: string };
    const result = await service.getUsageLog(params, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // POST /api/v3/recruiter-codes/log
  app.post('/api/v3/recruiter-codes/log', {
    schema: { body: logUsageSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.logCodeUsage(request.body as LogCodeUsageInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // --- Views (before :id to avoid collision) ---
  registerRecruiterCodeListView(app, supabase);
  registerRecruiterCodeDetailView(app, supabase);

  // --- Core CRUD ---

  // GET /api/v3/recruiter-codes
  app.get('/api/v3/recruiter-codes', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as RecruiterCodeListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/recruiter-codes/:id
  app.get('/api/v3/recruiter-codes/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/recruiter-codes
  app.post('/api/v3/recruiter-codes', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.create(request.body as CreateRecruiterCodeInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/recruiter-codes/:id
  app.patch('/api/v3/recruiter-codes/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as RecruiterCodeUpdate, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/recruiter-codes/:id
  app.delete('/api/v3/recruiter-codes/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Referral code deleted successfully' } });
  });
}
