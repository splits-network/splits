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
    // Merge filters from JSON string (sent by useStandardList) into top-level params
    const raw = request.query as any;
    let filters: Record<string, any> = {};
    if (typeof raw.filters === 'string') {
      try { filters = JSON.parse(raw.filters); } catch { /* ignore */ }
    } else if (raw.filters && typeof raw.filters === 'object') {
      filters = raw.filters;
    }
    const params: JobListParams = { ...raw, ...filters };

    try {
      const result = await service.getBoard(params, clerkUserId);
      reply.header('Cache-Control', 'private, max-age=30');
      return reply.send(result);
    } catch (error: any) {
      request.log.error(error, '[RecruiterBoard] Error');
      const status = error.statusCode || 500;
      return reply.status(status).send({
        error: { code: error.code || 'INTERNAL_ERROR', message: error.message },
      });
    }
  });
}
