/**
 * Auto-Parse Smart Resume Route
 * POST /admin/smart-resume/auto-parse
 *
 * Admin-only action (admin-gateway only): one-click smart resume creation
 * from a candidate's existing resume document. Finds the document, runs
 * AI extraction, and populates smart_resume_* tables.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import type { IAiClient } from '@splits-network/shared-ai-client';
import { IEventPublisher } from '../../v2/shared/events.js';
import { AutoParseService } from './auto-parse.service.js';

const bodySchema = {
  type: 'object',
  required: ['candidate_id'],
  properties: {
    candidate_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export function registerAutoParseAdminRoute(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  aiClient?: IAiClient,
) {
  if (!aiClient) return;

  const service = new AutoParseService(supabase, aiClient, eventPublisher);

  app.post('/admin/smart-resume/auto-parse', {
    schema: { body: bodySchema },
  }, async (request, reply) => {
    const { candidate_id } = request.body as { candidate_id: string };

    try {
      const data = await service.autoParse(candidate_id);
      return reply.send({ data });
    } catch (err: any) {
      if (err.statusCode === 400) {
        return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: err.message } });
      }
      throw err;
    }
  });
}
