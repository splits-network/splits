/**
 * Payouts V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { PayoutRepository } from './repository';
import { PayoutService } from './service';
import {
  TransactionListParams,
  transactionListQuerySchema,
  idParamSchema,
  placementIdParamSchema,
} from './types';

export function registerPayoutRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new PayoutRepository(supabase);
  const service = new PayoutService(repository, supabase, eventPublisher);

  // GET /api/v3/payout-transactions — list
  app.get('/api/v3/payout-transactions', {
    schema: { querystring: transactionListQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.listTransactions(request.query as TransactionListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // POST /api/v3/payout-transactions/:id/process — process single transaction
  app.post('/api/v3/payout-transactions/:id/process', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.processTransaction(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/placements/:placementId/payout-transactions/process
  app.post('/api/v3/placements/:placementId/payout-transactions/process', {
    schema: { params: placementIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { placementId } = request.params as { placementId: string };
    const data = await service.processPlacementTransactions(placementId, clerkUserId);
    return reply.send({ data });
  });
}
