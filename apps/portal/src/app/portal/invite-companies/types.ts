export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface CompanyInvitation {
    id: string;
    recruiter_id: string;
    invite_code: string;
    invite_link_token: string;
    invited_email?: string;
    company_name_hint?: string;
    personal_message?: string;
    status: InvitationStatus;
    expires_at: string;
    accepted_at?: string;
    email_sent_at?: string;
    created_at: string;
    invite_url?: string;
    recruiter?: {
        id: string;
        user: {
            name: string;
            email: string;
        };
    };
}

export interface InvitationFilters {
    status?: string;
}
