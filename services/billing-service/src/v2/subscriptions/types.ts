/**
 * Subscription Domain Types
 */

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';

export interface Subscription {
    id: string;
    user_id: string;
    plan_id: string;
    stripe_subscription_id: string | null;
    stripe_customer_id: string | null;
    status: SubscriptionStatus;
    current_period_start: string;
    current_period_end: string | null;
    trial_start: string | null;
    trial_end: string | null;
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

export type SubscriptionCreateInput = Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>> & {
    user_id: string;
    plan_id: string;
};
export type SubscriptionUpdateInput = Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>;

/**
 * Setup Intent Types - For collecting payment method before subscription
 */
export interface SetupIntentRequest {
    plan_id: string;
}

export interface SetupIntentResponse {
    client_secret: string;
    customer_id: string;
    plan_id: string;
}

/**
 * Activate Subscription Types - For creating subscription after payment method saved
 */
export interface ActivateSubscriptionRequest {
    plan_id: string;
    payment_method_id: string;
    customer_id: string;
    /** Billing period - monthly or annual. Defaults to monthly */
    billing_period?: 'monthly' | 'annual';
}

export interface ActivateSubscriptionResponse {
    subscription_id: string;
    status: SubscriptionStatus;
    /** @deprecated No trials supported - always null */
    trial_end: string | null;
    current_period_end: string | null;
}
