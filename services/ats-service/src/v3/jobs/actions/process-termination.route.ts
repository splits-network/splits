/**
 * POST /api/v3/jobs/actions/process-termination
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { ProcessTerminationRepository } from './process-termination.repository.js';
import { ProcessTerminationService } from './process-termination.service.js';

const bodySchema = {
  type: 'object',
  required: ['recruiter_id', 'decisions'],
  properties: {
    recruiter_id: { type: 'string', format: 'uuid' },
    decisions: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['job_id', 'action'],
        properties: {
          job_id: { type: 'string', format: 'uuid' },
          action: { type: 'string', enum: ['keep', 'pause', 'close'] },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};

export function registerProcessTerminationAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new ProcessTerminationRepository(supabase);
  const service = new ProcessTerminationService(repository, eventPublisher);

  app.post('/api/v3/jobs/actions/process-termination', {
    schema: { body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { recruiter_id, decisions } = request.body as any;
    await service.process(recruiter_id, decisions);
    return reply.send({ data: { message: 'Termination decisions processed' } });
  });
}
