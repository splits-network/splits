import type { PlanEntitlements } from '@splits-network/shared-types';

export type PlanTier = 'starter' | 'pro' | 'partner';

export interface ResolvedEntitlements {
    tier: PlanTier;
    entitlements: PlanEntitlements;
    subscription_active: boolean;
}
