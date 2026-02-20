/**
 * Content Service Gateway Routes
 *
 * Proxies CMS page requests to the content-service.
 * Public GET routes (no auth) + Admin write routes (auth required).
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { getCorrelationId, buildQueryString } from './common';

export function registerContentRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const contentService = () => services.get('content');
    const apiBase = '/api/v2/pages';
    const serviceBase = '/api/v2/pages';
    const navApiBase = '/api/v2/navigation';
    const navServiceBase = '/api/v2/navigation';

    // ── PUBLIC: List pages ────────────────────────────────────────────
    app.get(apiBase, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const data = await contentService().get(
            serviceBase,
            request.query as Record<string, any>,
            correlationId,
            {}
        );
        return reply.send(data);
    });

    // ── PUBLIC: Get page by slug ──────────────────────────────────────
    app.get(`${apiBase}/by-slug/:slug`, async (request: FastifyRequest, reply: FastifyReply) => {
        const { slug } = request.params as { slug: string };
        const correlationId = getCorrelationId(request);
        const queryString = buildQueryString(request.query as Record<string, any>);
        const path = queryString
            ? `${serviceBase}/by-slug/${slug}?${queryString}`
            : `${serviceBase}/by-slug/${slug}`;
        const data = await contentService().get(path, undefined, correlationId, {});
        return reply.send(data);
    });

    // ── PUBLIC: Get page by ID ────────────────────────────────────────
    app.get(`${apiBase}/:id`, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await contentService().get(
            `${serviceBase}/${id}`,
            undefined,
            correlationId,
            {}
        );
        return reply.send(data);
    });

    // ── ADMIN: Create page ────────────────────────────────────────────
    app.post(apiBase, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const data = await contentService().post(
            serviceBase,
            request.body,
            correlationId,
            buildAuthHeaders(request)
        );
        return reply.code(201).send(data);
    });

    // ── ADMIN: Import page from JSON ──────────────────────────────────
    app.post(`${apiBase}/import`, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const queryString = buildQueryString(request.query as Record<string, any>);
        const path = queryString
            ? `${serviceBase}/import?${queryString}`
            : `${serviceBase}/import`;
        const data = await contentService().post(
            path,
            request.body,
            correlationId,
            buildAuthHeaders(request)
        );
        return reply.code(201).send(data);
    });

    // ── ADMIN: Update page ────────────────────────────────────────────
    app.patch(`${apiBase}/:id`, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await contentService().patch(
            `${serviceBase}/${id}`,
            request.body,
            correlationId,
            buildAuthHeaders(request)
        );
        return reply.send(data);
    });

    // ── ADMIN: Delete page ────────────────────────────────────────────
    app.delete(`${apiBase}/:id`, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await contentService().delete(
            `${serviceBase}/${id}`,
            correlationId,
            buildAuthHeaders(request)
        );
        return reply.send(data);
    });

    // ══════════════════════════════════════════════════════════════════
    // Navigation Routes
    // ══════════════════════════════════════════════════════════════════

    // ── PUBLIC: Get navigation by app + location ──────────────────────
    app.get(navApiBase, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const data = await contentService().get(
            navServiceBase,
            request.query as Record<string, any>,
            correlationId,
            {}
        );
        return reply.send(data);
    });

    // ── PUBLIC: Get navigation by ID ──────────────────────────────────
    app.get(`${navApiBase}/:id`, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await contentService().get(
            `${navServiceBase}/${id}`,
            undefined,
            correlationId,
            {}
        );
        return reply.send(data);
    });

    // ── ADMIN: Upsert navigation config ──────────────────────────────
    app.post(navApiBase, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const data = await contentService().post(
            navServiceBase,
            request.body,
            correlationId,
            buildAuthHeaders(request)
        );
        return reply.send(data);
    });
}
