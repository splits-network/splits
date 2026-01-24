// Billing page types

export interface Plan {
    id: string;
    name: string;
    slug: 'free' | 'pro' | 'partner';
    price_monthly: string;
    price_cents: number;
    features: PlanFeatures;
    stripe_product_id?: string;
    stripe_price_id?: string;
    is_active: boolean;
}

export interface PlanFeatures {
    applications_per_month: number;
    candidate_submissions?: boolean;
    basic_analytics?: boolean;
    advanced_analytics?: boolean;
    ai_matching?: boolean;
    priority_support?: boolean;
    api_access?: boolean;
    white_label?: boolean;
    job_access?: 'limited' | 'full' | 'priority';
    commission_rate?: number;
    support?: 'community' | 'email' | 'priority';
}

export interface Subscription {
    id: string | null;
    user_id: string;
    plan_id: string;
    stripe_subscription_id?: string;
    stripe_customer_id?: string;
    status: SubscriptionStatus;
    current_period_start?: string;
    current_period_end?: string;
    cancel_at?: string;
    canceled_at?: string;
    plan?: Plan;
    is_virtual?: boolean;
}

export type SubscriptionStatus = 
    | 'active' 
    | 'trialing' 
    | 'past_due' 
    | 'canceled' 
    | 'incomplete' 
    | 'incomplete_expired'
    | 'unpaid';

export interface Payout {
    id: string;
    recruiter_id: string;
    placement_id?: string;
    amount: number;
    currency: string;
    status: PayoutStatus;
    stripe_transfer_id?: string;
    stripe_payout_id?: string;
    scheduled_at?: string;
    completed_at?: string;
    created_at: string;
    placement?: {
        id: string;
        candidate_name?: string;
        job_title?: string;
        company_name?: string;
    };
}

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'on_hold';

export interface BillingStats {
    total_earnings_ytd: number;
    total_earnings_all_time: number;
    pending_payouts: number;
    completed_payouts_count: number;
    placements_this_year: number;
    placements_this_month: number;
    current_commission_rate: number;
}

// Commission rates by tier (from AGENTS.md)
export const COMMISSION_RATES = {
    free: {
        candidate_recruiter: 20,
        job_owner: 10,
        company_recruiter: 10,
        sourcer: 6,
    },
    pro: {
        candidate_recruiter: 30,
        job_owner: 15,
        company_recruiter: 15,
        sourcer: 8,
    },
    partner: {
        candidate_recruiter: 40,
        job_owner: 20,
        company_recruiter: 20,
        sourcer: 10,
    },
} as const;

// Plan display configuration
export const PLAN_DISPLAY_CONFIG = {
    free: {
        color: 'neutral',
        icon: 'fa-seedling',
        description: 'Get started with recruiting',
        tagline: 'Perfect for new recruiters',
        badge: null,
    },
    pro: {
        color: 'primary',
        icon: 'fa-rocket',
        description: 'For active recruiters',
        tagline: 'Most popular choice',
        badge: 'Popular',
    },
    partner: {
        color: 'secondary',
        icon: 'fa-crown',
        description: 'Maximum earnings potential',
        tagline: 'For high-volume recruiters',
        badge: 'Best Value',
    },
} as const;

export type PlanSlug = keyof typeof PLAN_DISPLAY_CONFIG;

// Feature display mapping
export const FEATURE_LABELS: Record<string, string> = {
    applications_per_month: 'Applications per month',
    candidate_submissions: 'Candidate submissions',
    basic_analytics: 'Basic analytics',
    advanced_analytics: 'Advanced analytics',
    ai_matching: 'AI-powered matching',
    priority_support: 'Priority support',
    api_access: 'API access',
    white_label: 'White-label solution',
    job_access: 'Job access level',
    commission_rate: 'Commission rate',
    support: 'Support level',
};
