import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { NotificationServiceV2 } from './service';
import { NotificationRepositoryV2 } from './repository';
import { NotificationCreateInput, NotificationUpdate } from './types';
import { requireUserContext, validatePaginationParams } from '../shared/helpers';
import { EventPublisher } from '../shared/events';
import { resolveAccessContext } from '../shared/access';

interface RegisterNotificationRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export async function registerNotificationRoutes(
    app: FastifyInstance,
    config: RegisterNotificationRoutesConfig
) {
    const repository = new NotificationRepositoryV2(
        config.supabaseUrl,
        config.supabaseKey
    );
    const accessClient = createClient(config.supabaseUrl, config.supabaseKey);
    const accessResolver = (clerkUserId: string) => resolveAccessContext(accessClient, clerkUserId);
    const notificationService = new NotificationServiceV2(
        repository,
        accessResolver,
        config.eventPublisher
    );

    app.get('/v2/notifications', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);
            const result = await notificationService.listNotifications(clerkUserId, {
                event_type: query.event_type,
                recipient_user_id: query.recipient_user_id,
                channel: query.channel,
                status: query.status,
                category: query.category,
                priority: query.priority,
                unread_only: query.unread_only === 'true' || query.unread_only === true,
                search: query.search,
                page: pagination.page,
                limit: pagination.limit,
            });

            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to fetch notifications' },
            });
        }
    });

    app.get('/v2/notifications/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const notification = await notificationService.getNotification(clerkUserId, id);
            return reply.send({ data: notification });
        } catch (error: any) {
            return reply.code(404).send({
                error: { message: error.message || 'Notification not found' },
            });
        }
    });

    app.post('/v2/notifications', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as NotificationCreateInput;

            if (!body?.recipient_email || !body.subject || !body.event_type) {
                return reply.code(400).send({
                    error: { message: 'recipient_email, subject, and event_type are required' },
                });
            }

            const notification = await notificationService.createNotification(clerkUserId, body);
            return reply.code(201).send({ data: notification });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to create notification' },
            });
        }
    });

    app.patch('/v2/notifications/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as NotificationUpdate;
            const notification = await notificationService.updateNotification(clerkUserId, id, updates);
            return reply.send({ data: notification });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to update notification' },
            });
        }
    });

    app.delete('/v2/notifications/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await notificationService.dismissNotification(clerkUserId, id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to dismiss notification' },
            });
        }
    });

    app.post('/v2/notifications/mark-all-read', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = (request.body as { recipient_user_id?: string }) || {};
            await notificationService.markAllAsRead(clerkUserId, body.recipient_user_id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to mark notifications as read' },
            });
        }
    });

    app.get('/v2/notifications/unread-count', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as { recipient_user_id?: string };
            const count = await notificationService.getUnreadCount(clerkUserId, query?.recipient_user_id);
            return reply.send(count);
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to fetch unread count' },
            });
        }
    });
}
