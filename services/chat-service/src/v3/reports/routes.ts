/**
 * Reports V3 Routes -- Core 5 CRUD
 *
 * Views and actions are registered BEFORE :id routes to avoid collision.
 * POST (create) redirects to the "submit" action (user-facing report submission).
 * List/get/update/delete are admin-only (enforced in service layer).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { ReportRepository } from './repository.js';
import { ReportService } from './service.js';
import {
  ReportListParams,
  UpdateReportInput,
  listQuerySchema,
  updateReportSchema,
  idParamSchema,
} from './types.js';

// --- View/Action registrations ---
import { registerEvidenceView } from './views/evidence.route.js';
import { registerSubmitAction } from './actions/submit.route.js';
import { registerModerateAction } from './actions/moderate.route.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerReportRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const repository = new ReportRepository(supabase);
  const service = new ReportService(repository, supabase, eventPublisher);

  // --- Views (before :id) ---
  registerEvidenceView(app, supabase);

  // --- Actions (before :id) ---
  registerSubmitAction(app, supabase, eventPublisher);
  registerModerateAction(app, supabase, eventPublisher);

  // --- Core 5 CRUD ---

  // GET /api/v3/chat/reports (admin only)
  app.get('/api/v3/chat/reports', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as ReportListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/chat/reports/:id (admin only)
  app.get('/api/v3/chat/reports/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/chat/reports
  // Creation is handled by POST /actions/submit which includes participant
  // validation and evidence collection. This core POST exists to satisfy Core 5.
  app.post('/api/v3/chat/reports', async (request, reply) => {
    return reply.status(400).send({
      error: {
        code: 'USE_ACTION',
        message: 'Use POST /api/v3/chat/reports/actions/submit to create reports',
      },
    });
  });

  // PATCH /api/v3/chat/reports/:id (admin only)
  app.patch('/api/v3/chat/reports/:id', {
    schema: { params: idParamSchema, body: updateReportSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateReportInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/chat/reports/:id (admin only, soft-delete via dismissed status)
  app.delete('/api/v3/chat/reports/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Report dismissed successfully' } });
  });
}
