/**
 * Payout Audit V3 Service
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { PayoutAuditRepository } from './repository';
import { AuditListParams } from './types';

export class PayoutAuditService {
  private accessResolver: AccessContextResolver;
  constructor(private repository: PayoutAuditRepository, private supabase: SupabaseClient) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async list(params: AuditListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    const { data, total } = await this.repository.list(params);
    const p = params.page || 1, l = params.limit || 25;
    return { data, pagination: { total, page: p, limit: l, total_pages: Math.ceil(total / l) } };
  }

  async getByPlacementId(placementId: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    return this.repository.getByPlacementId(placementId);
  }
}
