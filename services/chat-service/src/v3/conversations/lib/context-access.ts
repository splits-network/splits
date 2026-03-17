/**
 * Context Access Assertion
 *
 * Validates that the caller has access to the application/job/company
 * context they're trying to start a conversation about.
 * Ported from V2 ChatServiceV2.assertContextAccess.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';

interface AccessContext {
  identityUserId: string | null;
  candidateId?: string | null;
  recruiterId?: string | null;
  organizationIds: string[];
}

interface ChatContext {
  application_id?: string | null;
  job_id?: string | null;
  company_id?: string | null;
}

export async function assertContextAccess(
  supabase: SupabaseClient,
  context: AccessContext,
  chatContext?: ChatContext,
): Promise<void> {
  if (!chatContext) return;

  if (chatContext.application_id) {
    await assertApplicationAccess(supabase, context, chatContext.application_id);
    return;
  }

  if (chatContext.job_id) {
    await assertJobAccess(supabase, context, chatContext.job_id);
    return;
  }

  if (chatContext.company_id) {
    await assertCompanyAccess(supabase, context, chatContext.company_id);
    return;
  }
}

async function assertApplicationAccess(
  supabase: SupabaseClient,
  context: AccessContext,
  applicationId: string,
): Promise<void> {
  const { data: application } = await supabase
    .from('applications')
    .select('candidate_id, recruiter_id, job_id')
    .eq('id', applicationId)
    .maybeSingle();

  if (!application) throw new NotFoundError('Application', applicationId);

  if (context.candidateId && application.candidate_id === context.candidateId) return;
  if (context.recruiterId && application.recruiter_id === context.recruiterId) return;

  if (context.organizationIds.length > 0) {
    const { data: job } = await supabase.from('jobs').select('company_id').eq('id', application.job_id).maybeSingle();
    if (job?.company_id) {
      const { data: company } = await supabase.from('companies').select('identity_organization_id').eq('id', job.company_id).maybeSingle();
      if (company?.identity_organization_id && context.organizationIds.includes(company.identity_organization_id)) return;
    }
  }

  throw new ForbiddenError('Not authorized for application context');
}

async function assertJobAccess(
  supabase: SupabaseClient,
  context: AccessContext,
  jobId: string,
): Promise<void> {
  const { data: job } = await supabase.from('jobs').select('company_id').eq('id', jobId).maybeSingle();
  if (!job) throw new NotFoundError('Job', jobId);

  if (context.organizationIds.length > 0) {
    const { data: company } = await supabase.from('companies').select('identity_organization_id').eq('id', job.company_id).maybeSingle();
    if (company?.identity_organization_id && context.organizationIds.includes(company.identity_organization_id)) return;
  }

  if (context.recruiterId) {
    const { data: candidateSide } = await supabase
      .from('applications').select('id').eq('job_id', jobId).eq('candidate_recruiter_id', context.recruiterId).limit(1).maybeSingle();
    if (candidateSide) return;

    const { data: companySide } = await supabase
      .from('jobs').select('id').eq('id', jobId)
      .or(`company_recruiter_id.eq.${context.recruiterId},job_owner_recruiter_id.eq.${context.recruiterId}`)
      .maybeSingle();
    if (companySide) return;
  }

  if (context.candidateId) {
    const { data: application } = await supabase
      .from('applications').select('id').eq('job_id', jobId).eq('candidate_id', context.candidateId).maybeSingle();
    if (application) return;
  }

  throw new ForbiddenError('Not authorized for job context');
}

async function assertCompanyAccess(
  supabase: SupabaseClient,
  context: AccessContext,
  companyId: string,
): Promise<void> {
  if (context.organizationIds.length > 0) {
    const { data: company } = await supabase.from('companies').select('identity_organization_id').eq('id', companyId).maybeSingle();
    if (company?.identity_organization_id && context.organizationIds.includes(company.identity_organization_id)) return;
  }

  if (context.recruiterId) {
    const { data: assignments } = await supabase
      .from('role_assignments').select('job_id').eq('recruiter_user_id', context.recruiterId).eq('status', 'active');
    if (assignments && assignments.length > 0) {
      const jobIds = assignments.map((row: any) => row.job_id);
      const { data: jobs } = await supabase.from('jobs').select('id, company_id').in('id', jobIds);
      if (jobs?.some((row: any) => row.company_id === companyId)) return;
    }
  }

  throw new ForbiddenError('Not authorized for company context');
}
