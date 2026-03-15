/**
 * Invitations V3 Routes — CRUD + accept/resend/preview
 *
 * Non-parameterized routes registered BEFORE :id routes.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { InvitationRepository } from './repository';
import { MembershipRepository } from '../memberships/repository';
import { UserRepository } from '../users/repository';
import { InvitationService } from './service';
import {
  CreateInvitationInput,
  UpdateInvitationInput,
  AcceptInvitationInput,
  InvitationListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  acceptSchema,
  idParamSchema,
} from './types';

export function registerInvitationRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new InvitationRepository(supabase);
  const userRepository = new UserRepository(supabase);
  const membershipRepository = new MembershipRepository(supabase);
  const service = new InvitationService(
    repository, userRepository, membershipRepository, supabase, eventPublisher
  );

  // GET /api/v3/invitations — list
  app.get('/api/v3/invitations', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as InvitationListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // POST /api/v3/invitations — create
  app.post('/api/v3/invitations', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateInvitationInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // GET /api/v3/invitations/:id/preview — public preview (no auth)
  app.get('/api/v3/invitations/:id/preview', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await service.getPreview(id);
    return reply.send({ data });
  });

  // POST /api/v3/invitations/:id/accept — accept invitation
  app.post('/api/v3/invitations/:id/accept', {
    schema: { params: idParamSchema, body: acceptSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const { user_email } = request.body as AcceptInvitationInput;
    await service.accept(id, clerkUserId, user_email);
    return reply.send({ data: { success: true } });
  });

  // POST /api/v3/invitations/:id/resend — resend invitation
  app.post('/api/v3/invitations/:id/resend', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.resend(clerkUserId, id);
    return reply.send({ data: { success: true } });
  });

  // GET /api/v3/invitations/:id — get by id
  app.get('/api/v3/invitations/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const { email } = request.query as { email?: string };
    const data = await service.getById(id, clerkUserId, email);
    return reply.send({ data });
  });

  // PATCH /api/v3/invitations/:id — update
  app.patch('/api/v3/invitations/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateInvitationInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/invitations/:id — delete (soft)
  app.delete('/api/v3/invitations/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Invitation deleted successfully' } });
  });
}
