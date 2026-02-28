import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';

interface AdminContentRoutesConfig {
    supabase: SupabaseClient;
}

export function registerAdminContentRoutes(
    app: FastifyInstance,
    config: AdminContentRoutesConfig
) {
    const { supabase } = config;

    // GET /admin/pages — list all pages (no status filter default)
    app.get('/admin/pages', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const page = Math.max(1, parseInt(params.page, 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(params.limit, 10) || 25));
            const offset = (page - 1) * limit;
            const sortBy = params.sort_by || 'updated_at';
            const ascending = params.sort_order === 'asc';

            let query = supabase
                .from('content_pages')
                .select('*', { count: 'exact' })
                .is('deleted_at', null);

            if (params.status && params.status !== 'all') {
                query = query.eq('status', params.status);
            }
            if (params.search) {
                query = query.or(`title.ilike.%${params.search}%,slug.ilike.%${params.search}%`);
            }

            query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

            const { data, count, error } = await query;
            if (error) throw error;

            reply.send({
                data: data || [],
                pagination: {
                    total: count || 0,
                    page,
                    limit,
                    total_pages: Math.ceil((count || 0) / limit),
                },
            });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list pages' } });
        }
    });

    // GET /admin/pages/:id — get single page by ID
    app.get('/admin/pages/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const { data, error } = await supabase
                .from('content_pages')
                .select('*')
                .eq('id', id)
                .is('deleted_at', null)
                .maybeSingle();

            if (error) throw error;
            if (!data) {
                return reply.code(404).send({ error: { message: 'Page not found' } });
            }

            reply.send({ data });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to get page' } });
        }
    });

    // GET /admin/counts — content page counts
    app.get('/admin/counts', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const [pagesRes, publishedRes, draftRes] = await Promise.all([
                supabase
                    .from('content_pages')
                    .select('id', { count: 'exact', head: true })
                    .is('deleted_at', null),
                supabase
                    .from('content_pages')
                    .select('id', { count: 'exact', head: true })
                    .is('deleted_at', null)
                    .eq('status', 'published'),
                supabase
                    .from('content_pages')
                    .select('id', { count: 'exact', head: true })
                    .is('deleted_at', null)
                    .eq('status', 'draft'),
            ]);

            reply.send({
                data: {
                    pages_total: pagesRes.count || 0,
                    pages_published: publishedRes.count || 0,
                    pages_draft: draftRes.count || 0,
                },
            });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to fetch counts' } });
        }
    });
}
