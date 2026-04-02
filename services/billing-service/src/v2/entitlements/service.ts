import { STARTER_ENTITLEMENTS } from '@splits-network/shared-types';
import type { BooleanEntitlement, NumericEntitlement } from '@splits-network/shared-types';
import type { AccessContext } from '../shared/access.js';
import { EntitlementRepository } from './repository.js';
import type { ResolvedEntitlements } from './types.js';

export class EntitlementService {
    constructor(
        private repository: EntitlementRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
    ) {}

    async getMyEntitlements(clerkUserId: string): Promise<ResolvedEntitlements> {
        const access = await this.resolveAccessContext(clerkUserId);

        if (!access.identityUserId) {
            return {
                tier: 'starter',
                entitlements: STARTER_ENTITLEMENTS,
                subscription_active: false,
            };
        }

        return this.repository.findByUserId(access.identityUserId);
    }

    async requireEntitlement(clerkUserId: string, entitlement: BooleanEntitlement): Promise<void> {
        const resolved = await this.getMyEntitlements(clerkUserId);

        if (!resolved.entitlements[entitlement]) {
            const error: any = new Error(`Feature '${entitlement}' requires a plan upgrade`);
            error.statusCode = 403;
            throw error;
        }
    }

    async checkLimit(
        clerkUserId: string,
        entitlement: NumericEntitlement,
        currentCount: number,
    ): Promise<{ allowed: boolean; limit: number; current: number }> {
        const resolved = await this.getMyEntitlements(clerkUserId);
        const limit = resolved.entitlements[entitlement] as number;
        const allowed = limit === -1 || currentCount < limit;

        return { allowed, limit, current: currentCount };
    }
}
