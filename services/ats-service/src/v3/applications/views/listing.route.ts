/**
 * Application Listing View Route
 *
 * GET /api/v3/applications/views/listing
 *
 * Returns applications with joined candidate, job, company, firm, and sourcer
 * data. Supports role-based scoping and optional includes (ai_review, documents).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ApplicationListingRepository } from './listing.repository.js';
import { ApplicationListingService } from './listing.service.js';
import { ApplicationListParams, listQuerySchema } from '../types.js';

export function registerApplicationListingView(
  app: FastifyInstance,
  supabase: SupabaseClient
) {
  const repository = new ApplicationListingRepository(supabase);
  const service = new ApplicationListingService(repository, supabase);

  app.get('/api/v3/applications/views/listing', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }
    const result = await service.getListing(
      request.query as ApplicationListParams,
      clerkUserId
    );
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
