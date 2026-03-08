import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { buildQueryString, getCorrelationId } from './common';

export function registerCallRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const callService = () => services.get('call');

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
