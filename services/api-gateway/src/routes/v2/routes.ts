import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles, AuthenticatedRequest } from '../../rbac';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { UserRole } from '../../auth';

type ServiceName = 'ats' | 'network' | 'billing' | 'notification' | 'identity';

interface ResourceRoles {
    list?: UserRole[];
    get?: UserRole[];
    create?: UserRole[];
    update?: UserRole[];
    delete?: UserRole[];
}

interface ResourceDefinition {
    name: string;
    service: ServiceName;
    basePath: string;
    tag: string;
    roles: ResourceRoles;
}

const ATS_VIEW_ROLES: UserRole[] = [
    'candidate',
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];
const ATS_COMPANY_VIEW_ROLES: UserRole[] = [
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];
const ATS_CANDIDATE_VIEW_ROLES: UserRole[] = [
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];
const ATS_MANAGE_ROLES: UserRole[] = ['company_admin', 'hiring_manager', 'platform_admin'];
const ATS_DELETE_ROLES: UserRole[] = ['company_admin', 'platform_admin'];
const ATS_CANDIDATE_MANAGE_ROLES: UserRole[] = ['recruiter', 'company_admin', 'platform_admin'];
const ATS_PLACEMENT_ROLES: UserRole[] = ['recruiter', 'company_admin', 'platform_admin'];
const AUTHENTICATED_ROLES: UserRole[] = [
    'candidate',
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];
const ATS_AI_TRIGGER_ROLES: UserRole[] = [
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];

const NETWORK_VIEW_ROLES: UserRole[] = [
    'recruiter',
    'company_admin',
    'hiring_manager',
    'platform_admin',
];
const NETWORK_ASSIGNMENT_ROLES: UserRole[] = ['company_admin', 'platform_admin'];
const NETWORK_ADMIN_ROLES: UserRole[] = ['platform_admin'];
const NETWORK_TEAM_ROLES: UserRole[] = ['recruiter', 'company_admin', 'platform_admin'];

const BILLING_VIEW_ROLES: UserRole[] = ['platform_admin'];
const BILLING_SUBSCRIPTION_ROLES: UserRole[] = ['recruiter', 'company_admin', 'platform_admin'];
const IDENTITY_ADMIN_ROLES: UserRole[] = ['platform_admin'];

