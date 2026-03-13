/**
 * Admin Billing V3 Service - Admin-only operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { AdminBillingRepository } from './repository';
import { AdminListParams } from './types';

export class AdminBillingService {
  private accessResolver: AccessContextResolver;
  constructor(private repository: AdminBillingRepository, private supabase: SupabaseClient) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  private async assertAdmin(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
  }

  async listPayouts(params: AdminListParams, clerkUserId: string) {
    await this.assertAdmin(clerkUserId);
    const { data, total } = await this.repository.listPayouts(params);
    const p = params.page || 1, l = params.limit || 25;
    return { data, pagination: { total, page: p, limit: l, total_pages: Math.ceil(total / l) } };
  }

  async listEscrowHolds(params: AdminListParams, clerkUserId: string) {
    await this.assertAdmin(clerkUserId);
    const { data, total } = await this.repository.listEscrowHolds(params);
    const p = params.page || 1, l = params.limit || 25;
    return { data, pagination: { total, page: p, limit: l, total_pages: Math.ceil(total / l) } };
  }

  async listBillingProfiles(params: AdminListParams, clerkUserId: string) {
    await this.assertAdmin(clerkUserId);
    const { data, total } = await this.repository.listBillingProfiles(params);
    const p = params.page || 1, l = params.limit || 25;
    return { data, pagination: { total, page: p, limit: l, total_pages: Math.ceil(total / l) } };
  }

  async releaseEscrowHold(id: string, clerkUserId: string) {
    await this.assertAdmin(clerkUserId);
    return this.repository.releaseEscrowHold(id);
  }

  async getCounts(clerkUserId: string) {
    await this.assertAdmin(clerkUserId);
    return this.repository.getCounts();
  }
}
