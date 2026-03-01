import { PaymentMethodDetails } from '../company-billing/types';

export { PaymentMethodDetails };

export type BillingTerms = 'immediate' | 'net_30' | 'net_60' | 'net_90';
export type InvoiceDeliveryMethod = 'email' | 'manual';

export interface FirmBillingProfile {
    id: string;
    firm_id: string;
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

export type FirmBillingProfileCreate = Omit<FirmBillingProfile, 'id' | 'created_at' | 'updated_at'>;
export type FirmBillingProfileUpdate = Partial<Omit<FirmBillingProfile, 'id' | 'created_at' | 'updated_at'>>;

export interface FirmBillingReadiness {
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
