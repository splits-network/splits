/**
 * Payout Audit V3 Routes - Read-only audit trail
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { PayoutAuditRepository } from './repository.js';
import { PayoutAuditService } from './service.js';
import { AuditListParams, auditListQuerySchema, placementIdParamSchema } from './types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerAuditRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new PayoutAuditRepository(supabase);
  const service = new PayoutAuditService(repository, supabase);

  app.get('/api/v3/placement-payout-audit-log', { schema: { querystring: auditListQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.list(request.query as AuditListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/placement-payout-audit-log/placement/:placementId', { schema: { params: placementIdParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { placementId } = request.params as { placementId: string };
    const data = await service.getByPlacementId(placementId, clerkUserId);
    return reply.send({ data });
  });
}
