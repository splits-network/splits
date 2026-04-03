/**
 * Evidence View Route
 *
 * GET /api/v3/chat/reports/:id/view/evidence
 * Admin-only. Returns report with associated evidence messages.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { EvidenceViewRepository } from './evidence.repository.js';
import { EvidenceViewService } from './evidence.service.js';

const paramsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
};

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerEvidenceView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new EvidenceViewRepository(supabase);
  const service = new EvidenceViewService(repository, supabase);

  app.get('/api/v3/chat/reports/:id/view/evidence', {
    schema: { params: paramsSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const result = await service.getEvidence(id, clerkUserId);
    return reply.send({ data: result });
  });
}
