/**
 * Admin Jobs View Routes
 * GET /admin/jobs, GET /admin/jobs/:id, PATCH /admin/jobs/:id/status,
 * GET /admin/job-counts-by-status
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminJobsRepository } from './jobs.repository';
import { adminJobsQuerySchema, idParamSchema, AdminListParams } from '../types';

function buildPagination(total: number, page: number, limit: number) {
    return { total, page, limit, total_pages: Math.ceil(total / limit) };
}

export function registerAdminJobsView(app: FastifyInstance, supabase: SupabaseClient) {
    const repository = new AdminJobsRepository(supabase);

    // GET /v3/admin/jobs — list with company join
    app.get('/v3/admin/jobs', {
        schema: { querystring: adminJobsQuerySchema },
    }, async (request, reply) => {
        const params = request.query as AdminListParams;
        const page = Math.max(1, params.page ?? 1);
        const limit = Math.min(100, Math.max(1, params.limit ?? 25));
        const { data, total } = await repository.findForAdmin(params);
        return reply.send({ data, pagination: buildPagination(total, page, limit) });
    });

    // GET /v3/admin/jobs/:id
    app.get('/v3/admin/jobs/:id', {
        schema: { params: idParamSchema },
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const data = await repository.findByIdForAdmin(id);
        return reply.send({ data });
    });

    // PATCH /v3/admin/jobs/:id/status
    app.patch('/v3/admin/jobs/:id/status', {
        schema: { params: idParamSchema },
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const { status } = request.body as { status: string };

        if (!status) {
            return reply.code(400).send({ error: { message: 'status is required' } });
        }

        const data = await repository.updateStatus(id, status);
        return reply.send({ data });
    });

    // GET /v3/admin/job-counts-by-status
    app.get('/v3/admin/job-counts-by-status', async (_request, reply) => {
        const data = await repository.getCountsByStatus();
        return reply.send({ data });
    });
}
