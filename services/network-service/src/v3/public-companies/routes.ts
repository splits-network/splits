/**
 * Public Companies V3 Routes
 *
 * Unauthenticated endpoints for the public company directory.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { PublicCompanyRepository } from './repository.js';
import { PublicCompanyService } from './service.js';
import {
  PublicCompanyListParams, PublicCompanyJobsParams,
  listQuerySchema, jobsQuerySchema, slugParamSchema,
} from './types.js';

export function registerPublicCompanyRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new PublicCompanyRepository(supabase);
  const service = new PublicCompanyService(repository);

  app.get('/api/v3/public/companies', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const params = request.query as PublicCompanyListParams;
    const result = await service.getPublicCompanies(params);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/public/companies/:slug', {
    schema: { params: slugParamSchema },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const data = await service.getPublicCompanyBySlug(slug);
    return reply.send({ data });
  });

  app.get('/api/v3/public/companies/:slug/profile', {
    schema: { params: slugParamSchema },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const data = await service.getPublicCompanyProfile(slug);
    if (!data) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Company not found' } });
    return reply.send({ data });
  });

  app.get('/api/v3/public/companies/:slug/jobs', {
    schema: { params: slugParamSchema, querystring: jobsQuerySchema },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const params = request.query as PublicCompanyJobsParams;
    const result = await service.getPublicCompanyJobs(slug, params);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
