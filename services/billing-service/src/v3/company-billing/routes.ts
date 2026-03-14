/**
 * Company Billing V3 Routes — Profile CRUD
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyBillingRepository } from './repository';
import { CompanyBillingService } from './service';
import { CompanyBillingCreateInput, CompanyBillingUpdateInput, companyIdParamSchema, updatePaymentMethodSchema } from './types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerCompanyBillingRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CompanyBillingRepository(supabase);
  const service = new CompanyBillingService(repository, supabase);

  app.get('/api/v3/company-billing', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { page, limit } = request.query as { page?: string; limit?: string };
    const result = await service.list(clerkUserId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 25);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/company-billing/:companyId', {
    schema: { params: companyIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { companyId } = request.params as { companyId: string };
    const data = await service.getByCompanyId(companyId, clerkUserId);
    return reply.send({ data });
  });

  app.post('/api/v3/company-billing/:companyId', {
    schema: { params: companyIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { companyId } = request.params as { companyId: string };
    const data = await service.upsert(companyId, request.body as CompanyBillingCreateInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  app.patch('/api/v3/company-billing/:companyId', {
    schema: { params: companyIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { companyId } = request.params as { companyId: string };
    const data = await service.update(companyId, request.body as CompanyBillingUpdateInput, clerkUserId);
    return reply.send({ data });
  });

  // POST /:companyId/setup-intent
  app.post('/api/v3/company-billing/:companyId/setup-intent', {
    schema: { params: companyIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { companyId } = request.params as { companyId: string };
    const data = await service.createSetupIntent(companyId, clerkUserId);
    return reply.send({ data });
  });

  // POST /:companyId/payment-method
  app.post('/api/v3/company-billing/:companyId/payment-method', {
    schema: { params: companyIdParamSchema, body: updatePaymentMethodSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { companyId } = request.params as { companyId: string };
    const { payment_method_id } = request.body as { payment_method_id: string };
    const data = await service.updatePaymentMethod(companyId, payment_method_id, clerkUserId);
    return reply.send({ data });
  });

  // GET /:companyId/payment-method
  app.get('/api/v3/company-billing/:companyId/payment-method', {
    schema: { params: companyIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { companyId } = request.params as { companyId: string };
    const data = await service.getPaymentMethod(companyId, clerkUserId);
    return reply.send({ data });
  });

  // GET /:companyId/readiness
  app.get('/api/v3/company-billing/:companyId/readiness', {
    schema: { params: companyIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { companyId } = request.params as { companyId: string };
    const data = await service.getReadiness(companyId, clerkUserId);
    return reply.send({ data });
  });
}
