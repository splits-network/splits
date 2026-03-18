/**
 * Firms List View Route
 * GET /api/v3/firms/views/list
 *
 * Returns firms with member stats enrichment.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { FirmListViewRepository } from './list.repository';
import { FirmListViewService } from './list.service';
import { FirmListParams, listQuerySchema } from '../types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerFirmListView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new FirmListViewRepository(supabase);
  const service = new FirmListViewService(repository, supabase);

  app.get('/api/v3/firms/views/list', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const query = request.query as any;
    const params: FirmListParams = {
      ...query,
      marketplace_visible: query.marketplace_visible !== undefined ? query.marketplace_visible === 'true' : undefined,
      candidate_firm: query.candidate_firm !== undefined ? query.candidate_firm === 'true' : undefined,
      industries: query.industries ? [].concat(query.industries) : undefined,
      specialties: query.specialties ? [].concat(query.specialties) : undefined,
      placement_types: query.placement_types ? [].concat(query.placement_types) : undefined,
      geo_focus: query.geo_focus ? [].concat(query.geo_focus) : undefined,
    };
    const result = await service.getAll(params, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
