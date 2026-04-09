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
      // Resolve creator type from user roles (memberships use user_id, not clerk ID)
      const { data: user } = await supabase
        .from('users')
        .select('id, memberships!memberships_user_id_fkey1(role_name)')
        .eq('clerk_user_id', clerkUserId)
        .is('memberships.deleted_at', null)
        .maybeSingle();
      const roleName = (user?.memberships as any)?.[0]?.role_name;
      const createdByType = roleName === 'hiring_manager' ? 'hiring_manager'
        : roleName === 'company_admin' ? 'company_admin'
        : 'candidate_recruiter';

      const { error: noteError } = await supabase
        .from('application_notes')
        .insert({
          application_id: id,
          note_type: 'stage_transition',
          visibility: 'company_only',
          message_text: body.notes.trim(),
          created_by_type: createdByType,
          created_by_user_id: clerkUserId,
          created_at: new Date().toISOString(),
        });

      if (noteError) {
        // Non-critical — log but don't fail the hire
        app.log.warn({ error: noteError, application_id: id }, 'Failed to create hiring note');
      } else {
        await eventPublisher?.publish('application.note.created', {
          application_id: id, note_type: 'stage_transition',
          visibility: 'company_only', created_by_user_id: clerkUserId,
        }, 'ats-service');
      }
    }

    return reply.send({ data: { ...hireResult, placement_id: placement.id } });
  });
}
