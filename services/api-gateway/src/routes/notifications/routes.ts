import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';

const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

/**
 * In-app Notification Routes
 * - List notifications for current user
 * - Mark as read / dismiss
 */
export function registerNotificationRoutes(app: FastifyInstance, services: ServiceRegistry) {
    /**
     * Get notifications for current user
     */
    app.get('/api/notifications', {
        schema: {
            description: 'Get notifications for current user',
            tags: ['notifications'],
            security: [{ clerkAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    unreadOnly: { type: 'boolean', default: false },
                    limit: { type: 'integer', default: 50 },
                },
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as any;
        const notificationService = services.get('notification');
        const correlationId = req.correlationId;
        const { unreadOnly, limit } = request.query as any;

        const notifications = await notificationService.get(
            `/in-app-notifications/${req.auth.userId}`,
            { unreadOnly, limit },
            correlationId
        );
        return reply.send(notifications);
    });

    /**
     * Get unread notification count
     */
    app.get('/api/notifications/unread-count', {
        schema: {
            description: 'Get count of unread notifications',
            tags: ['notifications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as any;
        const notificationService = services.get('notification');
        const correlationId = req.correlationId;

        const count = await notificationService.get(
            `/in-app-notifications/${req.auth.userId}/unread-count`,
            undefined,
            correlationId
        );
        return reply.send(count);
    });

    /**
     * Mark notification as read
     */
    app.patch('/api/notifications/:id/read', {
        schema: {
            description: 'Mark notification as read',
            tags: ['notifications'],
            security: [{ clerkAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
                required: ['id'],
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as any;
        const notificationService = services.get('notification');
        const correlationId = req.correlationId;
        const { id } = request.params as any;

        const result = await notificationService.patch(
            `/in-app-notifications/${id}/read`,
            { userId: req.auth.userId },
            correlationId
        );
        return reply.send(result);
    });

    /**
     * Mark all notifications as read
     */
    app.patch('/api/notifications/mark-all-read', {
        schema: {
            description: 'Mark all notifications as read for current user',
            tags: ['notifications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as any;
        const notificationService = services.get('notification');
        const correlationId = req.correlationId;

        const result = await notificationService.patch(
            `/in-app-notifications/mark-all-read`,
            { userId: req.auth.userId },
            correlationId
        );
        return reply.send(result);
    });

    /**
     * Dismiss notification
     */
    app.patch('/api/notifications/:id/dismiss', {
        schema: {
            description: 'Dismiss notification (hide from UI)',
            tags: ['notifications'],
            security: [{ clerkAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
                required: ['id'],
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as any;
        const notificationService = services.get('notification');
        const correlationId = req.correlationId;
        const { id } = request.params as any;

        const result = await notificationService.patch(
            `/in-app-notifications/${id}/dismiss`,
            { userId: req.auth.userId },
            correlationId
        );
        return reply.send(result);
    });

    /**
     * Mark all notifications as read via V2 service
     */
    app.post('/api/v2/notifications/mark-all-read', {
        schema: {
            description: 'Mark all notifications as read via V2 endpoint',
            tags: ['notifications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const notificationService = services.get('notification');
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);
        const data = await notificationService.post(
            '/v2/notifications/mark-all-read',
            request.body,
            correlationId,
            authHeaders
        );
        return reply.send(data);
    });

    /**
     * Get unread count via V2 service
     */
    app.get('/api/v2/notifications/unread-count', {
        schema: {
            description: 'Get unread notification count via V2 endpoint',
            tags: ['notifications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const notificationService = services.get('notification');
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/v2/notifications/unread-count?${queryString}` : '/v2/notifications/unread-count';
        const data = await notificationService.get(path, undefined, correlationId, authHeaders);
        return reply.send(data);
    });
}
