/**
 * POST /api/v3/job-requirements/actions/bulk-replace
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { BulkReplaceRequirementsRepository } from './bulk-replace.repository';
import { BulkReplaceRequirementsService } from './bulk-replace.service';

const bodySchema = {
  type: 'object',
  required: ['job_id', 'requirements'],
  properties: {
    job_id: { type: 'string', format: 'uuid' },
    requirements: {
      type: 'array',
      items: {
        type: 'object',
        required: ['requirement_type', 'description', 'sort_order'],
        properties: {
          requirement_type: { type: 'string', enum: ['mandatory', 'preferred'] },
          description: { type: 'string', minLength: 1, maxLength: 1000 },
          sort_order: { type: 'integer', minimum: 0 },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};

export function registerBulkReplaceAction(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new BulkReplaceRequirementsRepository(supabase);
  const service = new BulkReplaceRequirementsService(repository);

  app.post('/api/v3/job-requirements/actions/bulk-replace', {
    schema: { body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { job_id, requirements } = request.body as any;
    const data = await service.bulkReplace(job_id, requirements);
    return reply.send({ data });
  });
}
