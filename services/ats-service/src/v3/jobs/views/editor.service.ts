/**
 * Editor View Service
 * Permission check, returns form-ready payload
 */

import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { EditorRepository } from './editor.repository.js';

export class EditorService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: EditorRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getEditor(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const job = await this.repository.findById(id);
    if (!job) throw new NotFoundError('Job', id);

    // Authorization — must have edit access
    if (!context.isPlatformAdmin) {
      if (context.recruiterId && context.roles.includes('recruiter')) {
        await this.verifyRecruiterEdit(context, job);
      } else if (context.organizationIds.length > 0) {
        await this.verifyCompanyEdit(context, job);
      } else {
        throw new ForbiddenError('Insufficient permissions to edit this job');
      }
    }

    const [requirements, skills] = await Promise.all([
      this.repository.findRequirements(id),
      this.repository.findSkills(id),
    ]);

    return { ...job, requirements, skills };
  }

  private async verifyRecruiterEdit(context: any, job: any) {
    const isOffPlatform = job.source_firm_id && !job.company_id;
    if (isOffPlatform) {
      const { data: member } = await this.supabase
        .from('firm_members')
        .select('id')
        .eq('firm_id', job.source_firm_id)
        .eq('recruiter_id', context.recruiterId)
        .eq('status', 'active')
        .maybeSingle();
      if (!member) throw new ForbiddenError('No access to edit this off-platform job');
    } else {
      const { data: rel } = await this.supabase
        .from('recruiter_companies')
        .select('permissions')
        .eq('recruiter_id', context.recruiterId)
        .eq('company_id', job.company_id)
        .eq('status', 'active')
        .maybeSingle();
      if (!rel?.permissions?.can_edit_jobs) {
        throw new ForbiddenError('No permission to edit jobs for this company');
      }
    }
  }

  private async verifyCompanyEdit(context: any, job: any) {
    const { data: companies } = await this.supabase
      .from('companies')
      .select('id')
      .in('identity_organization_id', context.organizationIds);
    const ids = companies?.map((c: any) => c.id) || [];
    if (!ids.includes(job.company_id)) {
      throw new ForbiddenError('Cannot edit jobs outside your organization');
    }
  }
}
