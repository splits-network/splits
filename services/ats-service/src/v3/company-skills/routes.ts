/**
 * Company Skills V3 Routes — List, Add, Remove, Bulk Replace
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CompanySkillRepository } from './repository';
import { CompanySkillService } from './service';
import { registerWithDetailsView } from './views/with-details.route';
import {
  CreateCompanySkillInput,
  BulkReplaceCompanySkillsInput,
  listQuerySchema,
  createSchema,
  bulkReplaceSchema,
  companyIdParamSchema,
  deleteParamSchema,
} from './types';

export function registerCompanySkillRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CompanySkillRepository(supabase);
  const service = new CompanySkillService(repository, supabase);

  // Register views before parameterized routes
  registerWithDetailsView(app, supabase);

  // GET /api/v3/company-skills?company_id=
  app.get('/api/v3/company-skills', {
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

  // POST /api/v3/company-skills — add single
  app.post('/api/v3/company-skills', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateCompanySkillInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/company-skills/:companyId/:skillId
  app.delete('/api/v3/company-skills/:companyId/:skillId', {
    schema: { params: deleteParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { companyId, skillId } = request.params as { companyId: string; skillId: string };
    await service.delete(companyId, skillId, clerkUserId);
    return reply.code(204).send();
  });

  // PUT /api/v3/company-skills/company/:companyId/bulk-replace
  app.put('/api/v3/company-skills/company/:companyId/bulk-replace', {
    schema: { params: companyIdParamSchema, body: bulkReplaceSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { companyId } = request.params as { companyId: string };
    const { skills } = request.body as BulkReplaceCompanySkillsInput;
    const data = await service.bulkReplace(companyId, skills, clerkUserId);
    return reply.send({ data });
  });
}
