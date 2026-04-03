/**
 * Smart Resume Matching Data View
 *
 * GET /api/v3/smart-resume-profiles/views/matching-data?candidate_id=X
 *
 * Returns only entries with visible_to_matching = true.
 * Used internally by matching-service and ai-service.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';

const querySchema = {
  type: 'object',
  required: ['candidate_id'],
  properties: {
    candidate_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: true,
};

export function registerMatchingDataView(app: FastifyInstance, supabase: SupabaseClient) {
  const accessResolver = new AccessContextResolver(supabase);

  app.get('/api/v3/smart-resume-profiles/views/matching-data', {
    schema: { querystring: querySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const context = await accessResolver.resolve(clerkUserId);
    const hasAccess = context.isPlatformAdmin
      || context.recruiterId
      || context.candidateId
      || context.roles.some(r => ['company_admin', 'hiring_manager'].includes(r));
    if (!hasAccess) {
      throw new ForbiddenError('Insufficient permissions');
    }

    const { candidate_id } = request.query as { candidate_id: string };

    // Find profile by candidate_id
    const { data: profile, error: profileError } = await supabase
      .from('smart_resume_profiles')
      .select('*')
      .eq('candidate_id', candidate_id)
      .is('deleted_at', null)
      .maybeSingle();

    if (profileError) throw profileError;

    // No profile = return null (consumer falls back to resume_metadata)
    if (!profile) {
      return reply.send({ data: null });
    }

    const visibleFilter = (q: any) => q.eq('visible_to_matching', true).is('deleted_at', null).order('sort_order', { ascending: true });

    const [experiences, projects, tasks, education, certifications, skills, publications] = await Promise.all([
      visibleFilter(supabase.from('smart_resume_experiences').select('*').eq('profile_id', profile.id)),
      visibleFilter(supabase.from('smart_resume_projects').select('*').eq('profile_id', profile.id)),
      visibleFilter(supabase.from('smart_resume_tasks').select('*').eq('profile_id', profile.id)),
      visibleFilter(supabase.from('smart_resume_education').select('*').eq('profile_id', profile.id)),
      visibleFilter(supabase.from('smart_resume_certifications').select('*').eq('profile_id', profile.id)),
      visibleFilter(supabase.from('smart_resume_skills').select('*').eq('profile_id', profile.id)),
      visibleFilter(supabase.from('smart_resume_publications').select('*').eq('profile_id', profile.id)),
    ]);

    return reply.send({
      data: {
        profile,
        experiences: experiences.data || [],
        projects: projects.data || [],
        tasks: tasks.data || [],
        education: education.data || [],
        certifications: certifications.data || [],
        skills: skills.data || [],
        publications: publications.data || [],
      },
    });
  });
}
