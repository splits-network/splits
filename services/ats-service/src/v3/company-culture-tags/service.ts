/**
 * Company Culture Tags V3 Service — Business Logic
 *
 * Company member or admin can manage company culture tags.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { CompanyCultureTagRepository } from './repository.js';
import { CreateCompanyCultureTagInput } from './types.js';

export class CompanyCultureTagService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CompanyCultureTagRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async listByCompanyId(companyId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    return this.repository.findByCompanyId(companyId);
  }

  async create(input: CreateCompanyCultureTagInput, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    return this.repository.create({
      company_id: input.company_id,
      culture_tag_id: input.culture_tag_id,
    });
  }

  async delete(companyId: string, cultureTagId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    await this.repository.delete(companyId, cultureTagId);
  }

  async bulkReplace(
    companyId: string,
    cultureTags: Array<{ culture_tag_id: string }>,
    clerkUserId: string
  ) {
    await this.assertAccess(clerkUserId);
    return this.repository.bulkReplace(companyId, cultureTags);
  }

  private async assertAccess(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && context.organizationIds.length === 0 && !context.recruiterId) {
      throw new ForbiddenError('Insufficient permissions');
    }
  }
}
