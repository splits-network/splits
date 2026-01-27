/**
 * Pricing Component Types
 * Shared types for pricing cards and plan selection
 */

export type PlanTier = 'starter' | 'pro' | 'partner';

export interface PlanFeatures {
    headline: string;
    subheadline: string;
    included: string[];
    not_included: string[];
    cta_text: string;
    footnote: string;
    is_popular?: boolean;
    annual_price_cents?: number;
    annual_savings_text?: string;
}

export interface Plan {
    id: string;
    name: string;
    slug: string;
    tier: PlanTier;
    price_cents: number;
    price_monthly: number;
    interval: 'month' | 'year';
    trial_days: number;
    features: PlanFeatures;
    stripe_price_id: string | null;
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
