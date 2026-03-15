/**
 * Notification Preferences V3 Routes
 *
 * GET list (full matrix), PATCH single category, POST bulk update action.
 * Non-parameterized routes registered before :category routes.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { PreferenceRepository } from './repository';
import { PreferenceService } from './service';
import {
  PreferenceUpdateInput,
  BulkPreferenceUpdateInput,
  listQuerySchema,
  categoryParamSchema,
  updateSchema,
  bulkUpdateSchema,
} from './types';

export function registerPreferenceRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  const repository = new PreferenceRepository(supabase);
  const service = new PreferenceService(repository, supabase);

  // POST /api/v3/notification-preferences/actions/bulk-update
  app.post('/api/v3/notification-preferences/actions/bulk-update', {
    schema: { body: bulkUpdateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.bulkUpdate(
      request.body as BulkPreferenceUpdateInput,
      clerkUserId,
    );
    return reply.send({ data });
  });

  // GET /api/v3/notification-preferences — full effective preference matrix
  app.get('/api/v3/notification-preferences', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getAll(clerkUserId);
    return reply.send({ data });
  });

  // PATCH /api/v3/notification-preferences/:category — update single category
  app.patch('/api/v3/notification-preferences/:category', {
    schema: { params: categoryParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { category } = request.params as { category: string };
    const data = await service.updateCategory(
      category,
      request.body as PreferenceUpdateInput,
      clerkUserId,
    );
    return reply.send({ data });
  });
}
