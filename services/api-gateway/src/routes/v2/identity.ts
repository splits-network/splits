import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { ResourceDefinition, registerResourceRoutes, getCorrelationId } from './common';
import { requireAuth } from '../../middleware/auth';

const IDENTITY_RESOURCES: ResourceDefinition[] = [
    {
        name: 'users',
        service: 'identity',
        basePath: '/users',
        tag: 'users',
    },
    {
        name: 'organizations',
        service: 'identity',
        basePath: '/organizations',
        tag: 'organizations',
    },
    {
        name: 'memberships',
        service: 'identity',
        basePath: '/memberships',
        tag: 'memberships',
    },
    {
        name: 'invitations',
        service: 'identity',
        basePath: '/invitations',
        tag: 'invitations',
    }
];

export function registerIdentityRoutes(app: FastifyInstance, services: ServiceRegistry) {
    // Register /me route BEFORE generic CRUD routes so it takes precedence over /:id
    registerUserMeRoute(app, services);
    registerUserRegistrationRoute(app, services);
    registerProfileImageRoute(app, services); // Add profile image route
    registerDeleteProfileImageRoute(app, services); // Add delete profile image route
    registerInvitationAcceptRoute(app, services);
    registerClerkWebhookProxy(app, services);

    // Register generic CRUD routes for users
    IDENTITY_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));
    registerConsentRoutes(app, services);
}

/**
 * GET /api/v2/users/me - Get current user with access context
 * Returns user data plus roles, recruiter_id, candidate_id, organization_ids
 * Used by frontend for access control (sidebar, page visibility, etc.)
 */
function registerUserMeRoute(app: FastifyInstance, services: ServiceRegistry) {
    const identityService = () => services.get('identity');

    app.get(
        '/api/v2/users/me',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            try {
                const data = await identityService().get(
                    '/api/v2/users/me',
                    undefined,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                // Pass through 404 so frontend can handle user-not-found gracefully
                if (error.statusCode === 404) {
                    return reply.code(404).send(error.jsonBody || { error: { message: 'User not found' } });
                }
                throw error;
            }
        }
    );

    app.patch(
        '/api/v2/users/me',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const data = await identityService().patch(
                '/api/v2/users/me',
                request.body,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        }
    );
}

function registerConsentRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const identityService = () => services.get('identity');

    app.get(
        '/api/v2/consent',
        {
            // No schema needed for Fastify 5.x
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
            // No schema needed for Fastify 5.x
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
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            await identityService().delete('/api/v2/consent', correlationId, authHeaders);
            return reply.status(204).send();
        }
    );
}

function registerUserRegistrationRoute(app: FastifyInstance, services: ServiceRegistry) {
    const identityService = () => services.get('identity');

    app.post(
        '/api/v2/users/register',
        {
            // Authentication IS required - we need Clerk user ID to ensure user
            // can only register themselves (security check in backend)
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const data = await identityService().post(
                '/api/v2/users/register',
                request.body,
                correlationId,
                authHeaders
            );
            return reply.status(201).send(data);
        }
    );
}

/**
 * PATCH /api/v2/users/profile-image - Update user profile image
 * Proxies to identity service to update profile image URL and path
 */
function registerProfileImageRoute(app: FastifyInstance, services: ServiceRegistry) {
    const identityService = () => services.get('identity');

    app.patch(
        '/api/v2/users/profile-image',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const data = await identityService().patch(
                '/api/v2/users/profile-image',
                request.body,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        }
    );
}

/**
 * DELETE /api/v2/users/profile-image - Delete user profile image
 * Proxies to identity service to remove profile image
 */
function registerDeleteProfileImageRoute(app: FastifyInstance, services: ServiceRegistry) {
    const identityService = () => services.get('identity');

    app.delete(
        '/api/v2/users/profile-image',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const data = await identityService().delete(
                '/api/v2/users/profile-image',
                correlationId,
                authHeaders
            );
            return reply.send(data);
        }
    );
}

/**
 * POST /api/v2/webhooks/clerk - Proxy Clerk webhook to identity service
 * No auth required - verified by Svix signature in identity service
 * Passes raw body to preserve signature integrity
 */
function registerClerkWebhookProxy(app: FastifyInstance, services: ServiceRegistry) {
    const identityService = () => services.get('identity');

    app.post(
        '/api/v2/webhooks/clerk',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const rawBody = (request as any).rawBody as Buffer;

            if (!rawBody) {
                request.log.error({ correlationId }, 'Missing raw body for Clerk webhook');
                return reply.status(400).send({ error: { message: 'Missing raw body' } });
            }

            try {
                const data = await identityService().post(
                    '/api/v2/webhooks/clerk',
                    rawBody,
                    correlationId,
                    {
                        'svix-id': request.headers['svix-id'] as string,
                        'svix-timestamp': request.headers['svix-timestamp'] as string,
                        'svix-signature': request.headers['svix-signature'] as string,
                    }
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Clerk webhook proxy failed');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: { message: error.message || 'Webhook processing failed' } });
            }
        }
    );
}

/**
 * POST /api/v2/invitations/:id/accept - Accept invitation
 */
function registerInvitationAcceptRoute(app: FastifyInstance, services: ServiceRegistry) {
    const identityService = () => services.get('identity');

    app.post(
        '/api/v2/invitations/:id/accept',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const data = await identityService().post(
                `/api/v2/invitations/${id}/accept`,
                request.body,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        }
    );
}
