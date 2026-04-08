/**
 * By-Entity View Route
 * GET /api/v3/calls/views/by-entity — entity-scoped list with joins
 *
 * Returns all calls linked to a given entity_type + entity_id,
 * regardless of participant membership.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { listQuerySchema, CallListParams } from '../types.js';
import { CallRepository } from '../repository.js';
import { ByEntityViewRepository } from './by-entity.repository.js';
import { ByEntityViewService } from './by-entity.service.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerByEntityView(app: FastifyInstance, supabase: SupabaseClient) {
  const callRepository = new CallRepository(supabase);
  const viewRepository = new ByEntityViewRepository(supabase);
  const service = new ByEntityViewService(viewRepository, callRepository, supabase);

  app.get('/api/v3/calls/views/by-entity', {
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
}
