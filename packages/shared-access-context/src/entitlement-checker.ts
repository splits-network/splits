import { SupabaseClient } from '@supabase/supabase-js';
import {
    STARTER_ENTITLEMENTS,
    type PlanEntitlements,
    type BooleanEntitlement,
    type NumericEntitlement,
} from '@splits-network/shared-types';

/**
 * Lightweight entitlement checker for cross-service use.
 * Primary interface uses internal user.id (UUID).
 * Use `resolveByClerkId` / `hasEntitlementByClerkId` when you only have the Clerk ID.
 *
 * Usage:
 * ```typescript
 * const checker = new EntitlementChecker(supabase);
 * const allowed = await checker.hasEntitlement(userId, 'firm_creation');
 * ```
 */
export class EntitlementChecker {
    constructor(private supabase: SupabaseClient) {}

    /**
     * Resolve entitlements for an internal user ID (UUID).
     * Queries: subscriptions → plans.entitlements
     */
    async resolve(userId: string): Promise<PlanEntitlements> {
        const { data: subscription } = await this.supabase
            .from('subscriptions')
            .select('plan:plans(entitlements)')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        const entitlements = (subscription as any)?.plan?.entitlements;
        if (!entitlements) return STARTER_ENTITLEMENTS;

        return { ...STARTER_ENTITLEMENTS, ...entitlements };
    }

    /**
     * Resolve entitlements from a Clerk user ID.
     * Convenience wrapper that looks up user.id first.
     */
    async resolveByClerkId(clerkUserId: string): Promise<PlanEntitlements> {
        const { data: user } = await this.supabase
            .from('users')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .maybeSingle();

        if (!user) return STARTER_ENTITLEMENTS;
        return this.resolve(user.id);
    }

    /** Check if a boolean entitlement is enabled (by internal user ID) */
    async hasEntitlement(userId: string, key: BooleanEntitlement): Promise<boolean> {
        const entitlements = await this.resolve(userId);
        return Boolean(entitlements[key]);
    }

    /** Check if a boolean entitlement is enabled (by Clerk user ID) */
    async hasEntitlementByClerkId(clerkUserId: string, key: BooleanEntitlement): Promise<boolean> {
        const entitlements = await this.resolveByClerkId(clerkUserId);
        return Boolean(entitlements[key]);
    }

    /** Check if current usage is within the numeric limit (-1 = unlimited) */
    async checkLimit(
        userId: string,
        key: NumericEntitlement,
        currentCount: number,
    ): Promise<boolean> {
        const entitlements = await this.resolve(userId);
        const limit = entitlements[key] as number;
        return limit === -1 || currentCount < limit;
    }
}
