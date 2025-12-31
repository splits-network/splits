import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { ResourceDefinition, buildQueryString, getCorrelationId, registerResourceRoutes } from './common';
import { AUTHENTICATED_ROLES } from './roles';

const NOTIFICATION_RESOURCES: ResourceDefinition[] = [
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

export function registerNotificationRoutes(app: FastifyInstance, services: ServiceRegistry) {
    NOTIFICATION_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));
    registerNotificationActions(app, services);
}

function registerNotificationActions(app: FastifyInstance, services: ServiceRegistry) {
    const notificationService = () => services.get('notification');

    app.post(
        '/api/v2/notifications/mark-all-read',
        {
            schema: {
                description: 'Mark all notifications as read via V2 endpoint',
                tags: ['notifications'],
                security: [{ clerkAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const data = await notificationService().post(
                '/v2/notifications/mark-all-read',
                request.body,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        }
    );

    app.get(
        '/api/v2/notifications/unread-count',
        {
            schema: {
                description: 'Get unread notification count via V2 endpoint',
                tags: ['notifications'],
                security: [{ clerkAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString
                ? `/v2/notifications/unread-count?${queryString}`
                : '/v2/notifications/unread-count';
            const data = await notificationService().get(path, undefined, correlationId, authHeaders);
            return reply.send(data);
        }
    );
}
