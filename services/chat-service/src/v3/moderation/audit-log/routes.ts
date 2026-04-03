/**
 * Audit Log V3 Routes -- Read-only CRUD
 *
 * Audit entries are created by the take-action action, not via POST here.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuditLogRepository } from './repository.js';
import { AuditLogService } from './service.js';
import { AuditLogListParams, auditLogListQuerySchema, idParamSchema } from '../types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerAuditLogRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  const repository = new AuditLogRepository(supabase);
  const service = new AuditLogService(repository, supabase);

  // GET /api/v3/moderation/audit-log
  app.get('/api/v3/moderation/audit-log', {
    schema: { querystring: auditLogListQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as AuditLogListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/moderation/audit-log/:id
  app.get('/api/v3/moderation/audit-log/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/moderation/audit-log -- not applicable
  app.post('/api/v3/moderation/audit-log', async (request, reply) => {
    return reply.status(400).send({
      error: {
        code: 'USE_ACTION',
        message: 'Audit entries are created via POST /api/v3/chat/reports/:id/actions/moderate',
      },
    });
  });

  // PATCH /api/v3/moderation/audit-log/:id -- not applicable
  app.patch('/api/v3/moderation/audit-log/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    return reply.status(400).send({
      error: { code: 'IMMUTABLE', message: 'Audit log entries cannot be modified' },
    });
  });

  // DELETE /api/v3/moderation/audit-log/:id -- not applicable
  app.delete('/api/v3/moderation/audit-log/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    return reply.status(400).send({
      error: { code: 'IMMUTABLE', message: 'Audit log entries cannot be deleted' },
    });
  });
}
