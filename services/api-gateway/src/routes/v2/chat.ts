import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { buildQueryString, getCorrelationId } from './common';
import { requireAuth } from '../../middleware/auth';

export function registerChatRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const chatService = () => services.get('chat');

    app.all(
        '/api/v2/admin/chat/*',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `${request.url.split('?')[0]}?${queryString}` : request.url;

            try {
                switch (request.method) {
                    case 'GET': {
                        const data = await chatService().get(path, undefined, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'POST': {
                        const data = await chatService().post(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'PATCH': {
                        const data = await chatService().patch(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'DELETE': {
                        const data = await chatService().delete(path, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    default:
                        return reply.status(405).send({ error: 'Method not allowed' });
                }
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy admin chat request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy admin chat request' });
            }
        }
    );

    app.all(
        '/api/v2/admin/chat',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/admin/chat?${queryString}` : '/api/v2/admin/chat';

            try {
                switch (request.method) {
                    case 'GET': {
                        const data = await chatService().get(path, undefined, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'POST': {
                        const data = await chatService().post(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'PATCH': {
                        const data = await chatService().patch(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'DELETE': {
                        const data = await chatService().delete(path, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    default:
                        return reply.status(405).send({ error: 'Method not allowed' });
                }
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy admin chat request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy admin chat request' });
            }
        }
    );

    app.all(
        '/api/v2/chat/*',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `${request.url.split('?')[0]}?${queryString}` : request.url;

            try {
                switch (request.method) {
                    case 'GET': {
                        const data = await chatService().get(path, undefined, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'POST': {
                        const data = await chatService().post(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'PATCH': {
                        const data = await chatService().patch(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'DELETE': {
                        const data = await chatService().delete(path, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    default:
                        return reply.status(405).send({ error: 'Method not allowed' });
                }
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy chat request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy chat request' });
            }
        }
    );

    app.all(
        '/api/v2/chat',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/chat?${queryString}` : '/api/v2/chat';

            try {
                switch (request.method) {
                    case 'GET': {
                        const data = await chatService().get(path, undefined, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'POST': {
                        const data = await chatService().post(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'PATCH': {
                        const data = await chatService().patch(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'DELETE': {
                        const data = await chatService().delete(path, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    default:
                        return reply.status(405).send({ error: 'Method not allowed' });
                }
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy chat request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy chat request' });
            }
        }
    );
}
