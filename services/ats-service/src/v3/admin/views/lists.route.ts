/**
 * Admin Lists View Routes
 * GET /admin/applications, /admin/candidates, /admin/assignments, /admin/placements
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminListsRepository } from './lists.repository';
import {
  adminListQuerySchema,
  adminApplicationsQuerySchema,
  adminPlacementsQuerySchema,
  AdminListParams,
} from '../types';

export function registerAdminListViews(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new AdminListsRepository(supabase);

  // GET /admin/applications — list with job + candidate joins
  app.get('/admin/applications', {
    schema: { querystring: adminApplicationsQuerySchema },
  }, async (request, reply) => {
    const params = request.query as AdminListParams;
    const result = await repository.listApplications(params);
    return reply.send(result);
  });

  // GET /admin/candidates — flat list with search
  app.get('/admin/candidates', {
    schema: { querystring: adminListQuerySchema },
  }, async (request, reply) => {
    const params = request.query as AdminListParams;
    const result = await repository.listCandidates(params);
    return reply.send(result);
  });

  // GET /admin/assignments — list with job join
  app.get('/admin/assignments', {
    schema: { querystring: adminListQuerySchema },
  }, async (request, reply) => {
    const params = request.query as AdminListParams;
    const result = await repository.listAssignments(params);
    return reply.send(result);
  });

  // GET /admin/placements — flat list with search + state filter
  app.get('/admin/placements', {
    schema: { querystring: adminPlacementsQuerySchema },
  }, async (request, reply) => {
    const params = request.query as AdminListParams;
    const result = await repository.listPlacements(params);
    return reply.send(result);
  });
}
