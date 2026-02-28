import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AdminNotificationService } from './service';

interface AdminNotificationRoutesConfig {
    adminService: AdminNotificationService;
}

export function registerAdminNotificationRoutes(
    app: FastifyInstance,
    config: AdminNotificationRoutesConfig
) {
    const { adminService } = config;

    // GET /admin/site-notifications
    app.get('/admin/site-notifications', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const result = await adminService.listSiteNotificationsAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
                is_active: params.is_active,
                severity: params.severity,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list site notifications' } });
        }
    });

    // POST /admin/site-notifications
    app.post('/admin/site-notifications', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as Record<string, any>;
            const createdBy = request.headers['x-clerk-user-id'] as string | undefined;

            if (!body.type || !body.severity || !body.title) {
                return reply.code(400).send({
                    error: { message: 'type, severity, and title are required' },
                });
            }

            const notification = await adminService.createSiteNotificationAdmin({
                ...body,
                created_by: createdBy || null,
            });
            reply.code(201).send({ data: notification });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to create site notification' } });
        }
    });

    // PATCH /admin/site-notifications/:id
    app.patch('/admin/site-notifications/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as Record<string, any>;
            const notification = await adminService.updateSiteNotificationAdmin(id, body);
            reply.send({ data: notification });
        } catch (error) {
            const code = (error as any)?.code;
            if (code === 'PGRST116') {
                reply.code(404).send({ error: { message: 'Notification not found' } });
            } else {
                reply.code(500).send({ error: { message: 'Failed to update site notification' } });
            }
        }
    });

    // DELETE /admin/site-notifications/:id
    app.delete('/admin/site-notifications/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            await adminService.deleteSiteNotificationAdmin(id);
            reply.code(204).send();
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to delete site notification' } });
        }
    });

    // GET /admin/notification-log
    app.get('/admin/notification-log', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const result = await adminService.listNotificationLogAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
                status: params.status,
                channel: params.channel,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list notification log' } });
        }
    });

    // GET /admin/counts
    app.get('/admin/counts', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const counts = await adminService.getAdminCounts();
            reply.send({ data: counts });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to fetch counts' } });
        }
    });
}
