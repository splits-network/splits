/**
 * GET /api/v3/chat/conversations/:id/view/detail
 *
 * Single conversation with enriched participant details and caller's participant state.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { DetailViewRepository } from './detail.repository';
import { DetailViewService } from './detail.service';
import { idParamSchema } from '../types';

export function registerDetailView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new DetailViewRepository(supabase);
  const service = new DetailViewService(repository, supabase);

  app.get('/api/v3/chat/conversations/:id/view/detail', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getDetail(id, clerkUserId);
    reply.header('Cache-Control', 'private, max-age=10');
    return reply.send({ data });
  });
}
