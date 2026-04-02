/**
 * Entitlements V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { STARTER_ENTITLEMENTS } from '@splits-network/shared-types';
import type { BooleanEntitlement, NumericEntitlement } from '@splits-network/shared-types';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { EntitlementRepository } from './repository.js';
import type { ResolvedEntitlements } from './types.js';

export class EntitlementService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: EntitlementRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getMyEntitlements(clerkUserId: string): Promise<ResolvedEntitlements> {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (!context.identityUserId) {
      return { tier: 'starter', entitlements: STARTER_ENTITLEMENTS, subscription_active: false };
    }

    return this.repository.findByUserId(context.identityUserId);
  }

  async requireEntitlement(clerkUserId: string, entitlement: BooleanEntitlement): Promise<void> {
    const resolved = await this.getMyEntitlements(clerkUserId);
    if (!resolved.entitlements[entitlement]) {
      throw new ForbiddenError(`Feature '${entitlement}' requires a plan upgrade`);
    }
  }

  async checkLimit(
    clerkUserId: string,
    entitlement: NumericEntitlement,
    currentCount: number
  ): Promise<{ allowed: boolean; limit: number; current: number }> {
    const resolved = await this.getMyEntitlements(clerkUserId);
    const limit = resolved.entitlements[entitlement] as number;
    const allowed = limit === -1 || currentCount < limit;
    return { allowed, limit, current: currentCount };
  }
}
