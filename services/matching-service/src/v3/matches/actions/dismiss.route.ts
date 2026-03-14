/**
 * PATCH /api/v3/matches/:id/dismiss — Dismiss a match
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events';
import { idParamSchema } from '../types';

export function registerDismissAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const accessResolver = new AccessContextResolver(supabase);

  app.patch('/api/v3/matches/:id/dismiss', {
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

    const { data: updated } = await supabase
      .from('candidate_role_matches')
      .update({
        status: 'dismissed',
        dismissed_by: context.identityUserId,
        dismissed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (eventPublisher) {
      await eventPublisher.publish('match.dismissed', {
        match_id: id,
        candidate_id: match.candidate_id,
        job_id: match.job_id,
        dismissed_by: context.identityUserId,
      }, 'matching-service');
    }

    return reply.send({ data: updated });
  });
}
