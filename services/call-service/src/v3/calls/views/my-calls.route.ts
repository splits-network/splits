/**
 * My Calls View Routes
 * GET /api/v3/calls/views/my-calls — participant-scoped list with joins
 * GET /api/v3/calls/:id/view/detail — single call with participants + entity links
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { idParamSchema, listQuerySchema, CallListParams } from '../types';
import { CallRepository } from '../repository';
import { MyCallsViewRepository } from './my-calls.repository';
import { MyCallsViewService } from './my-calls.service';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerMyCallsView(app: FastifyInstance, supabase: SupabaseClient) {
  const callRepository = new CallRepository(supabase);
  const viewRepository = new MyCallsViewRepository(supabase);
  const service = new MyCallsViewService(viewRepository, callRepository, supabase);

  // List view — participant-scoped with joins
  app.get('/api/v3/calls/views/my-calls', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);

    const raw = request.query as any;
    let filters: Record<string, any> = {};
    if (typeof raw.filters === 'string') {
      try { filters = JSON.parse(raw.filters); } catch { /* ignore */ }
    } else if (raw.filters && typeof raw.filters === 'object') {
      filters = raw.filters;
    }
    const params: CallListParams = { ...raw, ...filters };

    const result = await service.getList(params, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // Detail view — single call with enriched data
  app.get('/api/v3/calls/:id/view/detail', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getDetail(id, clerkUserId);
    return reply.send({ data });
  });
}
