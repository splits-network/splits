/**
 * GET /api/v3/jobs/views/admin-board
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminBoardRepository } from './admin-board.repository.js';
import { AdminBoardService } from './admin-board.service.js';
import { listQuerySchema, JobListParams } from '../types.js';

export function registerAdminBoardView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new AdminBoardRepository(supabase);
  const service = new AdminBoardService(repository, supabase);

  app.get('/api/v3/jobs/views/admin-board', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getBoard(request.query as JobListParams, clerkUserId);
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send(result);
  });
}
