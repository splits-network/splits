/**
 * Submit Application Action Route
 * POST /api/v3/gpt/actions/submit-application
 *
 * Two-step application submission with confirmation flow.
 * Step 1 (confirmed=false): Returns confirmation summary.
 * Step 2 (confirmed=true + token): Executes submission and publishes events.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events';
import { SubmitApplicationService } from './submit-application.service';
import { submitApplicationSchema, SubmitApplicationInput } from '../types';

export function registerSubmitApplicationAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const service = new SubmitApplicationService(supabase, eventPublisher);

  app.post('/api/v3/gpt/actions/submit-application', {
    schema: { body: submitApplicationSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    const body = request.body as SubmitApplicationInput;
    const result = await service.execute(body, clerkUserId);

    const statusCode = result.status === 'AI_REVIEW' ? 201 : 200;
    return reply.code(statusCode).send({ data: result });
  });
}
