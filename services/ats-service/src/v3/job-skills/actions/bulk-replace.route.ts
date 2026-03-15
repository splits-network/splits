/**
 * POST /api/v3/job-skills/actions/bulk-replace
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { BulkReplaceSkillsRepository } from './bulk-replace.repository';
import { BulkReplaceSkillsService } from './bulk-replace.service';

const bodySchema = {
  type: 'object',
  required: ['job_id', 'skills'],
  properties: {
    job_id: { type: 'string', format: 'uuid' },
    skills: {
      type: 'array',
      items: {
        type: 'object',
        required: ['skill_id', 'is_required'],
        properties: {
          skill_id: { type: 'string', format: 'uuid' },
          is_required: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};

export function registerBulkReplaceAction(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new BulkReplaceSkillsRepository(supabase);
  const service = new BulkReplaceSkillsService(repository);

  app.post('/api/v3/job-skills/actions/bulk-replace', {
    schema: { body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { job_id, skills } = request.body as any;
    const data = await service.bulkReplace(job_id, skills);
    return reply.send({ data });
  });
}
