import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { buildQueryString, getCorrelationId } from './common';

export function registerSupportRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const supportService = () => services.get('support');

    app.all(
        '/api/v2/support/*',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `${request.url.split('?')[0]}?${queryString}` : request.url;

            // Pass through support session ID for anonymous visitors
            const sessionId = request.headers['x-support-session-id'] as string;
            if (sessionId) {
                authHeaders['x-support-session-id'] = sessionId;
            }

            try {
                switch (request.method) {
                    case 'GET': {
                        const data = await supportService().get(path, undefined, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'POST': {
                        const data = await supportService().post(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'PATCH': {
                        const data = await supportService().patch(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'DELETE': {
                        const data = await supportService().delete(path, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    default:
                        return reply.status(405).send({ error: 'Method not allowed' });
                }
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy support request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy support request' });
            }
        }
    );
}
