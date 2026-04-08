/**
 * Generate and Review Admin Route
 * POST /admin/ai/generate-and-review
 *
 * Admin-only action (admin-gateway only): generates a tailored resume from
 * the candidate's smart resume, saves it to applications.resume_data, and
 * creates a fresh AI review.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import type { IAiClient } from '@splits-network/shared-ai-client';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { GenerateAndReviewService } from './generate-and-review.service.js';

const bodySchema = {
  type: 'object',
  required: ['application_id'],
  properties: {
    application_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export function registerGenerateAndReviewAdminRoute(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  aiClient?: IAiClient,
) {
  if (!aiClient) return;

  const service = new GenerateAndReviewService(supabase, aiClient, eventPublisher);

  app.post('/admin/ai/generate-and-review', {
    schema: { body: bodySchema },
  }, async (request, reply) => {
    const { application_id } = request.body as { application_id: string };

    try {
      const data = await service.generateAndReview(application_id);
      return reply.send({ data });
    } catch (err: any) {
      if (err.statusCode === 400 || err.statusCode === 404) {
        return reply.status(err.statusCode).send({ error: { code: err.statusCode === 404 ? 'NOT_FOUND' : 'BAD_REQUEST', message: err.message } });
      }
      throw err;
    }
  });
}
