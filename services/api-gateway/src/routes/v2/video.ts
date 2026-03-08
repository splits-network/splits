import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { buildQueryString, getCorrelationId } from './common';

export function registerVideoRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const videoService = () => services.get('video');

    app.all(
        '/api/v2/interviews/*',
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
                    case 'PATCH': {
                        const data = await videoService().patch(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'DELETE': {
                        const data = await videoService().delete(path, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    default:
                        return reply.status(405).send({ error: 'Method not allowed' });
                }
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy video request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy video request' });
            }
        }
    );

    app.all(
        '/api/v2/interviews',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/interviews?${queryString}` : '/api/v2/interviews';

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
                    case 'PATCH': {
                        const data = await videoService().patch(path, request.body, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    case 'DELETE': {
                        const data = await videoService().delete(path, correlationId, authHeaders);
                        return reply.send(data);
                    }
                    default:
                        return reply.status(405).send({ error: 'Method not allowed' });
                }
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to proxy video request');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to proxy video request' });
            }
        }
    );
}
