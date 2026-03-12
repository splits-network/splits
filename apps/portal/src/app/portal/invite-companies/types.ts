import type { BaselSortOption } from "@splits-network/basel-ui";

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

export const INVITE_STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    accepted: "Accepted",
    expired: "Expired",
    revoked: "Revoked",
};

export const INVITE_COMPANY_SORT_OPTIONS: BaselSortOption[] = [
    { value: "created_at", label: "Date Created" },
    { value: "status", label: "Status" },
];
