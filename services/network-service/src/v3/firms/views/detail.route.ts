/**
 * Firm Detail View Route
 * GET /api/v3/firms/:id/view/detail
 *
 * Returns enriched firm with members, invitations, and placement stats.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { idParamSchema } from '../types';
import { FirmDetailViewRepository } from './detail.repository';
import { FirmDetailViewService } from './detail.service';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerFirmDetailView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new FirmDetailViewRepository(supabase);
  const service = new FirmDetailViewService(repository, supabase);

  app.get('/api/v3/firms/:id/view/detail', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getDetail(id, clerkUserId);
    return reply.send({ data });
  });
}
