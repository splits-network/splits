import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { buildQueryString, getCorrelationId } from './common';

export function registerCallRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const callService = () => services.get('call');
    const videoService = () => services.get('video');

    // ── POST /api/v2/calls/exchange-token — Public (no auth headers) ──
    app.post(
        '/api/v2/calls/exchange-token',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);

            try {
                const data = await callService().post(
                    '/api/v2/calls/exchange-token',
                    request.body,
                    correlationId,
                    {},
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy exchange-token request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy exchange-token request' });
            }
        }
    );

    // ── POST /api/v2/calls/recording/webhook — LiveKit webhook (no auth) ──
    app.post(
        '/api/v2/calls/recording/webhook',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);

            try {
                const data = await videoService().post(
                    '/api/v2/calls/recording/webhook',
                    request.body,
                    correlationId,
                    {},
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy call recording webhook');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Webhook proxy failed' });
            }
        }
    );

    // ── /api/v2/calls/:id/recording/* — Recording ops proxied to video-service ──
    app.all(
        '/api/v2/calls/:id/recording/*',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `${request.url.split('?')[0]}?${queryString}` : request.url;

            try {
                switch (request.method) {
                    case 'GET': {
                        const data = await videoService().get(path, undefined, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'POST': {
                        const data = await videoService().post(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    default:
                        return reply.status(405).send({ error: 'Method not allowed' });
                }
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy call recording request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy call recording request' });
            }
        }
    );

    // ── GET /api/v2/calls/:id/recording — Recording status (video-service) ──
    app.get(
        '/api/v2/calls/:id/recording',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await videoService().get(request.url, undefined, correlationId, authHeaders);
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy call recording status');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy call recording status' });
            }
        }
    );

    app.all(
        '/api/v2/calls/*',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `${request.url.split('?')[0]}?${queryString}` : request.url;

            try {
                switch (request.method) {
                    case 'GET': {
                        const data = await callService().get(path, undefined, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'POST': {
                        const data = await callService().post(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'PUT': {
                        const data = await callService().put(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'PATCH': {
                        const data = await callService().patch(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'DELETE': {
                        const data = await callService().delete(path, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    default:
                        return reply.status(405).send({ error: 'Method not allowed' });
                }
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy call request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy call request' });
            }
        }
    );

    app.all(
        '/api/v2/calls',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/calls?${queryString}` : '/api/v2/calls';

            try {
                switch (request.method) {
                    case 'GET': {
                        const data = await callService().get(path, undefined, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'POST': {
                        const data = await callService().post(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'PATCH': {
                        const data = await callService().patch(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'DELETE': {
                        const data = await callService().delete(path, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    default:
                        return reply.status(405).send({ error: 'Method not allowed' });
                }
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy call request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy call request' });
            }
        }
    );
}
