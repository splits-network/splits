/**
 * Recruiter-Candidates V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { RecruiterCandidateRepository } from './repository';
import { RecruiterCandidateService } from './service';
import { RecruiterActivityRepository } from '../recruiter-activity/repository';
import { RecruiterActivityService } from '../recruiter-activity/service';
import {
  RecruiterCandidateListParams, CreateRecruiterCandidateInput, RecruiterCandidateUpdate,
  TerminateInput, listQuerySchema, createSchema, updateSchema, terminateSchema,
  idParamSchema, tokenParamSchema,
} from './types';
import { registerRecruiterCandidateDetailView } from './views/detail.route';
import { registerListForCandidateView } from './views/list-for-candidate.route';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerRecruiterCandidateRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new RecruiterCandidateRepository(supabase);
  const activityRepo = new RecruiterActivityRepository(supabase);
  const activityService = new RecruiterActivityService(activityRepo);
  const service = new RecruiterCandidateService(repository, supabase, eventPublisher, activityService);

  // --- Non-parameterized routes FIRST ---

  // GET /api/v3/recruiter-candidates/invitations/:token
  app.get('/api/v3/recruiter-candidates/invitations/:token', {
    schema: { params: tokenParamSchema },
  }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const data = await service.getInvitationByToken(token);
    return reply.send({ data });
  });

  // POST /api/v3/recruiter-candidates/invitations/:token/accept
  app.post('/api/v3/recruiter-candidates/invitations/:token/accept', {
    schema: { params: tokenParamSchema },
  }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const body = (request.body as Record<string, any>) || {};
    const metadata = {
      userId: body.userId as string | undefined,
      ip_address: (body.ip_address as string) || (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.ip,
      user_agent: (body.user_agent as string) || (request.headers['user-agent'] as string),
    };
    const data = await service.acceptInvitation(token, metadata);
    return reply.send({ data });
  });

  // POST /api/v3/recruiter-candidates/invitations/:token/decline
  app.post('/api/v3/recruiter-candidates/invitations/:token/decline', {
    schema: { params: tokenParamSchema },
  }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const body = (request.body as Record<string, any>) || {};
    const metadata = {
      reason: body.reason as string | undefined,
      ip_address: (body.ip_address as string) || (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.ip,
      user_agent: (body.user_agent as string) || (request.headers['user-agent'] as string),
    };
    const data = await service.declineInvitation(token, metadata);
    return reply.send({ data });
  });

  // --- Views (before :id to avoid collision) ---
  registerListForCandidateView(app, supabase);
  registerRecruiterCandidateDetailView(app, supabase);

  // --- Core CRUD ---

  // GET /api/v3/recruiter-candidates
  app.get('/api/v3/recruiter-candidates', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    const query = request.query as any;
    let parsedFilters: Record<string, any> = {};
    if (query.filters) {
      try { parsedFilters = typeof query.filters === 'string' ? JSON.parse(query.filters) : query.filters; } catch { /* ignore */ }
    }
    const params: RecruiterCandidateListParams = { ...query, filters: parsedFilters };
    const result = await service.getAll(params, clerkUserId || undefined);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/recruiter-candidates/:id
  app.get('/api/v3/recruiter-candidates/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await service.getById(id);
    return reply.send({ data });
  });

  // POST /api/v3/recruiter-candidates
  app.post('/api/v3/recruiter-candidates', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.create(request.body as CreateRecruiterCandidateInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/recruiter-candidates/:id
  app.patch('/api/v3/recruiter-candidates/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as RecruiterCandidateUpdate, clerkUserId);
    return reply.send({ data });
  });

  // PATCH /api/v3/recruiter-candidates/:id/terminate
  app.patch('/api/v3/recruiter-candidates/:id/terminate', {
    schema: { params: idParamSchema, body: terminateSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.terminate(id, request.body as TerminateInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/recruiter-candidates/:id
  app.delete('/api/v3/recruiter-candidates/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id);
    return reply.send({ data: { message: 'Relationship deleted successfully' } });
  });
}
