export interface StripeConnectAccountStatus {
    account_id: string;
    account_type: 'express' | 'custom';
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
    requirements?: Record<string, any> | null;
    onboarded: boolean;
    recruiter_id: string;
    bank_account?: {
        bank_name: string;
        last4: string;
        account_type: string;
    } | null;
    payout_schedule?: {
        interval: string;
        weekly_anchor?: string;
        monthly_anchor?: number;
        delay_days?: number;
    } | null;
    pending_balance?: number;
    individual?: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        dob?: { day?: number; month?: number; year?: number };
        address?: {
            line1?: string;
            city?: string;
            state?: string;
            postal_code?: string;
        };
        ssn_last_4_provided?: boolean;
    } | null;
}

export interface StripePayout {
    id: string;
    amount: number;
    currency: string;
    status: string;
    arrival_date: string;
    created: string;
}

export interface StripeConnectLinkRequest {
    return_url: string;
    refresh_url: string;
}

export interface StripeConnectLinkResponse {
    url: string;
}

export interface UpdateAccountDetailsRequest {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: { day: number; month: number; year: number };
    ssn_last_4: string;
    address: {
        line1: string;
        city: string;
        state: string;
        postal_code: string;
    };
}

export interface AddBankAccountRequest {
    token: string; // Stripe.js bank_account token (btok_xxx)
}

export interface AcceptTosRequest {
    ip: string;
}

export interface AcceptTosResponse extends StripeConnectAccountStatus {
    needs_identity_verification: boolean;
}

export interface VerificationSessionResponse {
    client_secret: string;
    session_id: string;
    status: string;
}
