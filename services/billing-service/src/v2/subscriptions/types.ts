/**
 * Subscription Domain Types
 */

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface Subscription {
    id: string;
    user_id: string;
    plan_id: string;
    stripe_subscription_id: string | null;
    status: SubscriptionStatus;
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
    status?: SubscriptionStatus;
}

export interface SubscriptionListFilters extends SubscriptionFilters {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export type SubscriptionCreateInput = Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
export type SubscriptionUpdateInput = Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>;
