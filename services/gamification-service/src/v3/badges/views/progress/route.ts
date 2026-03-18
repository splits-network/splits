/**
 * GET /api/v3/badges/views/progress
 *
 * Public badge progress view — no auth required.
 * Returns badge progress for an entity with badge definition details.
 * Query params: entity_type (required), entity_id (required).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { BadgeProgressRepository } from './repository';

const querySchema = {
  type: 'object',
  required: ['entity_type', 'entity_id'],
  properties: {
    entity_type: { type: 'string', enum: ['recruiter', 'candidate', 'company', 'firm'] },
    entity_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export function registerBadgeProgressView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new BadgeProgressRepository(supabase);

  app.get('/api/v3/badges/views/progress', {
    schema: { querystring: querySchema },
  }, async (request, reply) => {
    const { entity_type, entity_id } = request.query as {
      entity_type: string;
      entity_id: string;
    };
    const data = await repository.findByEntity(entity_type, entity_id);
    return reply.send({ data });
  });
}
