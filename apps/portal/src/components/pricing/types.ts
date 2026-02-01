/**
 * Pricing Component Types
 * Shared types for pricing cards and plan selection
 * 
 * Note: These types align with the billing service V2 Plan interface
 */

export type PlanTier = 'starter' | 'pro' | 'partner';
export type BillingInterval = 'monthly' | 'annual';

/**
 * Legacy PlanFeatures - Used for fallback when features is not structured
 */
export interface PlanFeatures {
    headline: string;
    subheadline: string;
    included: string[];
    not_included: string[];
    cta: string;
    footnote: string;
    is_popular?: boolean;
    annual_price_cents?: number;
    annual_savings_text?: string;
}

/**
 * Plan interface - Aligned with billing service V2 Plan type
 */
export interface Plan {
    id: string;
    name: string;
    slug: string;
    tier: PlanTier;
    description: string | null;
    price_monthly: number;
    price_annual: number;
    currency: string;
    billing_interval: BillingInterval;
    /** Features can be structured (PlanFeatures) or generic (Record<string, any>) */
    features: PlanFeatures | Record<string, any>;
    trial_days: number;
    stripe_price_id?: string | null;
    stripe_price_id_monthly?: string | null;
    stripe_price_id_annual?: string | null;
    stripe_product_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PricingCardProps {
    plan: Plan;
    isSelected?: boolean;
    onSelect?: (plan: Plan) => void;
    isAnnual?: boolean;
    variant?: 'default' | 'compact';
    disabled?: boolean;
}

export interface PricingCardGridProps {
    plans: Plan[];
    selectedPlanId?: string | null;
    onSelectPlan?: (plan: Plan) => void;
    isAnnual?: boolean;
    variant?: 'default' | 'compact';
    loading?: boolean;
}
