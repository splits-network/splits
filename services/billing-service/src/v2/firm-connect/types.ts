export interface FirmStripeAccount {
    id: string;
    firm_id: string;
    stripe_connect_account_id: string | null;
    stripe_connect_onboarded: boolean;
    onboarded_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface FirmConnectAccountStatus {
    account_id: string;
    firm_id: string;
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
    requirements: any;
    onboarded: boolean;
    bank_account: {
        bank_name: string;
        last4: string;
        account_type: string;
    } | null;
    payout_schedule: {
        interval: string;
        weekly_anchor?: string;
        monthly_anchor?: number;
        delay_days?: number;
    } | null;
    pending_balance: number;
}

export interface FirmConnectLinkRequest {
    return_url: string;
    refresh_url: string;
}

export interface FirmConnectLinkResponse {
    url: string;
}

export interface UpdateFirmAccountDetailsRequest {
    company_name?: string;
    company_phone?: string;
    company_tax_id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    dob: { day: number; month: number; year: number };
    ssn_last_4?: string;
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postal_code: string;
        country?: string;
    };
}

export interface AddFirmBankAccountRequest {
    token: string; // btok_xxx from Stripe.js
}

export interface AcceptFirmTosResponse extends FirmConnectAccountStatus {
    needs_identity_verification: boolean;
}

export interface FirmVerificationSessionResponse {
    client_secret: string;
    session_id: string;
    status: string;
}

export interface FirmStripePayout {
    id: string;
    amount: number;
    currency: string;
    status: string;
    arrival_date: string;
    created: string;
}
