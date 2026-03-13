/**
 * Placement Invoices V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { PlacementInvoiceRepository } from './repository';
import { PlacementInvoiceService } from './service';
import {
  CreatePlacementInvoiceInput,
  PlacementInvoiceListParams,
  listQuerySchema,
  createSchema,
  placementIdParamSchema,
  companyIdParamSchema,
} from './types';

export function registerPlacementInvoiceRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new PlacementInvoiceRepository(supabase);
  const service = new PlacementInvoiceService(repository, supabase, eventPublisher);

  // GET /api/v3/placement-invoices — list all
  app.get('/api/v3/placement-invoices', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as PlacementInvoiceListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/placements/:placementId/invoices — by placement
  app.get('/api/v3/placements/:placementId/invoices', {
    schema: { params: placementIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { placementId } = request.params as { placementId: string };
    const data = await service.getByPlacementId(placementId, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/placements/:placementId/invoices — create invoice
  app.post('/api/v3/placements/:placementId/invoices', {
    schema: { params: placementIdParamSchema, body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { placementId } = request.params as { placementId: string };
    const body = request.body as CreatePlacementInvoiceInput;
    const data = await service.createInvoice({ ...body, placement_id: placementId }, clerkUserId);
    return reply.code(201).send({ data });
  });

  // GET /api/v3/company-billing-profiles/:companyId/invoices
  app.get('/api/v3/company-billing-profiles/:companyId/invoices', {
    schema: { params: companyIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { companyId } = request.params as { companyId: string };
    const data = await service.getByCompanyId(companyId, clerkUserId);
    return reply.send({ data });
  });
}
