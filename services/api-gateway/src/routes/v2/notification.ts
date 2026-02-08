import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { ResourceDefinition, buildQueryString, getCorrelationId, registerResourceRoutes } from './common';
import { requireAuth } from '../../middleware/auth';

const NOTIFICATION_RESOURCES: ResourceDefinition[] = [
    {
        name: 'notifications',
        service: 'notification',
        basePath: '/notifications',
        serviceBasePath: '/api/v2/notifications',
        tag: 'notifications',
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
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const data = await notificationService().post(
                '/api/v2/notifications/mark-all-read',
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
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString
                ? `/api/v2/notifications/unread-count?${queryString}`
                : '/api/v2/notifications/unread-count';
            const data = await notificationService().get(path, undefined, correlationId, authHeaders);
            return reply.send(data);
        }
    );

    app.get(
        '/api/v2/notifications/counts-by-category',
        {
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const data = await notificationService().get(
                '/api/v2/notifications/counts-by-category',
                undefined,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        }
    );
}
