/**
 * Plan Domain Types
 */

export type BillingInterval = 'monthly' | 'annual';
export type PlanStatus = 'active' | 'archived';

export interface Plan {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price_cents: number;
    currency: string;
    billing_interval: BillingInterval;
    features: Record<string, any>;
    status: PlanStatus;
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
