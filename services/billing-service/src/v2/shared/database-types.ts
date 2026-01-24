// Database types matching current schema
export interface Plan {
    id: string;
    name: string;
    slug: string;
    price_monthly: string; // Stored as decimal string
    stripe_product_id?: string | null;
    stripe_price_id?: string | null;
    features?: any;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Subscription {
    id: string;
    recruiter_id?: string | null;
    user_id?: string | null;
    plan_id?: string | null;
    stripe_subscription_id?: string | null;
    stripe_customer_id?: string | null;
    status?: string | null;
    current_period_start?: string | null;
    current_period_end?: string | null;
    cancel_at?: string | null;
    canceled_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}