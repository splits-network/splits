/**
 * Admin V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { AdminRepository } from './repository.js';
import { AdminListParams } from './types.js';

export class AdminService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: AdminRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async listRecruiters(params: AdminListParams, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    return this.repository.listRecruiters(params);
  }

  async updateRecruiterStatus(id: string, status: string, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    return this.repository.updateRecruiterStatus(id, status);
  }

  async listRecruiterCompanies(params: AdminListParams, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    return this.repository.listRecruiterCompanies(params);
  }

  async listFirms(params: AdminListParams, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    return this.repository.listFirms(params);
  }

  async updateFirmMarketplaceApproval(firmId: string, approved: boolean, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    return this.repository.updateFirmMarketplaceApproval(firmId, approved);
  }

  async getCounts(clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    return this.repository.getCounts();
  }

  async getStats(period: string, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    return this.repository.getStats(period);
  }

  private async requireAdmin(clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.isPlatformAdmin) throw new ForbiddenError('Platform admin access required');
  }
}
