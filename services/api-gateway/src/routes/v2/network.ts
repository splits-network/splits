import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { AuthenticatedRequest, requireRoles } from '../../rbac';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import {
    ResourceDefinition,
    registerResourceRoutes,
    getCorrelationId,
} from './common';
import {
    ATS_VIEW_ROLES,
    NETWORK_ADMIN_ROLES,
    NETWORK_ASSIGNMENT_ROLES,
    NETWORK_TEAM_ROLES,
    NETWORK_VIEW_ROLES,
} from './roles';
import { UserRole } from '../../auth';

const NETWORK_RESOURCES: ResourceDefinition[] = [
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
];

const INVITATION_MANAGEMENT_ROLES: UserRole[] = ['recruiter', 'platform_admin'];

export function registerNetworkRoutes(app: FastifyInstance, services: ServiceRegistry) {
    NETWORK_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));
    registerRecruiterCandidateInvitationRoutes(app, services);
    registerTeamRoutes(app, services);
}

function registerRecruiterCandidateInvitationRoutes(
    app: FastifyInstance,
    services: ServiceRegistry
) {
    const networkService = () => services.get('network');

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
                    `/api/v2/recruiter-candidates/invitations/${token}/accept`,
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
}

function registerTeamRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const networkService = () => services.get('network');

    const routeOptions = (description: string, roles?: readonly UserRole[]) => {
        const options: Record<string, any> = {
            schema: {
                description,
                tags: ['teams'],
                security: [{ clerkAuth: [] }],
            },
        };

        if (roles && roles.length > 0) {
            options.preHandler = requireRoles(roles as UserRole[], services);
        }

        return options;
    };

    const handleNetworkError = (
        request: FastifyRequest,
        reply: FastifyReply,
        error: any,
        message: string
    ) => {
        request.log.error({ error, message }, 'Teams route failed');
        return reply.status(error?.statusCode || 500).send(error?.jsonBody || { error: message });
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
