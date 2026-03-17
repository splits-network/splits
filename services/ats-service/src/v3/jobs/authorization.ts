/**
 * Jobs V3 Authorization Helpers
 *
 * Validates recruiter and company user permissions for job CRUD operations.
 * Extracted from JobService to keep files focused and under 200 lines.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { CreateJobInput } from './types';

export class JobAuthorizationHelper {
  constructor(private supabase: SupabaseClient) {}

  async resolveCompanyIds(organizationIds: string[]): Promise<string[]> {
    const { data } = await this.supabase
      .from('companies')
      .select('id')
      .in('identity_organization_id', organizationIds);
    return data?.map((c: any) => c.id) || [];
  }

  async authorizeRecruiterCreate(
    context: any, input: CreateJobInput, isOffPlatform: boolean
  ): Promise<string> {
    if (isOffPlatform) {
      const { data: firmMember } = await this.supabase
        .from('firm_members')
        .select('id')
        .eq('firm_id', input.source_firm_id!)
        .eq('recruiter_id', context.recruiterId)
        .eq('status', 'active')
        .maybeSingle();

      if (!firmMember) throw new ForbiddenError('You must be an active member of the firm to create off-platform jobs');
    } else {
      const { data: rel } = await this.supabase
        .from('recruiter_companies')
        .select('permissions')
        .eq('recruiter_id', context.recruiterId)
        .eq('company_id', input.company_id!)
        .eq('status', 'active')
        .maybeSingle();

      if (!rel?.permissions?.can_create_jobs) {
        throw new ForbiddenError('No active relationship with permission to create jobs for this company');
      }
    }
    return context.recruiterId;
  }

  async authorizeCompanyCreate(context: any, companyId: string) {
    const { data: company } = await this.supabase
      .from('companies')
      .select('identity_organization_id')
      .eq('id', companyId)
      .single();

    if (!company || !context.organizationIds.includes(company.identity_organization_id)) {
      throw new ForbiddenError('Cannot create jobs for companies outside your organization');
    }
  }

  async authorizeRecruiterMutate(context: any, job: any) {
    const isOffPlatform = job.source_firm_id && !job.company_id;

    if (isOffPlatform) {
      const { data: firmMember } = await this.supabase
        .from('firm_members')
        .select('id')
        .eq('firm_id', job.source_firm_id)
        .eq('recruiter_id', context.recruiterId)
        .eq('status', 'active')
        .maybeSingle();

      if (!firmMember) throw new ForbiddenError('You must be an active firm member to manage this off-platform job');
    } else {
      const { data: rel } = await this.supabase
        .from('recruiter_companies')
        .select('permissions')
        .eq('recruiter_id', context.recruiterId)
        .eq('company_id', job.company_id)
        .eq('status', 'active')
        .maybeSingle();

      if (!rel?.permissions?.can_edit_jobs) {
        throw new ForbiddenError('No active relationship with permission to manage jobs for this company');
      }
    }
  }

  async authorizeCompanyMutate(context: any, job: any) {
    const { data: companies } = await this.supabase
      .from('companies')
      .select('id')
      .in('identity_organization_id', context.organizationIds);

    const allowedIds = companies?.map((c: any) => c.id) || [];
    if (!allowedIds.includes(job.company_id)) {
      throw new ForbiddenError('Cannot manage jobs outside your organization');
    }
  }
}
