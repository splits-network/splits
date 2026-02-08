export interface StripeConnectAccountStatus {
    account_id: string;
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
    requirements?: Record<string, any> | null;
    onboarded: boolean;
    recruiter_id: string;
}

export interface StripeConnectLinkRequest {
    return_url: string;
    refresh_url: string;
}

export interface StripeConnectLinkResponse {
    url: string;
}

export interface StripeAccountSessionResponse {
    client_secret: string;
}

export interface StripeDashboardLinkResponse {
    url: string;
}
