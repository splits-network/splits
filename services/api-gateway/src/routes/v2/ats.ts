import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { requireRoles } from '../../rbac';
import { UserRole } from '../../auth';
import {
    ResourceDefinition,
    registerResourceRoutes,
    getCorrelationId,
    buildQueryString,
} from './common';
import {
    ATS_AI_TRIGGER_ROLES,
    ATS_CANDIDATE_MANAGE_ROLES,
    ATS_CANDIDATE_VIEW_ROLES,
    ATS_COMPANY_VIEW_ROLES,
    ATS_DELETE_ROLES,
    ATS_MANAGE_ROLES,
    ATS_PLACEMENT_ROLES,
    ATS_VIEW_ROLES,
    AUTHENTICATED_ROLES,
} from './roles';

const ATS_RESOURCES: ResourceDefinition[] = [
    {
        name: 'jobs',
        service: 'ats',
        basePath: '/jobs',
        tag: 'jobs',
        roles: {
            list: undefined, // Public endpoint - no authentication required
            get: undefined, // Public endpoint - individual jobs viewable by anyone
            create: ATS_MANAGE_ROLES,
            update: ATS_MANAGE_ROLES,
            delete: ATS_DELETE_ROLES,
        },
    },
    {
        name: 'companies',
        service: 'ats',
        basePath: '/companies',
        tag: 'companies',
        roles: {
            list: ATS_COMPANY_VIEW_ROLES,
            get: ATS_COMPANY_VIEW_ROLES,
            create: ['company_admin', 'platform_admin'],
            update: ['company_admin', 'platform_admin'],
            delete: ['company_admin', 'platform_admin'],
        },
    },
    {
        name: 'candidates',
        service: 'ats',
        basePath: '/candidates',
        tag: 'candidates',
        roles: {
            list: ATS_CANDIDATE_VIEW_ROLES,
            get: ATS_CANDIDATE_VIEW_ROLES,
            create: ATS_CANDIDATE_MANAGE_ROLES,
            update: [...ATS_CANDIDATE_MANAGE_ROLES, 'candidate'],
            delete: ['platform_admin'],
        },
    },
    {
        name: 'applications',
        service: 'ats',
        basePath: '/applications',
        tag: 'applications',
        roles: {
            list: ATS_VIEW_ROLES,
            get: ATS_VIEW_ROLES,
            create: ATS_VIEW_ROLES,
            update: ATS_VIEW_ROLES,
            delete: ATS_DELETE_ROLES,
        },
    },
    {
        name: 'placements',
        service: 'ats',
        basePath: '/placements',
        tag: 'placements',
        roles: {
            list: ATS_PLACEMENT_ROLES,
            get: ATS_PLACEMENT_ROLES,
            create: ATS_PLACEMENT_ROLES,
            update: ATS_PLACEMENT_ROLES,
            delete: ATS_DELETE_ROLES,
        },
    },
    {
        name: 'job-pre-screen-questions',
        service: 'ats',
        basePath: '/job-pre-screen-questions',
        tag: 'job-pre-screen-questions',
        roles: {
            list: ATS_VIEW_ROLES,
            get: ATS_VIEW_ROLES,
            create: ATS_MANAGE_ROLES,
            update: ATS_MANAGE_ROLES,
            delete: ATS_MANAGE_ROLES,
        },
    },
    {
        name: 'job-pre-screen-answers',
        service: 'ats',
        basePath: '/job-pre-screen-answers',
        tag: 'job-pre-screen-answers',
        roles: {
            list: ATS_VIEW_ROLES,
            get: ATS_VIEW_ROLES,
            create: ATS_VIEW_ROLES,
            update: ATS_VIEW_ROLES,
            delete: ATS_VIEW_ROLES,
        },
    },
    {
        name: 'job-requirements',
        service: 'ats',
        basePath: '/job-requirements',
        tag: 'job-requirements',
        roles: {
            list: ATS_VIEW_ROLES,
            get: ATS_VIEW_ROLES,
            create: ATS_MANAGE_ROLES,
            update: ATS_MANAGE_ROLES,
            delete: ATS_MANAGE_ROLES,
        },
    },
];

const candidateRoles: UserRole[] = ['candidate', 'platform_admin'];

export function registerAtsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    ATS_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));
    registerCandidateDashboardRoutes(app, services);
    registerStatsRoutes(app, services);
    registerAiReviewRoutes(app, services);
}

function registerCandidateDashboardRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');

    app.get(
        '/api/v2/candidate-dashboard/stats',
        {
            preHandler: requireRoles(candidateRoles, services),
            schema: {
                description: 'Get candidate dashboard stats',
                tags: ['candidate-dashboard'],
                security: [{ clerkAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const data = await atsService().get(
                '/v2/candidate-dashboard/stats',
                undefined,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        }
    );

    app.get(
        '/api/v2/candidate-dashboard/recent-applications',
        {
            preHandler: requireRoles(candidateRoles, services),
            schema: {
                description: 'Get candidate recent applications',
                tags: ['candidate-dashboard'],
                security: [{ clerkAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString
                ? `/v2/candidate-dashboard/recent-applications?${queryString}`
                : '/v2/candidate-dashboard/recent-applications';
            const data = await atsService().get(path, undefined, correlationId, authHeaders);
            return reply.send(data);
        }
    );
}

function registerStatsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');

    app.get(
        '/api/v2/stats',
        {
            preHandler: requireRoles(AUTHENTICATED_ROLES, services),
            schema: {
                description: 'Get dashboard statistics',
                tags: ['stats'],
                security: [{ clerkAuth: [] }],
            },
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
            preHandler: requireRoles(ATS_VIEW_ROLES, services),
            schema: {
                description: 'Get AI review by application',
                tags: ['ai-review'],
                security: [{ clerkAuth: [] }],
            },
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
            preHandler: requireRoles(ATS_VIEW_ROLES, services),
            schema: {
                description: 'Get AI review by ID',
                tags: ['ai-review'],
                security: [{ clerkAuth: [] }],
            },
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
            preHandler: requireRoles(ATS_AI_TRIGGER_ROLES, services),
            schema: {
                description: 'Trigger AI review for application (V2)',
                tags: ['ai-review'],
                security: [{ clerkAuth: [] }],
            },
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

    app.get(
        '/api/v2/ai-review-stats',
        {
            preHandler: requireRoles(ATS_AI_TRIGGER_ROLES, services),
            schema: {
                description: 'Get AI review metrics scoped by job',
                tags: ['ai-review'],
                security: [{ clerkAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/v2/ai-review-stats?${queryString}` : '/v2/ai-review-stats';

            try {
                const data = await atsService().get(path, undefined, correlationId, authHeaders);
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch AI review stats');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to fetch AI review stats' });
            }
        }
    );
}