const RESOURCES: ResourceDefinition[] = [
    // ATS
    {
        name: 'jobs',
        service: 'ats',
        basePath: '/jobs',
        tag: 'jobs',
        roles: {
            list: ATS_VIEW_ROLES,
            get: ATS_VIEW_ROLES,
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
            list: [...ATS_CANDIDATE_VIEW_ROLES, 'candidate'],
            get: [...ATS_CANDIDATE_VIEW_ROLES, 'candidate'],
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
    // Network
    {
        name: 'recruiters',
        service: 'network',
        basePath: '/recruiters',
        tag: 'recruiters',
        roles: {
            list: NETWORK_VIEW_ROLES,
            get: NETWORK_VIEW_ROLES,
            create: ['recruiter', 'platform_admin'],
            update: ['recruiter', 'platform_admin'],
            delete: NETWORK_ADMIN_ROLES,
        },
    },
    {
        name: 'assignments',
        service: 'network',
        basePath: '/assignments',
        tag: 'assignments',
        roles: {
            list: NETWORK_ASSIGNMENT_ROLES,
            get: NETWORK_ASSIGNMENT_ROLES,
            create: NETWORK_ASSIGNMENT_ROLES,
            update: NETWORK_ASSIGNMENT_ROLES,
            delete: NETWORK_ADMIN_ROLES,
        },
    },
    {
        name: 'recruiter-candidates',
        service: 'network',
        basePath: '/recruiter-candidates',
        tag: 'recruiter-candidates',
        roles: {
            list: ['candidate', 'recruiter', 'company_admin', 'platform_admin'],
            get: ['candidate', 'recruiter', 'company_admin', 'platform_admin'],
            create: ['recruiter', 'platform_admin'],
            update: ['recruiter', 'platform_admin'],
            delete: NETWORK_ADMIN_ROLES,
        },
    },
    {
        name: 'reputation',
        service: 'network',
        basePath: '/reputation',
        tag: 'reputation',
        roles: {
            list: NETWORK_ADMIN_ROLES,
            get: NETWORK_ADMIN_ROLES,
            create: NETWORK_ADMIN_ROLES,
            update: NETWORK_ADMIN_ROLES,
            delete: NETWORK_ADMIN_ROLES,
        },
    },
    {
        name: 'proposals',
        service: 'network',
        basePath: '/proposals',
        tag: 'proposals',
        roles: {
            list: ATS_VIEW_ROLES,
            get: ATS_VIEW_ROLES,
            create: ['recruiter', 'company_admin', 'hiring_manager', 'platform_admin'],
            update: ['recruiter', 'company_admin', 'hiring_manager', 'platform_admin'],
            delete: ['company_admin', 'platform_admin'],
        },
    },
    // Identity
    {
        name: 'users',
        service: 'identity',
        basePath: '/users',
        tag: 'users',
        roles: {
            list: AUTHENTICATED_ROLES,
            get: IDENTITY_ADMIN_ROLES,
            create: IDENTITY_ADMIN_ROLES,
            update: IDENTITY_ADMIN_ROLES,
            delete: IDENTITY_ADMIN_ROLES,
        },
    },
    // Billing
    {
        name: 'plans',
        service: 'billing',
        basePath: '/plans',
        tag: 'billing',
        roles: {
            list: BILLING_VIEW_ROLES,
            get: BILLING_VIEW_ROLES,
            create: BILLING_VIEW_ROLES,
            update: BILLING_VIEW_ROLES,
            delete: BILLING_VIEW_ROLES,
        },
    },
    {
        name: 'subscriptions',
        service: 'billing',
        basePath: '/subscriptions',
        tag: 'billing',
        roles: {
            list: BILLING_SUBSCRIPTION_ROLES,
            get: BILLING_SUBSCRIPTION_ROLES,
            create: BILLING_SUBSCRIPTION_ROLES,
            update: BILLING_SUBSCRIPTION_ROLES,
            delete: BILLING_SUBSCRIPTION_ROLES,
        },
    },
    {
        name: 'payouts',
        service: 'billing',
        basePath: '/payouts',
        tag: 'billing',
        roles: {
            list: BILLING_VIEW_ROLES,
            get: BILLING_VIEW_ROLES,
            create: BILLING_VIEW_ROLES,
            update: BILLING_VIEW_ROLES,
            delete: BILLING_VIEW_ROLES,
        },
    },
    // Notification
    {
        name: 'notifications',
        service: 'notification',
        basePath: '/notifications',
        tag: 'notifications',
        roles: {
            list: AUTHENTICATED_ROLES,
            get: AUTHENTICATED_ROLES,
            create: ['platform_admin'],
            update: AUTHENTICATED_ROLES,
            delete: AUTHENTICATED_ROLES,
        },
    },
];

export function registerV2GatewayRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');
    const networkService = () => services.get('network');
    const identityService = () => services.get('identity');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;
    const candidateRoles: UserRole[] = ['candidate', 'platform_admin'];

    RESOURCES.forEach(resource => {
        registerResourceRoutes(app, services, resource);
    });

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
            const queryString = new URLSearchParams(request.query as Record<string, any>).toString();
            const path = queryString
                ? `/v2/candidate-dashboard/recent-applications?${queryString}`
                : '/v2/candidate-dashboard/recent-applications';
            const data = await atsService().get(path, undefined, correlationId, authHeaders);
            return reply.send(data);
        }
    );

    app.get(
        '/api/v2/consent',
        {
            schema: {
                description: 'Get current user consent preferences',
                tags: ['consent'],
                security: [{ clerkAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const data = await identityService().get(
                '/api/v2/consent',
                undefined,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        }
    );

    app.post(
        '/api/v2/consent',
        {
            schema: {
                description: 'Save user consent preferences',
                tags: ['consent'],
                security: [{ clerkAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const data = await identityService().post(
                '/api/v2/consent',
                request.body,
                correlationId,
                authHeaders
            );
            return reply.status(201).send(data);
        }
    );

    app.delete(
        '/api/v2/consent',
        {
            schema: {
                description: 'Delete user consent preferences',
                tags: ['consent'],
                security: [{ clerkAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            await identityService().delete('/api/v2/consent', correlationId, authHeaders);
            return reply.status(204).send();
        }
    );

    app.get(
        '/api/v2/recruiter-candidates/invitations/:token',
        {
            schema: {
                description: 'Fetch recruiter-candidate invitation by token',
                tags: ['recruiter-candidates'],
                security: [{ clerkAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const req = request as AuthenticatedRequest;
            if (!req.auth) {
                return reply.status(401).send({ error: { message: 'Authentication required' } });
            }

            const { token } = request.params as { token: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await networkService().get(
                    `/v2/recruiter-candidates/invitations/${token}`,
                    undefined,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, token, correlationId }, 'Failed to fetch invitation');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to fetch invitation' });
            }
        }
    );

    app.post(
        '/api/v2/recruiter-candidates/invitations/:token/accept',
        {
            schema: {
                description: 'Accept recruiter invitation via token',
                tags: ['recruiter-candidates'],
                security: [{ clerkAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const req = request as AuthenticatedRequest;
            if (!req.auth) {
                return reply.status(401).send({ error: { message: 'Authentication required' } });
            }

            const { token } = request.params as { token: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const forwardedIp =
                (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.ip;
            const userAgent = request.headers['user-agent'] as string | undefined;
            const body = (request.body as Record<string, any>) || {};

            try {
                const data = await networkService().post(
                    `/v2/recruiter-candidates/invitations/${token}/accept`,
                    {
                        userId: req.auth.userId,
                        ip_address: forwardedIp,
                        user_agent: userAgent,
                        ...body,
                    },
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, token, correlationId }, 'Failed to accept invitation');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to accept invitation' });
            }
        }
    );

    app.post(
        '/api/v2/recruiter-candidates/invitations/:token/decline',
        {
            schema: {
                description: 'Decline recruiter invitation via token',
                tags: ['recruiter-candidates'],
                security: [{ clerkAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const req = request as AuthenticatedRequest;
            if (!req.auth) {
                return reply.status(401).send({ error: { message: 'Authentication required' } });
            }

            const { token } = request.params as { token: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const forwardedIp =
                (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.ip;
            const userAgent = request.headers['user-agent'] as string | undefined;
            const body = (request.body as Record<string, any>) || {};

            try {
                const data = await networkService().post(
                    `/v2/recruiter-candidates/invitations/${token}/decline`,
                    {
                        userId: req.auth.userId,
                        ip_address: forwardedIp,
                        user_agent: userAgent,
                        ...body,
                    },
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, token, correlationId }, 'Failed to decline invitation');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to decline invitation' });
            }
        }
    );

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
            const query = request.query as Record<string, any>;
            const queryString = (() => {
                if (!query || Object.keys(query).length === 0) {
                    return '';
                }
                const params = new URLSearchParams();
                Object.entries(query).forEach(([key, value]) => {
                    if (value === undefined || value === null) {
                        return;
                    }
                    if (Array.isArray(value)) {
                        value.forEach(item => params.append(key, String(item)));
                    } else {
                        params.append(key, String(value));
                    }
                });
                return params.toString();
            })();
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

    app.post(
        '/api/v2/recruiter-candidates/:id/resend-invitation',
        {
            preHandler: requireRoles(['recruiter', 'platform_admin'], services),
            schema: {
                description: 'Resend recruiter invitation for a candidate',
                tags: ['recruiter-candidates'],
                security: [{ clerkAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            try {
                const data = await networkService().post(
                    `/v2/recruiter-candidates/${id}/resend-invitation`,
                    {},
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, id, correlationId }, 'Failed to resend invitation');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to resend invitation' });
            }
        }
    );

    app.post(
        '/api/v2/recruiter-candidates/:id/cancel-invitation',
        {
            preHandler: requireRoles(['recruiter', 'platform_admin'], services),
            schema: {
                description: 'Cancel a pending recruiter invitation',
                tags: ['recruiter-candidates'],
                security: [{ clerkAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            try {
                const data = await networkService().post(
                    `/v2/recruiter-candidates/${id}/cancel-invitation`,
                    {},
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, id, correlationId }, 'Failed to cancel invitation');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to cancel invitation' });
            }
        }
    );

    const buildQueryString = (query?: Record<string, any>) => {
        if (!query || Object.keys(query).length === 0) {
            return '';
        }
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                return;
            }
            if (Array.isArray(value)) {
                value.forEach(item => params.append(key, String(item)));
            } else {
                params.append(key, String(value));
            }
        });
        return params.toString();
    };

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

    registerTeamRoutes(app, services);
}

function registerResourceRoutes(
    app: FastifyInstance,
    services: ServiceRegistry,
    resource: ResourceDefinition
) {
    const serviceClient = () => services.get(resource.service);
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;
    const apiBase = `/api/v2${resource.basePath}`;
    const serviceBase = `/api/v2${resource.basePath}`;

    const routeOptions = (description: string, roles?: UserRole[]) => {
        const options: Record<string, any> = {
            schema: {
                description,
                tags: [resource.tag],
                security: [{ clerkAuth: [] }],
            },
        };

        if (roles && roles.length > 0) {
            options.preHandler = requireRoles(roles, services);
        }

        return options;
    };

    // LIST
    app.get(
        apiBase,
        routeOptions(`List ${resource.name}`, resource.roles.list),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const data = await serviceClient().get(
                serviceBase,
                request.query as Record<string, any>,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );

    // GET BY ID
    app.get(
        `${apiBase}/:id`,
        routeOptions(`Get ${resource.name} by ID`, resource.roles.get),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const queryParams = request.query as Record<string, any>;
            const queryString = (() => {
                if (!queryParams || Object.keys(queryParams).length === 0) {
                    return '';
                }
                const params = new URLSearchParams();
                Object.entries(queryParams).forEach(([key, value]) => {
                    if (value === undefined || value === null) {
                        return;
                    }
                    if (Array.isArray(value)) {
                        value.forEach(item => params.append(key, String(item)));
                    } else {
                        params.append(key, String(value));
                    }
                });
                return params.toString();
            })();
            const path = queryString ? `${serviceBase}/${id}?${queryString}` : `${serviceBase}/${id}`;
            const data = await serviceClient().get(
                path,
                undefined,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );

    // CREATE
    app.post(
        apiBase,
        routeOptions(`Create ${resource.name}`, resource.roles.create),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const data = await serviceClient().post(
                serviceBase,
                request.body,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.code(201).send(data);
        }
    );

    // UPDATE
    app.patch(
        `${apiBase}/:id`,
        routeOptions(`Update ${resource.name}`, resource.roles.update),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await serviceClient().patch(
                `${serviceBase}/${id}`,
                request.body,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );

    // DELETE
    app.delete(
        `${apiBase}/:id`,
        routeOptions(`Delete ${resource.name}`, resource.roles.delete),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await serviceClient().delete(
                `${serviceBase}/${id}`,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );
}

function registerTeamRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const networkService = () => services.get('network');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    const routeOptions = (description: string, roles?: UserRole[]) => {
        const options: Record<string, any> = {
            schema: {
                description,
                tags: ['teams'],
                security: [{ clerkAuth: [] }],
            },
        };

        if (roles && roles.length > 0) {
            options.preHandler = requireRoles(roles, services);
        }

        return options;
    };

    const handleNetworkError = (request: FastifyRequest, reply: FastifyReply, error: any, message: string) => {
        request.log.error({ error, message }, 'Teams route failed');
        return reply
            .status(error?.statusCode || 500)
            .send(error?.jsonBody || { error: message });
    };

    app.get(
        '/api/v2/teams',
        routeOptions('List teams for current user', NETWORK_TEAM_ROLES),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data: any = await networkService().get(
                    '/teams',
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send({ data: data?.teams || [] });
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to list teams');
            }
        }
    );

    app.post(
        '/api/v2/teams',
        routeOptions('Create team', NETWORK_TEAM_ROLES),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const team = await networkService().post(
                    '/teams',
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.code(201).send({ data: team });
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to create team');
            }
        }
    );

    app.get(
        '/api/v2/teams/:teamId',
        routeOptions('Get team by ID', NETWORK_TEAM_ROLES),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { teamId } = request.params as { teamId: string };
                const correlationId = getCorrelationId(request);
                const team = await networkService().get(
                    `/teams/${teamId}`,
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send({ data: team });
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to fetch team');
            }
        }
    );

    app.get(
        '/api/v2/teams/:teamId/members',
        routeOptions('List team members', NETWORK_TEAM_ROLES),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { teamId } = request.params as { teamId: string };
                const correlationId = getCorrelationId(request);
                const response: any = await networkService().get(
                    `/teams/${teamId}/members`,
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send({ data: response?.members || [] });
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to list team members');
            }
        }
    );

    app.post(
        '/api/v2/teams/:teamId/invitations',
        routeOptions('Invite team member', NETWORK_TEAM_ROLES),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { teamId } = request.params as { teamId: string };
                const correlationId = getCorrelationId(request);
                const invitation = await networkService().post(
                    `/teams/${teamId}/invitations`,
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.code(201).send({ data: invitation });
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to invite member');
            }
        }
    );

    app.delete(
        '/api/v2/teams/:teamId/members/:memberId',
        routeOptions('Remove team member', NETWORK_TEAM_ROLES),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { teamId, memberId } = request.params as { teamId: string; memberId: string };
                const correlationId = getCorrelationId(request);
                await networkService().delete(
                    `/teams/${teamId}/members/${memberId}`,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.status(204).send();
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to remove member');
            }
        }
    );
}
