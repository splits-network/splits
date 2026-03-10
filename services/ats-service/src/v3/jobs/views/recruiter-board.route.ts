/**
 * GET /api/v3/jobs/views/recruiter-board
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterBoardRepository } from './recruiter-board.repository';
import { RecruiterBoardService } from './recruiter-board.service';
import { listQuerySchema, JobListParams } from '../types';

export function registerRecruiterBoardView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new RecruiterBoardRepository(supabase);
  const service = new RecruiterBoardService(repository, supabase);

  app.get('/api/v3/jobs/views/recruiter-board', {
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
