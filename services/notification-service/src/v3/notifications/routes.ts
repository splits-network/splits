/**
 * Notifications V3 Routes
 *
 * Core CRUD + convenience endpoints for mark-all-read, unread-count, counts-by-category.
 * Non-parameterized routes registered before :id routes.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { NotificationRepository } from './repository';
import { NotificationService } from './service';
import {
    NotificationListParams,
    NotificationUpdateInput,
    listQuerySchema,
    updateSchema,
    idParamSchema,
} from './types';

export function registerNotificationRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
    eventPublisher?: IEventPublisher,
) {
    const repository = new NotificationRepository(supabase);
    const service = new NotificationService(repository, supabase, eventPublisher);

    // POST /api/v3/notifications/actions/mark-all-read
    app.post('/api/v3/notifications/actions/mark-all-read', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        if (!clerkUserId) {
            return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
        }
        const result = await service.markAllAsRead(clerkUserId, request.headers);
        return reply.send({ data: result });
    });

    // GET /api/v3/notifications/views/unread-count
    app.get('/api/v3/notifications/views/unread-count', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        if (!clerkUserId) {
            return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
        }
        const result = await service.getUnreadCount(clerkUserId, request.headers);
        return reply.send({ data: result });
    });

    // GET /api/v3/notifications/views/counts-by-category
    app.get('/api/v3/notifications/views/counts-by-category', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        if (!clerkUserId) {
            return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
        }
        const result = await service.getCountsByCategory(clerkUserId, request.headers);
        return reply.send({ data: result });
    });

    // GET /api/v3/notifications — list
    app.get('/api/v3/notifications', {
        schema: { querystring: listQuerySchema },
    }, async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        if (!clerkUserId) {
            return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
        }
        const result = await service.getAll(request.query as NotificationListParams, clerkUserId, request.headers);
        return reply.send({ data: result.data, pagination: result.pagination });
    });

    // GET /api/v3/notifications/:id
    app.get('/api/v3/notifications/:id', {
        schema: { params: idParamSchema },
    }, async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        if (!clerkUserId) {
            return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
        }
        const { id } = request.params as { id: string };
        const data = await service.getById(id, clerkUserId, request.headers);
        return reply.send({ data });
    });

    // PATCH /api/v3/notifications/:id
    app.patch('/api/v3/notifications/:id', {
        schema: { params: idParamSchema, body: updateSchema },
    }, async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        if (!clerkUserId) {
            return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
        }
        const { id } = request.params as { id: string };
        const data = await service.update(id, request.body as NotificationUpdateInput, clerkUserId, request.headers);
        return reply.send({ data });
    });

    // DELETE /api/v3/notifications/:id — soft delete (dismiss)
    app.delete('/api/v3/notifications/:id', {
        schema: { params: idParamSchema },
    }, async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        if (!clerkUserId) {
            return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
        }
        const { id } = request.params as { id: string };
        await service.dismiss(id, clerkUserId, request.headers);
        return reply.send({ data: { message: 'Notification dismissed successfully' } });
    });
}
