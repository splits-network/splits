export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
export type CollectionMethod = 'charge_automatically' | 'send_invoice';

export interface PlacementInvoice {
    id: string;
    placement_id: string;
    company_id: string;
    billing_profile_id: string | null;
    stripe_customer_id: string | null;
    stripe_invoice_id: string | null;
    stripe_invoice_number: string | null;
    invoice_status: InvoiceStatus;
    amount_due: number;
    amount_paid: number;
    currency: string;
    collection_method: CollectionMethod;
    billing_terms: 'immediate' | 'net_30' | 'net_60' | 'net_90';
    due_date: string | null;
    collectible_at: string | null;
    funds_available: boolean; // NEW: Indicates Stripe has settled funds in our available balance
    funds_available_at: string | null; // NEW: When funds became available for transfer
    finalized_at: string | null;
    paid_at: string | null;
    voided_at: string | null;
    failure_reason: string | null;
    hosted_invoice_url: string | null;
    invoice_pdf_url: string | null;
    created_at: string;
    updated_at: string;
}

export type PlacementInvoiceCreate = Omit<PlacementInvoice, 'id' | 'created_at' | 'updated_at'>;
export type PlacementInvoiceUpdate = Partial<Omit<PlacementInvoice, 'id' | 'created_at' | 'updated_at'>>;
