export type BillingTerms = 'immediate' | 'net_30' | 'net_60' | 'net_90';
export type InvoiceDeliveryMethod = 'email' | 'none';

export interface CompanyBillingProfile {
    id: string;
    company_id: string;
    billing_terms: BillingTerms;
    billing_email: string;
    invoice_delivery_method: InvoiceDeliveryMethod;
    stripe_customer_id: string | null;
    stripe_default_payment_method_id: string | null;
    stripe_tax_id: string | null;
    billing_contact_name: string | null;
    billing_address: Record<string, any> | null;
    created_at: string;
    updated_at: string;
}

export type CompanyBillingProfileCreate = Omit<CompanyBillingProfile, 'id' | 'created_at' | 'updated_at'>;
export type CompanyBillingProfileUpdate = Partial<Omit<CompanyBillingProfile, 'id' | 'created_at' | 'updated_at'>>;

export interface PaymentMethodDetails {
    id: string;
    type: string;
    // Card fields
    brand?: string;
    last4?: string;
    exp_month?: number;
    exp_year?: number;
    // Bank account fields (ACH)
    bank_name?: string;
    account_type?: string;
    // Generic label for display
    display_label: string;
}

export interface CompanyBillingReadiness {
    status: 'not_started' | 'incomplete' | 'ready';
    has_billing_profile: boolean;
    has_billing_email: boolean;
    has_billing_terms: boolean;
    has_stripe_customer: boolean;
    has_payment_method: boolean;
    has_billing_contact: boolean;
    has_billing_address: boolean;
    requires_payment_method: boolean;
    billing_terms: BillingTerms | null;
}
