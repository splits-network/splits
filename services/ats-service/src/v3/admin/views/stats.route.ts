/**
 * Admin Stats & Counts View Routes
 * GET /admin/counts, GET /admin/stats
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminStatsRepository } from './stats.repository.js';
import { periodQuerySchema } from '../types.js';

export function registerAdminStatsViews(app: FastifyInstance, supabase: SupabaseClient) {
    const repository = new AdminStatsRepository(supabase);

    // GET /v3/admin/counts — cross-resource totals
    app.get('/v3/admin/counts', async (_request, reply) => {
        const data = await repository.getCounts();
        return reply.send({ data });
    });

    // GET /v3/admin/stats?period=30d — sparklines, trends, funnel
    app.get('/v3/admin/stats', {
        schema: { querystring: periodQuerySchema },
    }, async (request, reply) => {
        const { period } = request.query as { period?: string };
        const data = await repository.getStats(period || '30d');
        return reply.send({ data });
    });
}
