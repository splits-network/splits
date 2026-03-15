/**
 * Company Culture Tags V3 Routes — List, Add, Remove, Bulk Replace
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyCultureTagRepository } from './repository';
import { CompanyCultureTagService } from './service';
import {
  CreateCompanyCultureTagInput,
  BulkReplaceCompanyCultureTagsInput,
  listQuerySchema,
  createSchema,
  bulkReplaceSchema,
  companyIdParamSchema,
  deleteParamSchema,
} from './types';

export function registerCompanyCultureTagRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CompanyCultureTagRepository(supabase);
  const service = new CompanyCultureTagService(repository, supabase);

  // GET /api/v3/company-culture-tags?company_id=
  app.get('/api/v3/company-culture-tags', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { company_id } = request.query as { company_id: string };
    const data = await service.listByCompanyId(company_id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/company-culture-tags — add single
  app.post('/api/v3/company-culture-tags', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateCompanyCultureTagInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/company-culture-tags/:companyId/:cultureTagId
  app.delete('/api/v3/company-culture-tags/:companyId/:cultureTagId', {
    schema: { params: deleteParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { companyId, cultureTagId } = request.params as { companyId: string; cultureTagId: string };
    await service.delete(companyId, cultureTagId, clerkUserId);
    return reply.code(204).send();
  });

  // PUT /api/v3/company-culture-tags/company/:companyId/bulk-replace
  app.put('/api/v3/company-culture-tags/company/:companyId/bulk-replace', {
    schema: { params: companyIdParamSchema, body: bulkReplaceSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { companyId } = request.params as { companyId: string };
    const { culture_tags } = request.body as BulkReplaceCompanyCultureTagsInput;
    const data = await service.bulkReplace(companyId, culture_tags, clerkUserId);
    return reply.send({ data });
  });
}
