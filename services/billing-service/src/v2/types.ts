/**
 * V2 Shared Types - Billing Service
 * Type definitions for plans, subscriptions, and payouts
 */

// ============================================
// PLANS
// ============================================

export interface Plan {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price_cents: number;
    currency: string;
    billing_interval: 'monthly' | 'annual';
    features: Record<string, any>;
    status: 'active' | 'archived';
    created_at: string;
    updated_at: string;
}

export interface PlanFilters {
    search?: string;
    status?: string;
    billing_interval?: string;
}

export type PlanUpdate = Partial<Omit<Plan, 'id' | 'created_at' | 'updated_at'>>;

// ============================================
// SUBSCRIPTIONS
// ============================================

export interface Subscription {
    id: string;
    user_id: string;
    plan_id: string;
    stripe_subscription_id: string | null;
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    current_period_start: string;
    current_period_end: string;
    cancel_at: string | null;
    canceled_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface SubscriptionFilters {
    user_id?: string;
    plan_id?: string;
    status?: string;
}

export type SubscriptionUpdate = Partial<
    Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
>;

// ============================================
// PAYOUTS
// ============================================

export interface Payout {
    id: string;
    recruiter_id: string;
    amount_cents: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    stripe_payout_id: string | null;
    period_start: string;
    period_end: string;
    created_at: string;
    updated_at: string;
}

export interface PayoutFilters {
    recruiter_id?: string;
    status?: string;
}

export type PayoutUpdate = Partial<Omit<Payout, 'id' | 'created_at' | 'updated_at'>>;

// ============================================
// PAGINATION
// ============================================

export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}
