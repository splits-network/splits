import { FastifyInstance } from 'fastify';
import { NotificationRepository } from './repository';

/**
 * In-App Notification HTTP Routes
 * Direct HTTP endpoints for API Gateway to call
 */
export function registerInAppNotificationRoutes(
    fastify: FastifyInstance,
    repository: NotificationRepository
) {
    /**
     * GET /in-app-notifications/:userId - Get user's in-app notifications
     */
    fastify.get<{
        Params: { userId: string };
        Querystring: { unreadOnly?: string; limit?: string; offset?: string };
    }>('/in-app-notifications/:userId', async (request, reply) => {
        const { userId } = request.params;
        const { unreadOnly, limit, offset } = request.query;

        try {
            const notifications = await repository.findInAppNotificationsByUserId(userId, {
                unreadOnly: unreadOnly === 'true',
                limit: limit ? parseInt(limit) : 50,
                offset: offset ? parseInt(offset) : 0,
            });

            reply.send({ data: notifications });
        } catch (error: any) {
            fastify.log.error({ error, userId }, 'Failed to fetch in-app notifications');
            reply.code(500).send({
                error: {
                    code: 'FETCH_FAILED',
                    message: error.message || 'Failed to fetch notifications',
                },
            });
        }
    });

    /**
     * GET /in-app-notifications/:userId/unread-count - Get unread count
     */
    fastify.get<{
        Params: { userId: string };
    }>('/in-app-notifications/:userId/unread-count', async (request, reply) => {
        const { userId } = request.params;

        try {
            const count = await repository.getUnreadCount(userId);

            reply.send({ data: { count } });
        } catch (error: any) {
            fastify.log.error({ error, userId }, 'Failed to fetch unread count');
            reply.code(500).send({
                error: {
                    code: 'COUNT_FAILED',
                    message: error.message || 'Failed to fetch unread count',
                },
            });
        }
    });

    /**
     * PATCH /in-app-notifications/:id/read - Mark as read
     */
    fastify.patch<{
        Params: { id: string };
        Body: { userId: string };
    }>('/in-app-notifications/:id/read', async (request, reply) => {
        const { id } = request.params;
        const { userId } = request.body;

        if (!userId) {
            return reply.code(400).send({
                error: {
                    code: 'MISSING_USER_ID',
                    message: 'userId is required in request body',
                },
            });
        }

        try {
            const notification = await repository.markAsRead(id, userId);

            reply.send({ data: notification });
        } catch (error: any) {
            fastify.log.error({ error, notificationId: id, userId }, 'Failed to mark as read');
            reply.code(500).send({
                error: {
                    code: 'MARK_READ_FAILED',
                    message: error.message || 'Failed to mark as read',
                },
            });
        }
    });

    /**
     * PATCH /in-app-notifications/mark-all-read - Mark all as read
     */
    fastify.patch<{
        Body: { userId: string };
    }>('/in-app-notifications/mark-all-read', async (request, reply) => {
        const { userId } = request.body;

        if (!userId) {
            return reply.code(400).send({
                error: {
                    code: 'MISSING_USER_ID',
                    message: 'userId is required in request body',
                },
            });
        }

        try {
            await repository.markAllAsRead(userId);

            reply.send({ data: { success: true } });
        } catch (error: any) {
            fastify.log.error({ error, userId }, 'Failed to mark all as read');
            reply.code(500).send({
                error: {
                    code: 'MARK_ALL_READ_FAILED',
                    message: error.message || 'Failed to mark all as read',
                },
            });
        }
    });

    /**
     * PATCH /in-app-notifications/:id/dismiss - Dismiss notification
     */
    fastify.patch<{
        Params: { id: string };
        Body: { userId: string };
    }>('/in-app-notifications/:id/dismiss', async (request, reply) => {
        const { id } = request.params;
        const { userId } = request.body;

        if (!userId) {
            return reply.code(400).send({
                error: {
                    code: 'MISSING_USER_ID',
                    message: 'userId is required in request body',
                },
            });
        }

        try {
            const notification = await repository.dismissNotification(id, userId);

            reply.send({ data: notification });
        } catch (error: any) {
            fastify.log.error({ error, notificationId: id, userId }, 'Failed to dismiss notification');
            reply.code(500).send({
                error: {
                    code: 'DISMISS_FAILED',
                    message: error.message || 'Failed to dismiss notification',
                },
            });
        }
    });
}
