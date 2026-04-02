/**
 * GET /api/v3/recruiters/by-slug/:slug — Enriched recruiter profile view
 * GET /api/v3/recruiters/:id/view/profile — Enriched recruiter profile by ID
 * Auth: None — public profile pages
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterProfileRepository } from './profile.repository.js';
import { RecruiterProfileService } from './profile.service.js';
import { idParamSchema, slugParamSchema } from '../types.js';

export function registerRecruiterProfileView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new RecruiterProfileRepository(supabase);
  const service = new RecruiterProfileService(repository);

  app.get('/api/v3/recruiters/by-slug/:slug', {
    schema: { params: slugParamSchema },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const data = await service.getBySlug(slug);
    reply.header('Cache-Control', 'public, max-age=60');
    return reply.send({ data });
  });

  app.get('/api/v3/recruiters/:id/view/profile', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await service.getById(id);
    reply.header('Cache-Control', 'public, max-age=60');
    return reply.send({ data });
  });
}
