/**
 * Admin V3 Routes — Admin dashboard endpoints
 *
 * Non-parameterized routes registered BEFORE :id routes.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminRepository } from './repository';
import { AdminService } from './service';
import {
  AdminListParams,
  adminListQuerySchema,
  adminActivityQuerySchema,
  adminPeriodQuerySchema,
  idParamSchema,
} from './types';

export function registerAdminRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient
) {
  const repository = new AdminRepository(supabase);
  const service = new AdminService(repository, supabase);

  // GET /api/v3/admin/users — list users (admin)
  app.get('/api/v3/admin/users', {
    schema: { querystring: adminListQuerySchema },
  }, async (request, reply) => {
    const result = await service.listUsers(request.query as AdminListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/admin/organizations — list organizations (admin)
  app.get('/api/v3/admin/organizations', {
    schema: { querystring: adminListQuerySchema },
  }, async (request, reply) => {
    const result = await service.listOrganizations(request.query as AdminListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/admin/counts — get entity counts
  app.get('/api/v3/admin/counts', async (_request, reply) => {
    const data = await service.getCounts();
    return reply.send({ data });
  });

  // GET /api/v3/admin/activity — get recent activity
  app.get('/api/v3/admin/activity', {
    schema: { querystring: adminActivityQuerySchema },
  }, async (request, reply) => {
    const params = request.query as { scope?: string; limit?: number };
    const data = await service.getActivity(params);
    return reply.send({ data });
  });

  // GET /api/v3/admin/stats — get admin stats
  app.get('/api/v3/admin/stats', {
    schema: { querystring: adminPeriodQuerySchema },
  }, async (request, reply) => {
    const { period } = request.query as { period?: string };
    const data = await service.getStats(period || '30d');
    return reply.send({ data });
  });

  // GET /api/v3/admin/chart-data — get chart data
  app.get('/api/v3/admin/chart-data', {
    schema: { querystring: adminPeriodQuerySchema },
  }, async (request, reply) => {
    const { period } = request.query as { period?: string };
    const data = await service.getChartData(period || '30d');
    return reply.send({ data });
  });

  // GET /api/v3/admin/users/:id — get user by id (admin)
  app.get('/api/v3/admin/users/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await service.getUser(id);
    return reply.send({ data });
  });
}
