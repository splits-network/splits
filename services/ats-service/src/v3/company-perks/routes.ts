/**
 * Company Perks V3 Routes — List, Add, Remove, Bulk Replace
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyPerkRepository } from './repository';
import { CompanyPerkService } from './service';
import {
  CreateCompanyPerkInput,
  BulkReplaceCompanyPerksInput,
  listQuerySchema,
  createSchema,
  bulkReplaceSchema,
  companyIdParamSchema,
  deleteParamSchema,
} from './types';

export function registerCompanyPerkRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CompanyPerkRepository(supabase);
  const service = new CompanyPerkService(repository, supabase);

  // GET /api/v3/company-perks?company_id=
  app.get('/api/v3/company-perks', {
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

  // POST /api/v3/company-perks — add single
  app.post('/api/v3/company-perks', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateCompanyPerkInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/company-perks/:companyId/:perkId
  app.delete('/api/v3/company-perks/:companyId/:perkId', {
    schema: { params: deleteParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { companyId, perkId } = request.params as { companyId: string; perkId: string };
    await service.delete(companyId, perkId, clerkUserId);
    return reply.code(204).send();
  });

  // PUT /api/v3/company-perks/company/:companyId/bulk-replace
  app.put('/api/v3/company-perks/company/:companyId/bulk-replace', {
    schema: { params: companyIdParamSchema, body: bulkReplaceSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { companyId } = request.params as { companyId: string };
    const { perks } = request.body as BulkReplaceCompanyPerksInput;
    const data = await service.bulkReplace(companyId, perks, clerkUserId);
    return reply.send({ data });
  });
}
