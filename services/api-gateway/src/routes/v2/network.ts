import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireAuth, optionalAuth } from '../../middleware/auth';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import {
    ResourceDefinition,
    registerResourceRoutes,
    getCorrelationId,
} from './common';

const NETWORK_RESOURCES: ResourceDefinition[] = [
    {
        name: 'recruiters',
        service: 'network',
        basePath: '/recruiters',
        tag: 'recruiters',
    },
    {
        name: 'assignments',
        service: 'network',
        basePath: '/assignments',
        tag: 'assignments',
    },
    {
        name: 'recruiter-candidates',
        service: 'network',
        basePath: '/recruiter-candidates',
        tag: 'recruiter-candidates',
    },
    {
        name: 'reputation',
        service: 'network',
        basePath: '/reputation',
        tag: 'reputation',
    },
    {
        name: 'proposals',
        service: 'network',
        basePath: '/proposals',
        tag: 'proposals',
    },
];

function registerRecruiterMeRoute(app: FastifyInstance, services: ServiceRegistry) {
    const networkService = () => services.get('network');

    app.get(
        '/api/v2/recruiters/me',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await networkService().get(
                    '/api/v2/recruiters/me',
                    undefined,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch current recruiter');
                return reply
                    .status(error.statusCode || 404)
                    .send(error.jsonBody || { error: { message: 'Recruiter profile not found' } });
            }
        }
    );
}

export function registerNetworkRoutes(app: FastifyInstance, services: ServiceRegistry) {
    // Register /me routes FIRST (must be before generic CRUD routes)
    registerRecruiterMeRoute(app, services);

    // Register custom routes FIRST before generic CRUD routes
    registerRecruiterCandidateInvitationRoutes(app, services);
    registerTeamRoutes(app, services);
    registerRecruiterCompanyRoutes(app, services);
    registerCompanyInvitationRoutes(app, services);
    registerRecruiterCodeRoutes(app, services);
    registerPublicRecruitersListRoute(app, services);

    // Register generic CRUD routes LAST (skip recruiters as we have custom routes)
    NETWORK_RESOURCES.filter(r => r.name !== 'recruiters').forEach(resource =>
        registerResourceRoutes(app, services, resource)
    );

    // Register authenticated recruiter routes (POST, PATCH, DELETE, GET by ID)
    registerAuthenticatedRecruiterRoutes(app, services);
}

