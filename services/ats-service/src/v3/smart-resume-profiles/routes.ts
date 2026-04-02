/**
 * Smart Resume Profiles V3 Routes — Core 5 CRUD + Views
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import type { IAiClient } from '@splits-network/shared-ai-client';
import { SmartResumeProfileRepository } from './repository.js';
import { SmartResumeProfileService } from './service.js';
import { registerFullProfileView } from './views/full-profile.route.js';
import { registerMatchingDataView } from './views/matching-data.route.js';
import { registerParseResumeAction } from './actions/parse-resume.route.js';
import {
  CreateSmartResumeProfileInput,
  UpdateSmartResumeProfileInput,
  SmartResumeProfileListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types.js';

export function registerSmartResumeProfileRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  aiClient?: IAiClient,
) {
  const repository = new SmartResumeProfileRepository(supabase);
  const service = new SmartResumeProfileService(repository, supabase, eventPublisher);

  // Register views and actions before :id routes
  registerFullProfileView(app, supabase);
  registerMatchingDataView(app, supabase);
  registerParseResumeAction(app, supabase, eventPublisher, aiClient);

  // GET /api/v3/smart-resume-profiles
  app.get('/api/v3/smart-resume-profiles', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as SmartResumeProfileListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/smart-resume-profiles/:id
  app.get('/api/v3/smart-resume-profiles/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/smart-resume-profiles
  app.post('/api/v3/smart-resume-profiles', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateSmartResumeProfileInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/smart-resume-profiles/:id
  app.patch('/api/v3/smart-resume-profiles/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateSmartResumeProfileInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/smart-resume-profiles/:id
  app.delete('/api/v3/smart-resume-profiles/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Smart resume profile deleted successfully' } });
  });
}
