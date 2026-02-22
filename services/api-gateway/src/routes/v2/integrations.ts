import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { buildQueryString, getCorrelationId } from './common';
import { requireAuth } from '../../middleware/auth';

export function registerIntegrationRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const integrationService = () => services.get('integration');

    // Providers catalog — no auth required (public catalog)
    app.get(
        '/api/v2/integrations/providers',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const data = await integrationService().get(
                '/api/v2/integrations/providers',
                request.query as Record<string, any>,
                correlationId,
            );
            return reply.send(data);
        }
    );

    // All other integration routes require auth
    const authRoutes = [
        '/api/v2/integrations/connections',
        '/api/v2/integrations/connections/*',
        '/api/v2/integrations/calendar/*',
        '/api/v2/integrations/email/*',
        '/api/v2/integrations/linkedin/*',
        '/api/v2/integrations/ats',
        '/api/v2/integrations/ats/*',
    ];

    for (const route of authRoutes) {
        app.all(
            route,
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
                            const data = await integrationService().get(path, undefined, correlationId, authHeaders);
                            return reply.send(data);
                        }
                        case 'POST': {
                            const data = await integrationService().post(path, request.body, correlationId, authHeaders);
                            return reply.send(data);
                        }
                        case 'PATCH': {
                            const data = await integrationService().patch(path, request.body, correlationId, authHeaders);
                            return reply.send(data);
                        }
                        case 'DELETE': {
                            const data = await integrationService().delete(path, correlationId, authHeaders);
                            return reply.send(data);
                        }
                        default:
                            return reply.status(405).send({ error: 'Method not allowed' });
                    }
                } catch (error: any) {
                    request.log.error({ error, correlationId }, 'Failed to proxy integration request');
                    return reply
                        .status(error.statusCode || 500)
                        .send(error.jsonBody || { error: 'Failed to proxy integration request' });
                }
            }
        );
    }
}
