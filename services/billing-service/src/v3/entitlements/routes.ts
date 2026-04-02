/**
 * Entitlements V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { EntitlementRepository } from './repository.js';
import { EntitlementService } from './service.js';

export function registerEntitlementRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient
) {
  const repository = new EntitlementRepository(supabase);
  const service = new EntitlementService(repository, supabase);

  // GET /api/v3/entitlements/me — get current user's entitlements
  app.get('/api/v3/entitlements/me', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getMyEntitlements(clerkUserId);
    return reply.send({ data });
  });
}
