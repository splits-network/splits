import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { ResourceDefinition, registerResourceRoutes, getCorrelationId } from './common';
import { AUTHENTICATED_ROLES, IDENTITY_ADMIN_ROLES } from './roles';

const IDENTITY_RESOURCES: ResourceDefinition[] = [
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
];

export function registerIdentityRoutes(app: FastifyInstance, services: ServiceRegistry) {
    IDENTITY_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));
    registerConsentRoutes(app, services);
}

function registerConsentRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const identityService = () => services.get('identity');

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
}
