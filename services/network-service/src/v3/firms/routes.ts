/**
 * Firms V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { FirmRepository } from './repository';
import { FirmService } from './service';
import { registerFirmDetailView } from './views/detail.route';
import {
  FirmListParams, FirmUpdate, CreateFirmInput, FirmMemberListParams,
  CreateFirmInvitationInput, TransferOwnershipInput, PublicFirmListParams,
  listQuerySchema, createSchema, updateSchema, invitationCreateSchema,
  transferOwnershipSchema, acceptInvitationSchema,
  idParamSchema, slugParamSchema, firmIdParamSchema, firmMemberParamsSchema,
  firmInvitationParamsSchema, tokenParamSchema,
} from './types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerFirmRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new FirmRepository(supabase);
  const service = new FirmService(repository, supabase, eventPublisher);

  // --- Non-parameterized routes FIRST ---

  app.get('/api/v3/firms/my-firm', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.getMyFirm(clerkUserId);
    return reply.send({ data });
  });

  app.get('/api/v3/firms/my-firms', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.getMyFirms(clerkUserId);
    return reply.send({ data });
  });

  app.get('/api/v3/firms/by-slug/:slug', {
    schema: { params: slugParamSchema },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const data = await service.getBySlug(slug);
    return reply.send({ data });
  });

  // --- Public routes ---

  app.get('/api/v3/public/firms', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const query = request.query as any;
    const params: PublicFirmListParams = {
      ...query,
      industries: query.industries ? [].concat(query.industries) : undefined,
      specialties: query.specialties ? [].concat(query.specialties) : undefined,
      placement_types: query.placement_types ? [].concat(query.placement_types) : undefined,
      geo_focus: query.geo_focus ? [].concat(query.geo_focus) : undefined,
      candidate_firm: query.candidate_firm === 'true' ? true : undefined,
    };
    const result = await service.getPublicFirms(params);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/public/firms/:slug', {
    schema: { params: slugParamSchema },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const data = await service.getPublicFirmBySlug(slug);
    return reply.send({ data });
  });

  app.get('/api/v3/public/firms/:slug/profile', {
    schema: { params: slugParamSchema },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const data = await service.getPublicFirmProfile(slug);
    if (!data) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Firm not found' } });
    return reply.send({ data });
  });

  app.get('/api/v3/public/firms/:slug/members', {
    schema: { params: slugParamSchema },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const data = await service.getPublicFirmMembers(slug);
    return reply.send({ data });
  });

  // --- Firm invitation acceptance ---

  app.get('/api/v3/firm-invitations/:token/preview', {
    schema: { params: tokenParamSchema },
  }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const data = await service.getInvitationPreview(token);
    return reply.send({ data });
  });

  app.post('/api/v3/firm-invitations/:token/accept', {
    schema: { params: tokenParamSchema, body: acceptInvitationSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { token } = request.params as { token: string };
    const { user_email } = request.body as { user_email: string };
    await service.acceptInvitation(token, clerkUserId, user_email);
    return reply.send({ data: { success: true } });
  });

  // --- Views (before :id to avoid route collision) ---

  registerFirmDetailView(app, supabase);

  // --- Core CRUD ---

  app.get('/api/v3/firms', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const query = request.query as any;
    const params: FirmListParams = {
      ...query,
      marketplace_visible: query.marketplace_visible !== undefined ? query.marketplace_visible === 'true' : undefined,
      candidate_firm: query.candidate_firm !== undefined ? query.candidate_firm === 'true' : undefined,
      industries: query.industries ? [].concat(query.industries) : undefined,
      specialties: query.specialties ? [].concat(query.specialties) : undefined,
      placement_types: query.placement_types ? [].concat(query.placement_types) : undefined,
      geo_focus: query.geo_focus ? [].concat(query.geo_focus) : undefined,
    };
    const result = await service.getAll(params, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/firms/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await service.getById(id);
    return reply.send({ data });
  });

  app.post('/api/v3/firms', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.create(request.body as CreateFirmInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  app.patch('/api/v3/firms/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as FirmUpdate, clerkUserId);
    return reply.send({ data });
  });

  app.delete('/api/v3/firms/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Firm deleted successfully' } });
  });

  // --- Members ---

  app.get('/api/v3/firms/:firmId/members', {
    schema: { params: firmIdParamSchema },
  }, async (request, reply) => {
    const { firmId } = request.params as { firmId: string };
    const query = request.query as FirmMemberListParams;
    const result = await service.getMembers(firmId, query);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.delete('/api/v3/firms/:firmId/members/:memberId', {
    schema: { params: firmMemberParamsSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { firmId, memberId } = request.params as { firmId: string; memberId: string };
    await service.removeMember(firmId, memberId, clerkUserId);
    return reply.send({ data: { message: 'Member removed successfully' } });
  });

  app.post('/api/v3/firms/:firmId/transfer-ownership', {
    schema: { params: firmIdParamSchema, body: transferOwnershipSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { firmId } = request.params as { firmId: string };
    const data = await service.transferOwnership(firmId, request.body as TransferOwnershipInput, clerkUserId);
    return reply.send({ data });
  });

  // --- Invitations ---

  app.get('/api/v3/firms/:firmId/invitations', {
    schema: { params: firmIdParamSchema },
  }, async (request, reply) => {
    const { firmId } = request.params as { firmId: string };
    const data = await service.listInvitations(firmId);
    return reply.send({ data });
  });

  app.post('/api/v3/firms/:firmId/invitations', {
    schema: { params: firmIdParamSchema, body: invitationCreateSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { firmId } = request.params as { firmId: string };
    const data = await service.createInvitation(firmId, request.body as CreateFirmInvitationInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  app.delete('/api/v3/firms/:firmId/invitations/:invitationId', {
    schema: { params: firmInvitationParamsSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { firmId, invitationId } = request.params as { firmId: string; invitationId: string };
    await service.cancelInvitation(firmId, invitationId, clerkUserId);
    return reply.send({ data: { message: 'Invitation cancelled successfully' } });
  });

  app.post('/api/v3/firms/:firmId/invitations/:invitationId/resend', {
    schema: { params: firmInvitationParamsSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { firmId, invitationId } = request.params as { firmId: string; invitationId: string };
    const data = await service.resendInvitation(firmId, invitationId, clerkUserId);
    return reply.send({ data });
  });
}
