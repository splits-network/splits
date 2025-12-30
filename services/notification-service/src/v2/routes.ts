import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { NotificationRepositoryV2 } from './notifications/repository';
import { NotificationServiceV2 } from './notifications/service';
import {
    NotificationCreateInput,
    NotificationUpdate,
    TemplateUpdate,
} from './types';
import { TemplateServiceV2 } from './templates/service';
import { CreateTemplateInput, NotificationTemplateRepository } from './templates/repository';
import { EventPublisher } from './shared/events';
import { requireUserContext, validatePaginationParams } from './shared/helpers';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    const notificationRepository = new NotificationRepositoryV2(
        config.supabaseUrl,
        config.supabaseKey
    );
    const notificationService = new NotificationServiceV2(
        notificationRepository,
        config.eventPublisher
    );

    const templateRepository = new NotificationTemplateRepository(
        config.supabaseUrl,
        config.supabaseKey
    );
    const templateService = new TemplateServiceV2(
        templateRepository,
        config.eventPublisher
    );

    // ============================================
    // NOTIFICATIONS
    // ============================================

    app.get('/v2/notifications', async (request, reply) => {
        try {
            requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);
            const result = await notificationService.listNotifications({
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
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const notification = await notificationService.getNotification(id);
            return reply.send({ data: notification });
        } catch (error: any) {
            return reply.code(404).send({
                error: { message: error.message || 'Notification not found' },
            });
        }
    });

    app.post('/v2/notifications', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const body = request.body as NotificationCreateInput;

            if (!body?.recipient_email || !body.subject || !body.event_type) {
                return reply.code(400).send({
                    error: { message: 'recipient_email, subject, and event_type are required' },
                });
            }

            const notification = await notificationService.createNotification(body);
            return reply.code(201).send({ data: notification });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to create notification' },
            });
        }
    });

    app.patch('/v2/notifications/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as NotificationUpdate;
            const notification = await notificationService.updateNotification(id, updates);
            return reply.send({ data: notification });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to update notification' },
            });
        }
    });

    app.delete('/v2/notifications/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            await notificationService.dismissNotification(id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to dismiss notification' },
            });
        }
    });

    // ============================================
    // TEMPLATES
    // ============================================

    app.get('/v2/templates', async (request, reply) => {
        try {
            requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);
            const result = await templateService.listTemplates({
                event_type: query.event_type,
                status: query.status,
                search: query.search,
                page: pagination.page,
                limit: pagination.limit,
            });
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to fetch templates' },
            });
        }
    });

    app.get('/v2/templates/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const template = await templateService.getTemplate(id);
            return reply.send({ data: template });
        } catch (error: any) {
            return reply.code(404).send({
                error: { message: error.message || 'Template not found' },
            });
        }
    });

    app.post('/v2/templates', async (request, reply) => {
        try {
            requireUserContext(request);
            const body = request.body as CreateTemplateInput;

            if (!body?.event_type || !body.subject || !body.template_html) {
                return reply.code(400).send({
                    error: { message: 'event_type, subject, and template_html are required' },
                });
            }

            const template = await templateService.createTemplate(body);
            return reply.code(201).send({ data: template });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to create template' },
            });
        }
    });

    app.patch('/v2/templates/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as TemplateUpdate;
            const template = await templateService.updateTemplate(id, updates);
            return reply.send({ data: template });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to update template' },
            });
        }
    });

    app.delete('/v2/templates/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            await templateService.archiveTemplate(id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to archive template' },
            });
        }
    });
}
