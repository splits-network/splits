/**
 * Admin Page Routes
 *
 * CRUD routes for content pages via admin-gateway.
 * Auth is enforced by admin-gateway — these routes trust x-clerk-user-id header.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { PageServiceV2 } from '../pages/service.js';
import { getUserContext } from '../shared/helpers.js';
import { PageCreate, PageUpdate } from '../pages/types.js';

interface PageRoutesConfig {
    supabase: SupabaseClient;
    pageService: PageServiceV2;
}

export function registerAdminPageRoutes(
    app: FastifyInstance,
    config: PageRoutesConfig,
) {
    const { supabase, pageService } = config;

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
            if (params.app) {
                query = query.eq('app', params.app);
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
            const page = await pageService.getPageById(id);

            if (!page) {
                return reply.code(404).send({ error: { message: 'Page not found' } });
            }

            reply.send({ data: page });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to get page' } });
        }
    });

    // POST /admin/pages — create a new page
    app.post('/admin/pages', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const context = getUserContext(request);
            if (!context) {
                return reply.code(401).send({ error: { message: 'Missing x-clerk-user-id header' } });
            }

            const data = request.body as PageCreate;
            const page = await pageService.createPage(data, context.clerkUserId);
            reply.code(201).send({ data: page });
        } catch (error: any) {
            const msg = error.message || 'Failed to create page';
            const status = msg.includes('already exists') ? 409
                : msg.includes('required') || msg.includes('Invalid') || msg.includes('must be') ? 400
                : 500;
            reply.code(status).send({ error: { message: msg } });
        }
    });

    // POST /admin/pages/import — import page from JSON
    app.post('/admin/pages/import', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const context = getUserContext(request);
            if (!context) {
                return reply.code(401).send({ error: { message: 'Missing x-clerk-user-id header' } });
            }

            const { upsert } = request.query as { upsert?: string };
            const data = request.body as PageCreate;
            const page = await pageService.importPage(data, context.clerkUserId, upsert === 'true');
            reply.code(201).send({ data: page });
        } catch (error: any) {
            const msg = error.message || 'Failed to import page';
            reply.code(400).send({ error: { message: msg } });
        }
    });

    // PATCH /admin/pages/:id — update a page
    app.patch('/admin/pages/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const context = getUserContext(request);
            if (!context) {
                return reply.code(401).send({ error: { message: 'Missing x-clerk-user-id header' } });
            }

            const { id } = request.params as { id: string };
            const updates = request.body as PageUpdate;
            const page = await pageService.updatePage(id, updates, context.clerkUserId);
            reply.send({ data: page });
        } catch (error: any) {
            const msg = error.message || 'Failed to update page';
            const status = msg.includes('not found') ? 404
                : msg.includes('required') || msg.includes('Invalid') || msg.includes('must be') ? 400
                : 500;
            reply.code(status).send({ error: { message: msg } });
        }
    });

    // DELETE /admin/pages/:id — soft-delete a page
    app.delete('/admin/pages/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const context = getUserContext(request);
            if (!context) {
                return reply.code(401).send({ error: { message: 'Missing x-clerk-user-id header' } });
            }

            const { id } = request.params as { id: string };
            await pageService.deletePage(id, context.clerkUserId);
            reply.send({ data: { message: 'Page deleted successfully' } });
        } catch (error: any) {
            const msg = error.message || 'Failed to delete page';
            const status = msg.includes('not found') ? 404 : 500;
            reply.code(status).send({ error: { message: msg } });
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
