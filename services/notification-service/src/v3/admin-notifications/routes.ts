/**
 * Admin Notifications V3 Routes
 *
 * Admin-only CRUD for site_notifications + read-only notification_log views.
 * Non-parameterized routes registered before :id routes.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { AdminNotificationRepository } from './repository';
import { AdminNotificationService } from './service';
import {
  AdminListParams,
  CreateSiteNotificationInput,
  UpdateSiteNotificationInput,
  siteNotificationListSchema,
  notificationLogListSchema,
  createSiteNotificationSchema,
  updateSiteNotificationSchema,
  idParamSchema,
} from './types';

export function registerAdminNotificationRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const repository = new AdminNotificationRepository(supabase);
  const service = new AdminNotificationService(repository, supabase, eventPublisher);

  // GET /api/v3/admin-notifications/views/notification-log
  app.get('/api/v3/admin-notifications/views/notification-log', {
    schema: { querystring: notificationLogListSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.listNotificationLog(request.query as AdminListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/admin-notifications/views/counts
  app.get('/api/v3/admin-notifications/views/counts', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getAdminCounts(clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/admin-notifications — list site notifications
  app.get('/api/v3/admin-notifications', {
    schema: { querystring: siteNotificationListSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.listSiteNotifications(request.query as AdminListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/admin-notifications/:id
  app.get('/api/v3/admin-notifications/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getSiteNotification(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/admin-notifications
  app.post('/api/v3/admin-notifications', {
    schema: { body: createSiteNotificationSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.createSiteNotification(
      request.body as CreateSiteNotificationInput,
      clerkUserId,
    );
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/admin-notifications/:id
  app.patch('/api/v3/admin-notifications/:id', {
    schema: { params: idParamSchema, body: updateSiteNotificationSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.updateSiteNotification(
      id,
      request.body as UpdateSiteNotificationInput,
      clerkUserId,
    );
    return reply.send({ data });
  });

  // DELETE /api/v3/admin-notifications/:id
  app.delete('/api/v3/admin-notifications/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.deleteSiteNotification(id, clerkUserId);
    return reply.send({ data: { message: 'Site notification deleted successfully' } });
  });
}
