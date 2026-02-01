/**
 * Discount Domain Types
 */

export interface DiscountValidationRequest {
    code: string;
    plan_id: string;
    billing_period: 'monthly' | 'annual';
}

export interface DiscountInfo {
    id: string;
    code: string;
    valid: boolean;
    discount_type: 'percentage' | 'amount';
    value: number;
    duration: 'once' | 'repeating' | 'forever';
    duration_in_months?: number;
    savings_amount?: number; // Calculated savings in cents
    savings_percentage?: number; // Calculated percentage
}

export interface DiscountValidationResponse {
    valid: boolean;
    discount?: DiscountInfo;
    error?: {
        code: string;
        message: string;
    };
}

export interface DiscountValidationError {
    code: 'invalid' | 'expired' | 'limit_reached' | 'not_found' | 'already_used';
    message: string;
}

export interface SubscriptionDiscount {
    id: string;
    subscription_id: string;
    stripe_promotion_code_id: string;
    stripe_discount_id: string | null;
    promotion_code: string;
    discount_type: 'percentage' | 'amount';
    discount_value: number;
    discount_duration: 'once' | 'repeating' | 'forever';
    discount_duration_in_months: number | null;
    applied_at: string;
    created_at: string;
    updated_at: string;
}

export interface ApplyDiscountRequest {
    subscription_id: string;
    promotion_code: string;
}