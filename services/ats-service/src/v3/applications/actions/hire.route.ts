/**
 * Hire Routes — Offer acceptance and hiring
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events';
import { HireService } from './hire.service';
import { PlacementRepository } from '../../placements/repository';
import { PlacementService } from '../../placements/service';
import { idParamSchema } from '../types';

export function registerHireRoutes(
  app: FastifyInstance,
  service: HireService,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const placementRepository = new PlacementRepository(supabase);
  const placementService = new PlacementService(placementRepository, supabase, eventPublisher);

  // POST /api/v3/applications/:id/accept-offer
  app.post('/api/v3/applications/:id/accept-offer', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const data = await service.acceptOffer(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/applications/:id/hire
  app.post('/api/v3/applications/:id/hire', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const body = request.body as { salary: number; start_date?: string; notes?: string };
    const hireResult = await service.hireCandidate(id, body, clerkUserId);

    // Create the placement record
    const startDate = body.start_date || new Date().toISOString().split('T')[0];
    const { data: job } = await supabase
      .from('jobs').select('fee_percentage, guarantee_days')
      .eq('id', hireResult.job_id).single();

    const placement = await placementService.create({
      job_id: hireResult.job_id,
      candidate_id: hireResult.candidate_id,
      application_id: id,
      start_date: startDate,
      salary: body.salary,
      fee_percentage: job?.fee_percentage ?? 0,
      guarantee_days: job?.guarantee_days ?? 90,
      notes: body.notes,
    }, clerkUserId);

    return reply.send({ data: { ...hireResult, placement_id: placement.id } });
  });
}
