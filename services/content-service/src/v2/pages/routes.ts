/**
 * Content Pages Routes
 *
 * HTTP endpoints following the V2 5-route pattern + slug lookup + import.
 */

import { FastifyInstance } from 'fastify';
import { PageServiceV2 } from './service';
import { getUserContext, requireUserContext } from '../shared/helpers';
import { PageFilters, PageCreate, PageUpdate } from './types';

interface RegisterConfig {
    pageService: PageServiceV2;
}

export function registerPageRoutes(app: FastifyInstance, config: RegisterConfig) {
    const { pageService } = config;

    // ── PUBLIC: List pages ────────────────────────────────────────────
    // GET /api/v2/pages?app=portal&category=marketing&status=published
    app.get('/api/v2/pages', async (request, reply) => {
        const filters = request.query as PageFilters;
        const result = await pageService.getPages(filters);
        return reply.send({ data: result.data, pagination: result.pagination });
    });

    // ── PUBLIC: Get page by slug ──────────────────────────────────────
    // GET /api/v2/pages/by-slug/about?app=portal
    app.get('/api/v2/pages/by-slug/:slug', async (request, reply) => {
        const { slug } = request.params as { slug: string };
        const { app: appName } = request.query as { app?: string };

        if (!appName) {
            return reply.code(400).send({ error: 'Query parameter "app" is required' });
        }

        const page = await pageService.getPageBySlug(slug, appName);
        if (!page) {
            return reply.code(404).send({ error: 'Page not found' });
        }

        return reply.send({ data: page });
    });

    // ── PUBLIC: Get page by ID ────────────────────────────────────────
    // GET /api/v2/pages/:id
    app.get('/api/v2/pages/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const page = await pageService.getPageById(id);

        if (!page) {
            return reply.code(404).send({ error: 'Page not found' });
        }

        return reply.send({ data: page });
    });

    // ── ADMIN: Create page ────────────────────────────────────────────
    // POST /api/v2/pages
    app.post('/api/v2/pages', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const data = request.body as PageCreate;
        const page = await pageService.createPage(data, clerkUserId);
        return reply.code(201).send({ data: page });
    });

    // ── ADMIN: Import page from JSON ──────────────────────────────────
    // POST /api/v2/pages/import?upsert=true
    app.post('/api/v2/pages/import', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { upsert } = request.query as { upsert?: string };
        const data = request.body as PageCreate;
        const page = await pageService.importPage(data, clerkUserId, upsert === 'true');
        return reply.code(201).send({ data: page });
    });

    // ── ADMIN: Update page ────────────────────────────────────────────
    // PATCH /api/v2/pages/:id
    app.patch('/api/v2/pages/:id', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };
        const updates = request.body as PageUpdate;
        const page = await pageService.updatePage(id, updates, clerkUserId);
        return reply.send({ data: page });
    });

    // ── ADMIN: Delete page (soft) ─────────────────────────────────────
    // DELETE /api/v2/pages/:id
    app.delete('/api/v2/pages/:id', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };
        await pageService.deletePage(id, clerkUserId);
        return reply.send({ data: { message: 'Page deleted successfully' } });
    });
}
