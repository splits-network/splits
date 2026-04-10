/**
 * Admin V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminRepository } from './repository.js';
import { AdminService } from './service.js';
import {
  AdminListParams,
  adminListQuerySchema, recruiterStatusSchema, recruiterUpdateSchema,
  firmApprovalSchema, idParamSchema, statsQuerySchema,
} from './types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerAdminRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient
) {
  const repository = new AdminRepository(supabase);
  const service = new AdminService(repository, supabase);

  // GET /api/v3/admin/counts
  app.get('/api/v3/admin/counts', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.getCounts(clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/admin/stats
  app.get('/api/v3/admin/stats', {
    schema: { querystring: statsQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { period } = request.query as { period?: string };
    const data = await service.getStats(period || '30d', clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/admin/recruiters
  app.get('/api/v3/admin/recruiters', {
    schema: { querystring: adminListQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.listRecruiters(request.query as AdminListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/admin/recruiters/:id
  app.get('/api/v3/admin/recruiters/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getRecruiterById(id, clerkUserId);
    return reply.send({ data });
  });

  // PATCH /api/v3/admin/recruiters/:id
  app.patch('/api/v3/admin/recruiters/:id', {
    schema: { params: idParamSchema, body: recruiterUpdateSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const updates = request.body as Record<string, unknown>;
    const data = await service.updateRecruiter(id, updates, clerkUserId);
    return reply.send({ data });
  });

  // PATCH /api/v3/admin/recruiters/:id/status
  app.patch('/api/v3/admin/recruiters/:id/status', {
    schema: { params: idParamSchema, body: recruiterStatusSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: string };
    const data = await service.updateRecruiterStatus(id, status, clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/admin/recruiter-companies
  app.get('/api/v3/admin/recruiter-companies', {
    schema: { querystring: adminListQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.listRecruiterCompanies(request.query as AdminListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/admin/firms
  app.get('/api/v3/admin/firms', {
    schema: { querystring: adminListQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.listFirms(request.query as AdminListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // PATCH /api/v3/admin/firms/:id/marketplace-approval
  app.patch('/api/v3/admin/firms/:id/marketplace-approval', {
    schema: { params: idParamSchema, body: firmApprovalSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const { approved } = request.body as { approved: boolean };
    const data = await service.updateFirmMarketplaceApproval(id, approved, clerkUserId);
    return reply.send({ data });
  });
}
