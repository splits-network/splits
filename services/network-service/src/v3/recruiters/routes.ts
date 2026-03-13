/**
 * Recruiters V3 Routes — CRUD + me + by-slug
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { RecruiterRepository } from './repository';
import { RecruiterService } from './service';
import { RecruiterActivityRepository } from '../recruiter-activity/repository';
import { RecruiterActivityService } from '../recruiter-activity/service';
import {
  RecruiterListParams, RecruiterUpdate, CreateRecruiterInput,
  listQuerySchema, createSchema, updateSchema, idParamSchema, slugParamSchema,
} from './types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerRecruiterRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new RecruiterRepository(supabase);
  const activityRepo = new RecruiterActivityRepository(supabase);
  const activityService = new RecruiterActivityService(activityRepo);
  const service = new RecruiterService(repository, supabase, eventPublisher, activityService);

  // --- Non-parameterized routes FIRST ---

  // GET /api/v3/recruiters/me
  app.get('/api/v3/recruiters/me', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.getByClerkId(clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/recruiters/by-slug/:slug
  app.get('/api/v3/recruiters/by-slug/:slug', {
    schema: { params: slugParamSchema },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const query = request.query as { include?: string };
    const data = await service.getBySlug(slug, query.include);
    return reply.send({ data });
  });

  // --- Core CRUD ---

  // GET /api/v3/recruiters — list
  app.get('/api/v3/recruiters', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    const query = request.query as any;
    let parsedFilters: Record<string, any> = {};
    if (query.filters) {
      try {
        parsedFilters = typeof query.filters === 'string' ? JSON.parse(query.filters) : query.filters;
      } catch { /* ignore */ }
    }
    const params: RecruiterListParams = { ...query, filters: parsedFilters };
    const result = await service.getAll(params, clerkUserId || undefined);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/recruiters/:id
  app.get('/api/v3/recruiters/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { include?: string };
    const clerkUserId = getClerkUserId(request);
    const data = await service.getById(id, clerkUserId || undefined, query.include);
    return reply.send({ data });
  });

  // POST /api/v3/recruiters
  app.post('/api/v3/recruiters', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.create(request.body as CreateRecruiterInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/recruiters/:id
  app.patch('/api/v3/recruiters/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as RecruiterUpdate, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/recruiters/:id
  app.delete('/api/v3/recruiters/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Recruiter deleted successfully' } });
  });
}
