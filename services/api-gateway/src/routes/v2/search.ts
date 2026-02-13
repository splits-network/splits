import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { getCorrelationId, buildQueryString } from './common';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { requireAuth } from '../../middleware/auth';

/**
 * Register search service V2 routes
 *
 * Proxies search requests to the search service:
 * - GET /api/v2/search - Global search (typeahead and full modes)
 */
export function registerSearchRoutes(
    app: FastifyInstance,
    services: ServiceRegistry
): void {
    const searchClient = () => services.get('search');

    // GET /api/v2/search - Global search (typeahead and full modes)
    app.get(
        '/api/v2/search',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/search?${queryString}` : '/api/v2/search';

            try {
                const response = await searchClient().get<any>(
                    path,
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(response);
            } catch (error: any) {
                request.log.error({
                    correlationId,
                    error: error.message,
                    stack: error.stack,
                }, 'Error proxying search request');

                if (error.jsonBody) {
                    return reply.status(error.statusCode || 500).send(error.jsonBody);
                }

                return reply.status(error.statusCode || 500).send({
                    error: {
                        message: error.message || 'Internal server error',
                        code: error.code || 'INTERNAL_ERROR',
                    },
                });
            }
        }
    );
}
