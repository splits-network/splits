/**
 * Subscription Domain Types
 */

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';

export type BillingPeriod = 'monthly' | 'annual';

export interface Subscription {
    id: string;
    user_id: string;
    recruiter_id: string | null;
    plan_id: string;
    stripe_subscription_id: string | null;
    stripe_customer_id: string | null;
    status: SubscriptionStatus;
    billing_period: BillingPeriod;
    current_period_start: string;
    current_period_end: string | null;
    trial_start: string | null;
    trial_end: string | null;
    cancel_at: string | null;
    canceled_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Plan Change Request - For upgrading/downgrading subscription
 */
export interface ChangePlanRequest {
    plan_id: string;
    billing_period: BillingPeriod;
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
    recruiter_id?: string | null;
    promotion_code?: string;
};
export type SubscriptionUpdateInput = Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>;

/**
 * Setup Intent Types - For collecting payment method before subscription
 */
export interface SetupIntentRequest {
    plan_id: string;
    promotion_code?: string; // Optional Stripe promotion code
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
    billing_period?: BillingPeriod;
    promotion_code?: string; // Optional Stripe promotion code
}

export interface ActivateSubscriptionResponse {
    subscription_id: string;
    status: SubscriptionStatus;
    /** @deprecated No trials supported - always null */
    trial_end: string | null;
    current_period_end: string | null;
}

/**
 * Payment Method Types - For managing payment methods via Stripe API
 * Note: We NEVER store payment data in our database - all fetched from Stripe in real-time
 */
export interface PaymentMethodDetails {
    id: string;
    brand: string; // 'visa', 'mastercard', 'amex', etc.
    last4: string;
    exp_month: number;
    exp_year: number;
}

export interface PaymentMethodResponse {
    has_payment_method: boolean;
    default_payment_method: PaymentMethodDetails | null;
}

export interface UpdatePaymentMethodRequest {
    payment_method_id: string;
}

export interface UpdatePaymentMethodResponse {
    success: boolean;
    payment_method: PaymentMethodDetails;
}

/**
 * Invoice Types - For fetching billing history from Stripe API
 */
export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible' | 'draft';

export interface Invoice {
    id: string;
    number: string | null;
    amount_due: number;
    amount_paid: number;
    currency: string;
    status: InvoiceStatus;
    created: string;
    invoice_pdf: string | null;
    period_start: string;
    period_end: string;
}

export interface InvoicesResponse {
    invoices: Invoice[];
    has_more: boolean;
}
