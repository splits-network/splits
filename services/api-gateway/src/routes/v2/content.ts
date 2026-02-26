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
    // Content Images Routes
    // ══════════════════════════════════════════════════════════════════

    const imgApiBase = '/api/v2/content-images';
    const imgServiceBase = '/api/v2/content-images';

    // ── ADMIN: List content images ──────────────────────────────────────
    app.get(imgApiBase, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const queryString = buildQueryString(request.query as Record<string, any>);
        const path = queryString ? `${imgServiceBase}?${queryString}` : imgServiceBase;
        const data = await contentService().get(
            path,
            undefined,
            correlationId,
            buildAuthHeaders(request)
        );
        return reply.send(data);
    });

    // ── ADMIN: Get content image by ID ──────────────────────────────────
    app.get(`${imgApiBase}/:id`, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await contentService().get(
            `${imgServiceBase}/${id}`,
            undefined,
            correlationId,
            buildAuthHeaders(request)
        );
        return reply.send(data);
    });

    // ── ADMIN: Upload content image (multipart proxy) ───────────────────
    app.post(imgApiBase, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);

        const contentServiceUrl = process.env.CONTENT_SERVICE_URL || 'http://localhost:3015';

        const proxyHeaders: Record<string, string | undefined> = {
            ...authHeaders,
            'x-correlation-id': correlationId,
            'content-type': request.headers['content-type'],
            'content-length': request.headers['content-length'],
        };

        const response = await fetch(`${contentServiceUrl}${imgServiceBase}`, {
            method: 'POST',
            body: request.raw,
            headers: proxyHeaders as HeadersInit,
            duplex: 'half',
        } as RequestInit);

        if (!response.ok) {
            const errorText = await response.text();
            request.log.error(
                { correlationId, status: response.status, error: errorText },
                'Content image upload failed'
            );
            return reply.status(response.status).send({ error: { message: 'Upload failed' } });
        }

        const result = await response.json();
        return reply.status(201).send(result);
    });

    // ── ADMIN: Update content image metadata ────────────────────────────
    app.patch(`${imgApiBase}/:id`, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await contentService().patch(
            `${imgServiceBase}/${id}`,
            request.body,
            correlationId,
            buildAuthHeaders(request)
        );
        return reply.send(data);
    });

    // ── ADMIN: Delete content image ─────────────────────────────────────
    app.delete(`${imgApiBase}/:id`, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await contentService().delete(
            `${imgServiceBase}/${id}`,
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
