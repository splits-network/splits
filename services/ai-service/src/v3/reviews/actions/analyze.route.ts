/**
 * Analyze Action Route
 * POST /api/v3/ai-reviews/actions/analyze
 *
 * Triggers a full AI review with data enrichment and OpenAI analysis.
 * This is an action (not CRUD) because it fetches data from multiple tables,
 * calls OpenAI, and publishes domain events.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events';
import { AnalyzeService } from './analyze.service';

const analyzeBodySchema = {
  type: 'object',
  required: ['application_id'],
  properties: {
    application_id: { type: 'string', format: 'uuid' },
    candidate_id: { type: 'string', format: 'uuid' },
    job_id: { type: 'string', format: 'uuid' },
    resume_text: { type: 'string' },
    job_description: { type: 'string' },
    job_title: { type: 'string' },
    required_skills: { type: 'array', items: { type: 'string' } },
    preferred_skills: { type: 'array', items: { type: 'string' } },
    required_years: { type: 'integer', minimum: 0 },
    candidate_location: { type: 'string' },
    job_location: { type: 'string' },
    auto_transition: { type: 'boolean' },
  },
  additionalProperties: false,
};

export function registerAnalyzeActionRoute(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const service = new AnalyzeService(supabase, eventPublisher);

  app.post('/api/v3/ai-reviews/actions/analyze', {
    schema: { body: analyzeBodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    const internalKey = request.headers['x-internal-service-key'] as string;

    // Allow internal service calls or authenticated users
    if (!clerkUserId && internalKey !== process.env.INTERNAL_SERVICE_KEY) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const data = await service.analyze(request.body as Record<string, any>, clerkUserId);
    return reply.code(201).send({ data });
  });
}
