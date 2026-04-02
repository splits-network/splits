/**
 * PATCH /api/v3/matches/:id/deny-invite — Deny an invite
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { idParamSchema } from '../types.js';

export function registerDenyInviteAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const accessResolver = new AccessContextResolver(supabase);

  app.patch('/api/v3/matches/:id/deny-invite', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const context = await accessResolver.resolve(clerkUserId);

    const { data: match, error } = await supabase
      .from('candidate_role_matches')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!match) throw new NotFoundError('Match', id);
    if (match.invite_status !== 'sent') {
      return reply.status(409).send({ error: { code: 'NO_PENDING_INVITE', message: 'No pending invite' } });
    }

    // Recruiter can deny for represented candidate, candidate for themselves
    if (!context.isPlatformAdmin) {
      const isCandidate = context.candidateId === match.candidate_id;
      let isRecruiter = false;
      if (context.recruiterId) {
        const { data: rel } = await supabase
          .from('recruiter_candidates')
          .select('id')
          .eq('recruiter_id', context.recruiterId)
          .eq('candidate_id', match.candidate_id)
          .eq('status', 'active')
          .maybeSingle();
        isRecruiter = !!rel;
      }
      if (!isCandidate && !isRecruiter) {
        throw new ForbiddenError('Not authorized to deny this invite');
      }
    }

    const { data: updated } = await supabase
      .from('candidate_role_matches')
      .update({
        invite_status: 'denied',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (eventPublisher) {
      await eventPublisher.publish('match.invite_denied', {
        match_id: id,
        candidate_id: match.candidate_id,
        job_id: match.job_id,
        denied_by: context.identityUserId,
        invited_by: match.invited_by,
      }, 'matching-service');
    }

    return reply.send({ data: updated });
  });
}
