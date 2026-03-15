/**
 * Job Skills V3 Routes — GET list, POST, DELETE (3 routes) + bulk-replace action
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { JobSkillRepository } from './repository';
import { JobSkillService } from './service';
import { CreateJobSkillInput, JobSkillListParams,
  listQuerySchema, createSchema, deleteParamsSchema } from './types';
import { registerBulkReplaceAction } from './actions/bulk-replace.route';

export function registerJobSkillRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient
) {
  const repository = new JobSkillRepository(supabase);
  const service = new JobSkillService(repository);

  // Register action before parameterized routes
  registerBulkReplaceAction(app, supabase);

  // GET /api/v3/job-skills — list (requires job_id)
  app.get('/api/v3/job-skills', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as JobSkillListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // POST /api/v3/job-skills — add skill to job
  app.post('/api/v3/job-skills', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.add(request.body as CreateJobSkillInput);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/job-skills/:jobId/:skillId — remove skill from job
  app.delete('/api/v3/job-skills/:jobId/:skillId', {
    schema: { params: deleteParamsSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { jobId, skillId } = request.params as { jobId: string; skillId: string };
    await service.remove(jobId, skillId);
    return reply.send({ data: { message: 'Job skill removed successfully' } });
  });
}
