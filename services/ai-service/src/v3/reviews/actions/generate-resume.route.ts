/**
 * Generate Resume Action Route
 * POST /api/v3/ai-reviews/actions/generate-resume
 *
 * Fetches a candidate's Smart Resume data and job details, calls GPT to
 * generate a tailored resume, and returns structured JSON.
 * This is an action because it calls OpenAI and performs cross-table reads.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import type { IAiClient } from '@splits-network/shared-ai-client';
import { GenerateResumeService } from './generate-resume.service.js';

const generateResumeBodySchema = {
  type: 'object',
  required: ['candidate_id', 'job_id'],
  properties: {
    candidate_id: { type: 'string', format: 'uuid' },
    job_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export function registerGenerateResumeActionRoute(
  app: FastifyInstance,
  supabase: SupabaseClient,
  aiClient?: IAiClient,
) {
  const service = new GenerateResumeService(supabase, aiClient);

  app.post('/api/v3/ai-reviews/actions/generate-resume', {
    schema: { body: generateResumeBodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const data = await service.generate(request.body as { candidate_id: string; job_id: string });
    return reply.send({ data });
  });
}
