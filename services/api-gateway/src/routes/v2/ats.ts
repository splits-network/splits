import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { requireAuth } from '../../rbac';
import {
    ResourceDefinition,
    registerResourceRoutes,
    getCorrelationId,
    buildQueryString,
} from './common';

const ATS_RESOURCES: ResourceDefinition[] = [
    {
        name: 'jobs',
        service: 'ats',
        basePath: '/jobs',
        tag: 'jobs',
    },
    {
        name: 'companies',
        service: 'ats',
        basePath: '/companies',
        tag: 'companies',
    },
    {
        name: 'candidates',
        service: 'ats',
        basePath: '/candidates',
        tag: 'candidates',
    },
    {
        name: 'applications',
        service: 'ats',
        basePath: '/applications',
        tag: 'applications',
    },
    {
        name: 'placements',
        service: 'ats',
        basePath: '/placements',
        tag: 'placements',
    },
    {
        name: 'job-pre-screen-questions',
        service: 'ats',
        basePath: '/job-pre-screen-questions',
        tag: 'job-pre-screen-questions',
    },
    {
        name: 'job-pre-screen-answers',
        service: 'ats',
        basePath: '/job-pre-screen-answers',
        tag: 'job-pre-screen-answers',
    },
    {
        name: 'job-requirements',
        service: 'ats',
        basePath: '/job-requirements',
        tag: 'job-requirements',
    },
];

export function registerAtsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    ATS_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));
    registerStatsRoutes(app, services);
    registerAiReviewRoutes(app, services);
}

function registerStatsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');

    app.get(
        '/api/v2/stats',
        {
            preHandler: requireAuth(),
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/v2/stats?${queryString}` : '/v2/stats';
            try {
                const data = await atsService().get(path, undefined, correlationId, authHeaders);
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch stats');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to load stats' });
            }
        }
    );
}

function registerAiReviewRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');

    app.get(
        '/api/v2/ai-reviews',
        {
            preHandler: requireAuth(),
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/v2/ai-reviews?${queryString}` : '/v2/ai-reviews';

            try {
                const data = await atsService().get(path, undefined, correlationId, authHeaders);
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch AI review');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to fetch AI review' });
            }
        }
    );

    app.get(
        '/api/v2/ai-reviews/:id',
        {
            preHandler: requireAuth(),
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await atsService().get(
                    `/v2/ai-reviews/${id}`,
                    undefined,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, id, correlationId }, 'Failed to fetch AI review');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to fetch AI review' });
            }
        }
    );

    app.post(
        '/api/v2/ai-reviews',
        {
            preHandler: requireAuth(),
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await atsService().post(
                    '/v2/ai-reviews',
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to trigger AI review');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to trigger AI review' });
            }
        }
    );
}
