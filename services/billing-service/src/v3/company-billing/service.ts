/**
 * Company Billing V3 Service — Business logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { CompanyBillingRepository } from './repository';
import { CompanyBillingCreateInput, CompanyBillingUpdateInput } from './types';

export class CompanyBillingService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CompanyBillingRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async list(clerkUserId: string, page = 1, limit = 25) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && context.organizationIds.length === 0) {
      throw new ForbiddenError('Insufficient permissions');
    }
    const { data, total } = await this.repository.list(page, limit);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getByCompanyId(companyId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    return this.repository.findByCompanyId(companyId);
  }

  async upsert(companyId: string, input: CompanyBillingCreateInput, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    return this.repository.upsert(companyId, input);
  }

  async update(companyId: string, input: CompanyBillingUpdateInput, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    return this.repository.update(companyId, input);
  }

  private async assertAccess(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && context.organizationIds.length === 0) {
      throw new ForbiddenError('Insufficient permissions');
    }
  }
}
