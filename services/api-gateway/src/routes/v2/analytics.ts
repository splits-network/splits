import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { ResourceDefinition, registerResourceRoutes, getCorrelationId, buildQueryString } from './common';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { requireAuth } from '../../middleware/auth';

/**
 * Analytics service resources
 */
const ANALYTICS_RESOURCES: ResourceDefinition[] = [
    {
        name: 'marketplace-metrics',
        service: 'automation', // Using automation service for now until analytics service is deployed
        basePath: '/marketplace-metrics',
        serviceBasePath: '/api/v2/marketplace-metrics',
        tag: 'analytics',
    },
];

/**
 * Register analytics service V2 routes
 * 
 * Proxies analytics requests to the analytics service:
 * - GET /api/v2/stats/* - Statistics endpoints (company, recruiter, candidate)
 * - GET /api/v2/charts/:type - Chart data endpoints (6 chart types)
 * - GET/POST/PATCH/DELETE /api/v2/marketplace-metrics - Marketplace health metrics
 */
export function registerAnalyticsRoutes(
    app: FastifyInstance,
    services: ServiceRegistry
): void {
    // Register marketplace-metrics resource (standard CRUD)
    ANALYTICS_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));

    const analyticsClient = () => services.get('analytics');

    // Stats endpoints - forward all /api/v2/stats/* requests
    app.get(
        '/api/v2/stats',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/stats?${queryString}` : '/api/v2/stats';

            try {
                const response = await analyticsClient().get<any>(
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
                }, 'Error proxying stats request');

                return reply.status(error.statusCode || 500).send({
                    error: {
                        message: error.message || 'Internal server error',
                        code: error.code || 'INTERNAL_ERROR',
                    },
                });
            }
        }
    );

    app.get(
        '/api/v2/stats/*',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const path = request.url;

            try {
                const response = await analyticsClient().get<any>(
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
                }, 'Error proxying stats request');

                return reply.status(error.statusCode || 500).send({
                    error: {
                        message: error.message || 'Internal server error',
                        code: error.code || 'INTERNAL_ERROR',
                    },
                });
            }
        }
    );

    // Charts endpoint - GET /api/v2/charts/:type
    app.get<{
        Params: { type: string };
        Querystring: {
            start_date?: string;
            end_date?: string;
            scope?: string;
            scope_id?: string;
        };
    }>(
        '/api/v2/charts/:type',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const { type } = request.params as { type: string };
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/charts/${type}?${queryString}` : `/api/v2/charts/${type}`;

            try {
                const response = await analyticsClient().get(
                    path,
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(response);
            } catch (error: any) {
                request.log.error({
                    correlationId,
                    type,
                    error: error.message,
                    stack: error.stack,
                }, 'Error fetching chart data');

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
