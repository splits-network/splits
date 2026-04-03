/**
 * Smart Resume Full Profile View
 *
 * GET /api/v3/smart-resume-profiles/:id/view/full
 *
 * Returns the profile + all child data (experiences, projects, tasks,
 * education, certifications, skills, publications).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';

const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export function registerFullProfileView(app: FastifyInstance, supabase: SupabaseClient) {
  const accessResolver = new AccessContextResolver(supabase);

  app.get('/api/v3/smart-resume-profiles/:id/view/full', {
    schema: { params: idParamSchema },
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

    const { id } = request.params as { id: string };

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('smart_resume_profiles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new NotFoundError('SmartResumeProfile', id);

    // Parallel fetch all child tables
    const [experiences, projects, tasks, education, certifications, skills, publications] = await Promise.all([
      supabase.from('smart_resume_experiences').select('*').eq('profile_id', id).is('deleted_at', null).order('sort_order', { ascending: true }),
      supabase.from('smart_resume_projects').select('*').eq('profile_id', id).is('deleted_at', null).order('sort_order', { ascending: true }),
      supabase.from('smart_resume_tasks').select('*').eq('profile_id', id).is('deleted_at', null).order('sort_order', { ascending: true }),
      supabase.from('smart_resume_education').select('*').eq('profile_id', id).is('deleted_at', null).order('sort_order', { ascending: true }),
      supabase.from('smart_resume_certifications').select('*').eq('profile_id', id).is('deleted_at', null).order('sort_order', { ascending: true }),
      supabase.from('smart_resume_skills').select('*').eq('profile_id', id).is('deleted_at', null).order('sort_order', { ascending: true }),
      supabase.from('smart_resume_publications').select('*').eq('profile_id', id).is('deleted_at', null).order('sort_order', { ascending: true }),
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
