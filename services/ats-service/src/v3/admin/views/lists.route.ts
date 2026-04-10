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
    idParamSchema,
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

    // GET /v3/admin/applications/:id — detail with job + candidate + notes
    app.get('/v3/admin/applications/:id', {
        schema: { params: idParamSchema },
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const data = await repository.getApplicationById(id);
        return reply.send({ data });
    });

    // PATCH /v3/admin/applications/:id/stage — admin stage override
    app.patch('/v3/admin/applications/:id/stage', {
        schema: { params: idParamSchema },
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const { stage } = request.body as { stage: string };
        if (!stage) return reply.code(400).send({ error: { message: 'stage is required' } });
        const data = await repository.updateApplicationStage(id, stage);
        return reply.send({ data });
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
