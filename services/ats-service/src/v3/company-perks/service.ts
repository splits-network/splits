/**
 * Company Perks V3 Service — Business Logic
 *
 * Company member or admin can manage company perks.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { CompanyPerkRepository } from './repository';
import { CreateCompanyPerkInput } from './types';

export class CompanyPerkService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CompanyPerkRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async listByCompanyId(companyId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    return this.repository.findByCompanyId(companyId);
  }

  async create(input: CreateCompanyPerkInput, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    return this.repository.create({
      company_id: input.company_id,
      perk_id: input.perk_id,
    });
  }

  async delete(companyId: string, perkId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    await this.repository.delete(companyId, perkId);
  }

  async bulkReplace(
    companyId: string,
    perks: Array<{ perk_id: string }>,
    clerkUserId: string
  ) {
    await this.assertAccess(clerkUserId);
    return this.repository.bulkReplace(companyId, perks);
  }

  private async assertAccess(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && context.organizationIds.length === 0 && !context.recruiterId) {
      throw new ForbiddenError('Insufficient permissions');
    }
  }
}
