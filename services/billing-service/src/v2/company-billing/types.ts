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
