/**
 * POST /api/v3/matches/:id/invite — Invite candidate to apply
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events';
import { idParamSchema } from '../types';

async function findCandidateRecruiter(supabase: SupabaseClient, candidateId: string) {
  const { data } = await supabase
    .from('recruiter_candidates')
    .select('recruiter_id, recruiters!inner(user_id)')
    .eq('candidate_id', candidateId)
    .eq('status', 'active')
    .eq('consent_given', true)
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    recruiter_id: data.recruiter_id,
    recruiter_user_id: (data as any).recruiters?.user_id,
  };
}

export function registerInviteAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const accessResolver = new AccessContextResolver(supabase);

  app.post('/api/v3/matches/:id/invite', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const context = await accessResolver.resolve(clerkUserId);

    // Fetch match with job info for permission check
    const { data: match, error } = await supabase
      .from('candidate_role_matches')
      .select(`
        *,
        candidates(id, full_name),
        jobs(id, title, company_id, job_owner_recruiter_id, companies(id, name, identity_organization_id))
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!match) throw new NotFoundError('Match', id);

    // Permission check: admin, company user for this job's company, or recruiter who owns the job
    if (!context.isPlatformAdmin) {
      let allowed = false;

      // Company user via companyIds
      if (context.companyIds?.length && match.jobs?.company_id) {
        if (context.companyIds.includes(match.jobs.company_id)) allowed = true;
      }

      // Company user via organizationIds
      if (!allowed && context.organizationIds?.length && match.jobs?.companies?.identity_organization_id) {
        if (context.organizationIds.includes(match.jobs.companies.identity_organization_id)) allowed = true;
      }

      // Recruiter who owns the job
      if (!allowed && context.recruiterId && match.jobs?.job_owner_recruiter_id === context.recruiterId) {
        allowed = true;
      }

      if (!allowed) throw new ForbiddenError('Not authorized to invite candidates for this role');
    }

    if (match.invite_status === 'sent') {
      return reply.status(409).send({ error: { code: 'ALREADY_INVITED', message: 'Candidate already invited for this match' } });
    }

    const { data: updated } = await supabase
      .from('candidate_role_matches')
      .update({
        invited_by: context.identityUserId,
        invited_at: new Date().toISOString(),
        invite_status: 'sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    const recruiterRelation = await findCandidateRecruiter(supabase, match.candidate_id);

    if (eventPublisher) {
      await eventPublisher.publish('match.invited', {
        match_id: id,
        candidate_id: match.candidate_id,
        job_id: match.job_id,
        invited_by: context.identityUserId,
        match_score: match.match_score,
        match_factors: match.match_factors,
        recruiter_id: recruiterRelation?.recruiter_id || null,
        recruiter_user_id: recruiterRelation?.recruiter_user_id || null,
        candidate_name: match.candidates?.full_name || null,
        job_title: match.jobs?.title || null,
        company_name: match.jobs?.companies?.name || null,
      }, 'matching-service');
    }

    return reply.send({
      data: {
        ...updated,
        recruiter_user_id: recruiterRelation?.recruiter_user_id || null,
      },
    });
  });
}
