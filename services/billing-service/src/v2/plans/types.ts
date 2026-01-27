/**
 * Plan Domain Types
 */

export type BillingInterval = 'monthly' | 'annual';
export type PlanStatus = 'active' | 'archived';
export type PlanTier = 'starter' | 'pro' | 'partner';

export interface Plan {
    id: string;
    name: string;
    slug: string;
    tier: PlanTier;
    description: string | null;
    price_monthly: number;
    price_annual: number;
    price_cents?: number;
    currency: string;
    billing_interval: BillingInterval;
    features: Record<string, any>;
    status: PlanStatus;
    stripe_product_id: string | null;
    stripe_price_id_monthly: string | null;
    stripe_price_id_annual: string | null;
    /** @deprecated Use stripe_price_id_monthly instead */
    stripe_price_id?: string | null;
    /** Trial days - currently always 0 (trials not supported) */
    trial_days: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PlanFilters {
    search?: string;
    status?: PlanStatus;
    billing_interval?: BillingInterval;
}

export interface PlanListFilters extends PlanFilters {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export type PlanCreateInput = Omit<Plan, 'id' | 'created_at' | 'updated_at'>;
export type PlanUpdateInput = Partial<Omit<Plan, 'id' | 'created_at' | 'updated_at'>>;
