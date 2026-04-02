/**
 * Admin Lists View Routes
 * GET /admin/applications, /admin/candidates, /admin/assignments, /admin/placements
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminListsRepository } from './lists.repository.js';
import {
    adminListQuerySchema,
    adminApplicationsQuerySchema,
    adminPlacementsQuerySchema,
    AdminListParams,
} from '../types.js';

export function registerAdminListViews(app: FastifyInstance, supabase: SupabaseClient) {
    const repository = new AdminListsRepository(supabase);

    // GET /v3/admin/applications — list with job + candidate joins
    app.get('/v3/admin/applications', {
        schema: { querystring: adminApplicationsQuerySchema },
    }, async (request, reply) => {
        const params = request.query as AdminListParams;
        const result = await repository.listApplications(params);
        return reply.send(result);
    });

    // GET /v3/admin/candidates — flat list with search
    app.get('/v3/admin/candidates', {
        schema: { querystring: adminListQuerySchema },
    }, async (request, reply) => {
        const params = request.query as AdminListParams;
        const result = await repository.listCandidates(params);
        return reply.send(result);
    });

    // GET /v3/admin/assignments — list with job join
    app.get('/v3/admin/assignments', {
        schema: { querystring: adminListQuerySchema },
    }, async (request, reply) => {
        const params = request.query as AdminListParams;
        const result = await repository.listAssignments(params);
        return reply.send(result);
    });

    // GET /v3/admin/placements — flat list with search + state filter
    app.get('/v3/admin/placements', {
        schema: { querystring: adminPlacementsQuerySchema },
    }, async (request, reply) => {
        const params = request.query as AdminListParams;
        const result = await repository.listPlacements(params);
        return reply.send(result);
    });
}
