/**
 * Recruiter-Companies V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { RecruiterCompanyRepository } from './repository.js';
import { RecruiterCompanyService } from './service.js';
import { RecruiterActivityRepository } from '../recruiter-activity/repository.js';
import { RecruiterActivityService } from '../recruiter-activity/service.js';
import {
  RecruiterCompanyListParams, InviteRecruiterInput, RespondInput, TerminateInput,
  RecruiterCompanyUpdate, RequestConnectionInput,
  listQuerySchema, inviteSchema, respondSchema, terminateSchema, updateSchema,
  requestConnectionSchema, idParamSchema, companyIdParamSchema,
} from './types.js';
import { registerRecruiterCompanyDetailView } from './views/detail.route.js';
import { registerRecruiterCompanyListView } from './views/list.route.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerRecruiterCompanyRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new RecruiterCompanyRepository(supabase);
  const activityRepo = new RecruiterActivityRepository(supabase);
  const activityService = new RecruiterActivityService(activityRepo);
  const service = new RecruiterCompanyService(repository, supabase, eventPublisher, activityService);

  // --- Non-parameterized routes FIRST ---

  // GET /api/v3/recruiter-companies/my-permissions
  app.get('/api/v3/recruiter-companies/my-permissions', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { data: user } = await supabase.from('users').select('id').eq('clerk_user_id', clerkUserId).single();
    if (!user) return reply.send({ data: [] });
    const { data: recruiter } = await supabase.from('recruiters').select('id').eq('user_id', user.id).single();
    if (!recruiter) return reply.send({ data: [] });
    const data = await service.getAllPermissionsForRecruiter(recruiter.id);
    return reply.send({ data });
  });

  // GET /api/v3/recruiter-companies/my-permissions/:companyId
  app.get('/api/v3/recruiter-companies/my-permissions/:companyId', {
    schema: { params: companyIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { companyId } = request.params as { companyId: string };
    const { data: user } = await supabase.from('users').select('id').eq('clerk_user_id', clerkUserId).single();
    if (!user) return reply.send({ data: null });
    const { data: recruiter } = await supabase.from('recruiters').select('id').eq('user_id', user.id).single();
    if (!recruiter) return reply.send({ data: null });
    const data = await service.getPermissions(recruiter.id, companyId);
    return reply.send({ data });
  });

  // POST /api/v3/recruiter-companies/request-connection
  app.post('/api/v3/recruiter-companies/request-connection', {
    schema: { body: requestConnectionSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.requestConnection(request.body as RequestConnectionInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // POST /api/v3/recruiter-companies/invite
  app.post('/api/v3/recruiter-companies/invite', {
    schema: { body: inviteSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.inviteRecruiter(request.body as InviteRecruiterInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // --- Views (before :id to avoid collision) ---
  registerRecruiterCompanyListView(app, supabase);
  registerRecruiterCompanyDetailView(app, supabase);

  // --- Core CRUD ---

  // GET /api/v3/recruiter-companies
  app.get('/api/v3/recruiter-companies', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    const params = request.query as RecruiterCompanyListParams;
    const result = await service.getAll(params, clerkUserId || undefined);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/recruiter-companies/:id
  app.get('/api/v3/recruiter-companies/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getById(id);
    return reply.send({ data });
  });

  // PATCH /api/v3/recruiter-companies/:id/respond
  app.patch('/api/v3/recruiter-companies/:id/respond', {
    schema: { params: idParamSchema, body: respondSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.respondToInvitation(id, request.body as RespondInput, clerkUserId);
    return reply.send({ data });
  });

  // PATCH /api/v3/recruiter-companies/:id
  app.patch('/api/v3/recruiter-companies/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as RecruiterCompanyUpdate, clerkUserId);
    return reply.send({ data });
  });

  // PATCH /api/v3/recruiter-companies/:id/terminate
  app.patch('/api/v3/recruiter-companies/:id/terminate', {
    schema: { params: idParamSchema, body: terminateSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.terminate(id, request.body as TerminateInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/recruiter-companies/:id
  app.delete('/api/v3/recruiter-companies/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Relationship deleted successfully' } });
  });
}
