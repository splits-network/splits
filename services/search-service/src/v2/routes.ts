import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';

interface RouteOptions extends FastifyPluginOptions {
    supabase: SupabaseClient;
}

/**
 * Register all V2 routes for search service
 */
export async function registerV2Routes(
    app: FastifyInstance,
    options: RouteOptions
) {
    const { supabase } = options;

    // Root V2 endpoint
    app.get('/', async (request, reply) => {
        return reply.send({
            data: {
                service: 'search-service',
                version: '1.0.0',
                endpoints: {
                    search: '/api/v2/search',
                },
            },
        });
    });

    // Search routes will be added in Task 2
}
