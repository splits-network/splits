/**
 * Company-Invitations V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { CompanyInvitationRepository } from './repository.js';
import { CompanyInvitationService } from './service.js';
import {
  CompanyInvitationListParams, CreateCompanyInvitationInput, CompleteRelationshipInput,
  listQuerySchema, createSchema, completeRelationshipSchema, lookupQuerySchema, idParamSchema,
} from './types.js';
import { registerCompanyInvitationDetailView } from './views/detail.route.js';
import { registerCompanyInvitationListView } from './views/list.route.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerCompanyInvitationRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new CompanyInvitationRepository(supabase);
  const service = new CompanyInvitationService(repository, supabase, eventPublisher);

  // --- Non-parameterized routes FIRST ---

  // GET /api/v3/company-invitations/lookup (public, no auth)
  app.get('/api/v3/company-invitations/lookup', {
    schema: { querystring: lookupQuerySchema },
  }, async (request, reply) => {
    const { code, token } = request.query as { code?: string; token?: string };
    if (!code && !token) return reply.code(400).send({ error: { code: 'MISSING_PARAMETER', message: 'Either code or token is required' } });
    const data = code ? await service.lookupByCode(code) : await service.lookupByToken(token!);
    return reply.send({ data });
  });

  // POST /api/v3/company-invitations/complete-relationship
  app.post('/api/v3/company-invitations/complete-relationship', {
    schema: { body: completeRelationshipSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { invitation_id, company_id } = request.body as CompleteRelationshipInput;
    const data = await service.completeRelationship(invitation_id, company_id, clerkUserId);
    return reply.send({ data });
  });

  // --- Views (before :id routes) ---
  registerCompanyInvitationListView(app, supabase);
  registerCompanyInvitationDetailView(app, supabase);

  // --- Core CRUD ---

  // GET /api/v3/company-invitations
  app.get('/api/v3/company-invitations', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as CompanyInvitationListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/company-invitations/:id
  app.get('/api/v3/company-invitations/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getById(id);
    return reply.send({ data });
  });

  // POST /api/v3/company-invitations
  app.post('/api/v3/company-invitations', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.create(request.body as CreateCompanyInvitationInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // POST /api/v3/company-invitations/:id/accept
  app.post('/api/v3/company-invitations/:id/accept', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.accept(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/company-invitations/:id/resend
  app.post('/api/v3/company-invitations/:id/resend', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.resendEmail(id, clerkUserId);
    return reply.send({ data: { message: 'Email sent successfully' } });
  });

  // PATCH /api/v3/company-invitations/:id/revoke
  app.patch('/api/v3/company-invitations/:id/revoke', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.revoke(id, clerkUserId);
    return reply.send({ data: { message: 'Invitation revoked successfully' } });
  });

  // DELETE /api/v3/company-invitations/:id
  app.delete('/api/v3/company-invitations/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Invitation deleted successfully' } });
  });
}
