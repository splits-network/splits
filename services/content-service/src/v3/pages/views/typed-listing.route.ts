/**
 * GET /api/v3/pages/views/typed-listing — public listing by page type
 *
 * Returns published pages with their tags for public listing pages.
 * Supports filtering by app, tag slug, and pagination.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { TypedListingRepository } from './typed-listing.repository';

const querySchema = {
  type: 'object',
  required: ['page_type'],
  properties: {
    page_type: {
      type: 'string',
      enum: ['blog', 'article', 'help', 'partner', 'press', 'legal', 'page'],
    },
    app: { type: 'string' },
    tag: { type: 'string' },
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
  },
  additionalProperties: true,
};

export function registerTypedListingView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new TypedListingRepository(supabase);

  app.get('/api/v3/pages/views/typed-listing', {
    schema: { querystring: querySchema },
  }, async (request, reply) => {
    const params = request.query as {
      page_type: string;
      app?: string;
      tag?: string;
      page?: number;
      limit?: number;
    };

    const { data, total } = await repository.findPublished(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);

    return reply.send({
      data,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    });
  });
}
