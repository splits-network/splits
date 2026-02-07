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

export function getStatusBadgeClass(status: string): string {
    switch (status) {
        case "pending":
            return "badge-warning";
        case "accepted":
            return "badge-success";
        case "expired":
            return "badge-ghost";
        case "revoked":
            return "badge-error";
        default:
            return "";
    }
}

export function formatInvitationDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function getDaysUntilExpiry(expiresAt: string): number {
    const expiresDate = new Date(expiresAt);
    const now = new Date();
    return Math.ceil(
        (expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
}

export function getInviteLink(invitation: CompanyInvitation): string {
    return (
        invitation.invite_url ||
        `${typeof window !== "undefined" ? window.location.origin : ""}/join/${invitation.invite_link_token}`
    );
}
