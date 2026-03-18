/**
 * Analyze Resume Action Route
 * POST /api/v3/gpt/actions/analyze-resume
 *
 * Triggers resume analysis via RabbitMQ event instead of HTTP call.
 * Publishes `resume.analyze.requested` for ai-service to process.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events';
import { AnalyzeResumeService } from './analyze-resume.service';
import { resumeAnalysisSchema } from '../types';

export function registerAnalyzeResumeAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const service = new AnalyzeResumeService(supabase, eventPublisher);

  app.post('/api/v3/gpt/actions/analyze-resume', {
    schema: { body: resumeAnalysisSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    const body = request.body as { job_id: string; resume_text?: string };
    const data = await service.execute(body, clerkUserId);
    return reply.code(202).send({ data });
  });
}
