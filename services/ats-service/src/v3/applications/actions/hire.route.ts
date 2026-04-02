/**
 * Hire Routes — Offer acceptance and hiring
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { HireService } from './hire.service.js';
import { PlacementRepository } from '../../placements/repository.js';
import { PlacementService } from '../../placements/service.js';
import { idParamSchema } from '../types.js';

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

    // Create the placement record — revert stage on failure
    let placement;
    try {
      const startDate = body.start_date || new Date().toISOString().split('T')[0];
      const { data: job } = await supabase
        .from('jobs').select('fee_percentage, guarantee_days')
        .eq('id', hireResult.job_id).single();

      placement = await placementService.create({
        job_id: hireResult.job_id,
        candidate_id: hireResult.candidate_id,
        application_id: id,
        start_date: startDate,
        salary: body.salary,
        fee_percentage: job?.fee_percentage ?? 0,
        guarantee_days: job?.guarantee_days ?? 90,
      }, clerkUserId);
    } catch (err) {
      // Revert the stage change so the application doesn't get stuck in 'hired' without a placement
      app.log.error({ error: err, application_id: id }, 'Placement creation failed — reverting stage to offer');
      await supabase.from('applications').update({ stage: 'offer' }).eq('id', id);
      throw err;
    }

    // Create application note if hiring notes provided (V2 parity)
    if (body.notes?.trim()) {
      const { error: noteError } = await supabase
        .from('application_notes')
        .insert({
          application_id: id,
          note_type: 'hiring',
          visibility: 'internal',
          message_text: body.notes.trim(),
          created_by_type: 'recruiter',
          created_by_user_id: clerkUserId,
          created_at: new Date().toISOString(),
        });

      if (noteError) {
        // Non-critical — log but don't fail the hire
        app.log.warn({ error: noteError, application_id: id }, 'Failed to create hiring note');
      } else {
        await eventPublisher?.publish('application.note.created', {
          application_id: id, note_type: 'hiring',
          visibility: 'internal', created_by_user_id: clerkUserId,
        }, 'ats-service');
      }
    }

    return reply.send({ data: { ...hireResult, placement_id: placement.id } });
  });
}
