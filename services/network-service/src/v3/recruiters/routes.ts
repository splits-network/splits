/**
 * Recruiters V3 Routes — Core CRUD + /me
 *
 * Views (marketplace-listing, by-slug) are in views/ directory.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { RecruiterRepository } from './repository.js';
import { RecruiterService } from './service.js';
import { RecruiterActivityRepository } from '../recruiter-activity/repository.js';
import { RecruiterActivityService } from '../recruiter-activity/service.js';
import { registerMarketplaceListingView } from './views/marketplace-listing.route.js';
import { registerRecruiterProfileView } from './views/profile.route.js';
import {
  RecruiterListParams, RecruiterUpdate, CreateRecruiterInput,
  listQuerySchema, createSchema, updateSchema, idParamSchema,
} from './types.js';

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

  // --- Views (registered before :id to avoid param collision) ---
  registerMarketplaceListingView(app, supabase);
  registerRecruiterProfileView(app, supabase);

  // GET /api/v3/recruiters/me
  app.get('/api/v3/recruiters/me', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.getByClerkId(clerkUserId);
    return reply.send({ data });
  });

  // --- Core CRUD ---

  // GET /api/v3/recruiters — list (flat, no joins)
  app.get('/api/v3/recruiters', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as RecruiterListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/recruiters/:id (flat, no joins)
  app.get('/api/v3/recruiters/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getById(id);
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