function registerRecruiterCandidateInvitationRoutes(
    app: FastifyInstance,
    services: ServiceRegistry
) {
    const networkService = () => services.get('network');

    app.get(
        '/api/v2/recruiter-candidates/invitations/:token',
        {
            preHandler: optionalAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {

            const { token } = request.params as { token: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await networkService().get(
                    `/api/v2/recruiter-candidates/invitations/${token}`,
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
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {

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
                        userId: (request as any).auth.clerkUserId,
                        ip_address: forwardedIp,
                        user_agent: userAgent,
                        relationship_start_date: new Date().toISOString(),
                        relationship_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                        status: "active",
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
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { token } = request.params as { token: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const forwardedIp =
                (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.ip;
            const userAgent = request.headers['user-agent'] as string | undefined;
            const body = (request.body as Record<string, any>) || {};

            try {
                const data = await networkService().post(
                    `/api/v2/recruiter-candidates/invitations/${token}/decline`,
                    {
                        userId: (request as any).auth.clerkUserId,
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

    const routeOptions = (description: string) => {
        return {
            preHandler: requireAuth(),
            // No schema needed for Fastify 5.x
        };
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
        routeOptions('List teams for current user'),
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
        routeOptions('Create team'),
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
        routeOptions('Get team by ID'),
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
        routeOptions('List team members'),
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
        routeOptions('Invite team member'),
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
        routeOptions('Remove team member'),
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

/**
 * Register recruiter-company relationship routes
 * Enables companies to invite recruiters and recruiters to manage company relationships
 */
function registerRecruiterCompanyRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const networkService = () => services.get('network');

    const routeOptions = () => ({
        preHandler: requireAuth(),
    });

    const handleNetworkError = (
        request: FastifyRequest,
        reply: FastifyReply,
        error: any,
        message: string
    ) => {
        request.log.error({ error, message }, 'Recruiter-company route failed');
        return reply.status(error?.statusCode || 500).send(error?.jsonBody || { error: message });
    };

    // LIST relationships
    app.get(
        '/api/v2/recruiter-companies',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    '/api/v2/recruiter-companies',
                    request.query as Record<string, any>,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to list recruiter-company relationships');
            }
        }
    );

    // GET relationship by ID
    app.get(
        '/api/v2/recruiter-companies/:id',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { id } = request.params as { id: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    `/api/v2/recruiter-companies/${id}`,
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to fetch recruiter-company relationship');
            }
        }
    );

    // GET manageable companies for current recruiter
    app.get(
        '/api/v2/recruiter-companies/manageable-companies',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    '/api/v2/recruiter-companies/manageable-companies',
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to fetch manageable companies');
            }
        }
    );

    // GET manageable companies with details (id, name) for current recruiter
    app.get(
        '/api/v2/recruiter-companies/manageable-companies-with-details',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    '/api/v2/recruiter-companies/manageable-companies-with-details',
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to fetch manageable companies');
            }
        }
    );

    // GET check if recruiter can manage company jobs
    app.get(
        '/api/v2/recruiter-companies/can-manage/:companyId',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { companyId } = request.params as { companyId: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    `/api/v2/recruiter-companies/can-manage/${companyId}`,
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to check company management permission');
            }
        }
    );

    // REQUEST CONNECTION - Recruiter requests connection with a company
    app.post(
        '/api/v2/recruiter-companies/request-connection',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().post(
                    '/api/v2/recruiter-companies/request-connection',
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.code(201).send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to request company connection');
            }
        }
    );

    // INVITE recruiter to company
    app.post(
        '/api/v2/recruiter-companies/invite',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().post(
                    '/api/v2/recruiter-companies/invite',
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.code(201).send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to invite recruiter');
            }
        }
    );

    // RESPOND to invitation (accept/decline)
    app.patch(
        '/api/v2/recruiter-companies/:id/respond',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { id } = request.params as { id: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().patch(
                    `/api/v2/recruiter-companies/${id}/respond`,
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to respond to invitation');
            }
        }
    );

    // UPDATE relationship
    app.patch(
        '/api/v2/recruiter-companies/:id',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { id } = request.params as { id: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().patch(
                    `/api/v2/recruiter-companies/${id}`,
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to update recruiter-company relationship');
            }
        }
    );

    // TERMINATE relationship
    app.patch(
        '/api/v2/recruiter-companies/:id/terminate',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { id } = request.params as { id: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().patch(
                    `/api/v2/recruiter-companies/${id}/terminate`,
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to terminate relationship');
            }
        }
    );

    // DELETE relationship
    app.delete(
        '/api/v2/recruiter-companies/:id',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { id } = request.params as { id: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().delete(
                    `/api/v2/recruiter-companies/${id}`,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to delete recruiter-company relationship');
            }
        }
    );
}

/**
 * Register company platform invitation routes
 * Enables recruiters to invite companies to join the Splits Network platform
 */
function registerCompanyInvitationRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const networkService = () => services.get('network');

    const routeOptions = () => ({
        preHandler: requireAuth(),
    });

    const handleNetworkError = (
        request: FastifyRequest,
        reply: FastifyReply,
        error: any,
        message: string
    ) => {
        request.log.error({ error, message }, 'Company invitation route failed');
        return reply.status(error?.statusCode || 500).send(error?.jsonBody || { error: message });
    };

    // LIST invitations (authenticated, recruiters see their own)
    app.get(
        '/api/v2/company-invitations',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    '/api/v2/company-invitations',
                    request.query as Record<string, any>,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to list company invitations');
            }
        }
    );

    // PUBLIC LOOKUP - no auth required (for accept flow)
    app.get(
        '/api/v2/company-invitations/lookup',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    '/api/v2/company-invitations/lookup',
                    request.query as Record<string, any>,
                    correlationId,
                    buildAuthHeaders(request)
                );
                console.log('Lookup invitation result:', { data, correlationId });
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to lookup invitation');
            }
        }
    );

    // GET invitation by ID (authenticated)
    app.get(
        '/api/v2/company-invitations/:id',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { id } = request.params as { id: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    `/api/v2/company-invitations/${id}`,
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to fetch company invitation');
            }
        }
    );

    // CREATE invitation (authenticated, recruiters only)
    app.post(
        '/api/v2/company-invitations',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().post(
                    '/api/v2/company-invitations',
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.code(201).send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to create company invitation');
            }
        }
    );

    // ACCEPT invitation (authenticated)
    app.post(
        '/api/v2/company-invitations/:id/accept',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { id } = request.params as { id: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().post(
                    `/api/v2/company-invitations/${id}/accept`,
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to accept invitation');
            }
        }
    );

    // RESEND email (authenticated)
    app.post(
        '/api/v2/company-invitations/:id/resend',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { id } = request.params as { id: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().post(
                    `/api/v2/company-invitations/${id}/resend`,
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to resend invitation');
            }
        }
    );

    // REVOKE invitation (authenticated)
    app.patch(
        '/api/v2/company-invitations/:id/revoke',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { id } = request.params as { id: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().patch(
                    `/api/v2/company-invitations/${id}/revoke`,
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to revoke invitation');
            }
        }
    );

    // DELETE invitation (authenticated)
    app.delete(
        '/api/v2/company-invitations/:id',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { id } = request.params as { id: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().delete(
                    `/api/v2/company-invitations/${id}`,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to delete invitation');
            }
        }
    );
}

/**
 * Register recruiter referral code routes
 * Enables recruiters to create and manage referral codes for tracking sourcing attribution
 */
function registerRecruiterCodeRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const networkService = () => services.get('network');

    const routeOptions = () => ({
        preHandler: requireAuth(),
    });

    const handleNetworkError = (
        request: FastifyRequest,
        reply: FastifyReply,
        error: any,
        message: string
    ) => {
        request.log.error({ error, message }, 'Recruiter code route failed');
        return reply.status(error?.statusCode || 500).send(error?.jsonBody || { error: message });
    };

    // LIST codes (authenticated)
    app.get(
        '/api/v2/recruiter-codes',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    '/api/v2/recruiter-codes',
                    request.query as Record<string, any>,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to list recruiter codes');
            }
        }
    );

    // PUBLIC LOOKUP - no auth required (for signup flow)
    app.get(
        '/api/v2/recruiter-codes/lookup',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    '/api/v2/recruiter-codes/lookup',
                    request.query as Record<string, any>,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to lookup recruiter code');
            }
        }
    );

    // GET code by ID (authenticated)
    app.get(
        '/api/v2/recruiter-codes/:id',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { id } = request.params as { id: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    `/api/v2/recruiter-codes/${id}`,
                    undefined,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to fetch recruiter code');
            }
        }
    );

    // CREATE code (authenticated, recruiters only)
    app.post(
        '/api/v2/recruiter-codes',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().post(
                    '/api/v2/recruiter-codes',
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.code(201).send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to create recruiter code');
            }
        }
    );

    // UPDATE code (authenticated)
    app.patch(
        '/api/v2/recruiter-codes/:id',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { id } = request.params as { id: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().patch(
                    `/api/v2/recruiter-codes/${id}`,
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to update recruiter code');
            }
        }
    );

    // DELETE code (authenticated)
    app.delete(
        '/api/v2/recruiter-codes/:id',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { id } = request.params as { id: string };
                const correlationId = getCorrelationId(request);
                const data = await networkService().delete(
                    `/api/v2/recruiter-codes/${id}`,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to delete recruiter code');
            }
        }
    );

    // LOG code usage (authenticated, called at signup)
    app.post(
        '/api/v2/recruiter-codes/log',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().post(
                    '/api/v2/recruiter-codes/log',
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.code(201).send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to log recruiter code usage');
            }
        }
    );

    // GET usage log (authenticated)
    app.get(
        '/api/v2/recruiter-codes/log',
        routeOptions(),
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const correlationId = getCorrelationId(request);
                const data = await networkService().get(
                    '/api/v2/recruiter-codes/log',
                    request.query as Record<string, any>,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                return handleNetworkError(request, reply, error, 'Failed to fetch recruiter code usage log');
            }
        }
    );
}

/**
 * Register public recruiters LIST endpoint - allows unauthenticated browsing
 * This enables the marketplace page to be viewed without authentication
 */
function registerPublicRecruitersListRoute(
    app: FastifyInstance,
    services: ServiceRegistry
) {
    const networkService = () => services.get('network');

    app.get(
        '/api/v2/recruiters',
        {
            preHandler: optionalAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);

            try {
                const data = await networkService().get(
                    '/api/v2/recruiters',
                    request.query as Record<string, any>,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to list recruiters');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to list recruiters' });
            }
        }
    );

    // Public recruiter GET by ID endpoint - no auth required (marketplace profile viewing)
    app.get(
        '/api/v2/recruiters/:id',
        {
            preHandler: optionalAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);

            try {
                const data = await networkService().get(
                    `/api/v2/recruiters/${id}`,
                    request.query as Record<string, any>,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, id, correlationId }, 'Failed to get recruiter');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to get recruiter' });
            }
        }
    );
}

/**
 * Register authenticated recruiter routes (POST, PATCH, DELETE)
 * These require authentication as they involve creating/modifying recruiter profiles
 * Note: GET by ID is now in public routes to allow marketplace profile viewing
 */
function registerAuthenticatedRecruiterRoutes(
    app: FastifyInstance,
    services: ServiceRegistry
) {
    const networkService = () => services.get('network');
    const routeOptions = (description: string) => ({ preHandler: requireAuth() });

    app.post(
        '/api/v2/recruiters',
        routeOptions('Create recruiter'),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);

            try {
                const data = await networkService().post(
                    '/api/v2/recruiters',
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.code(201).send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to create recruiter');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to create recruiter' });
            }
        }
    );

    app.patch(
        '/api/v2/recruiters/:id',
        routeOptions('Update recruiter'),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);

            try {
                const data = await networkService().patch(
                    `/api/v2/recruiters/${id}`,
                    request.body,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, id, correlationId }, 'Failed to update recruiter');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to update recruiter' });
            }
        }
    );

    app.delete(
        '/api/v2/recruiters/:id',
        routeOptions('Delete recruiter'),
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);

            try {
                const data = await networkService().delete(
                    `/api/v2/recruiters/${id}`,
                    correlationId,
                    buildAuthHeaders(request)
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, id, correlationId }, 'Failed to delete recruiter');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to delete recruiter' });
            }
        }
    );
}
