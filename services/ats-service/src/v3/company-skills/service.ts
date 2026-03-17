/**
 * Company Skills V3 Service — Business Logic
 *
 * Company member or admin can manage company skills.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { CompanySkillRepository } from './repository';
import { CreateCompanySkillInput } from './types';

export class CompanySkillService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CompanySkillRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async listByCompanyId(companyId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    return this.repository.findByCompanyId(companyId);
  }

  async create(input: CreateCompanySkillInput, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    return this.repository.create({
      company_id: input.company_id,
      skill_id: input.skill_id,
    });
  }

  async delete(companyId: string, skillId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    await this.repository.delete(companyId, skillId);
  }

  async bulkReplace(
    companyId: string,
    skills: Array<{ skill_id: string }>,
    clerkUserId: string
  ) {
    await this.assertAccess(clerkUserId);
    return this.repository.bulkReplace(companyId, skills);
  }

  private async assertAccess(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && context.organizationIds.length === 0 && !context.recruiterId) {
      throw new ForbiddenError('Insufficient permissions');
    }
  }
}
