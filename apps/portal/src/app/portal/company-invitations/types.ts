export type ConnectionStatus = "pending" | "active" | "declined" | "terminated";

export interface RecruiterCompanyRelationship {
    id: string;
    recruiter_id: string;
    company_id: string;
    relationship_type: "sourcer" | "recruiter";
    status: ConnectionStatus;
    can_manage_company_jobs: boolean;
    relationship_start_date?: string;
    relationship_end_date?: string;
    termination_reason?: string;
    invited_by?: string;
    created_at: string;
    updated_at: string;
    recruiter?: {
        id: string;
        user_id: string;
        user?: { name: string; email: string };
    };
    company?: {
        id: string;
        name: string;
        industry?: string;
        headquarters_location?: string;
        logo_url?: string;
    };
}

export interface ConnectionFilters {
    status?: string;
}

export function getStatusBadgeClass(status: string): string {
    switch (status) {
        case "active":
            return "badge-success";
        case "declined":
            return "badge-error";
        case "terminated":
            return "badge-neutral";
        case "pending":
            return "badge-info";
        default:
            return "";
    }
}

export function getStatusLabel(status: string): string {
    switch (status) {
        case "active":
            return "Active";
        case "declined":
            return "Declined";
        case "terminated":
            return "Terminated";
        case "pending":
            return "Pending";
        default:
            return status;
    }
}

export function getStatusIcon(status: string): string {
    switch (status) {
        case "active":
            return "fa-check-circle";
        case "declined":
            return "fa-times-circle";
        case "terminated":
            return "fa-ban";
        case "pending":
            return "fa-clock";
        default:
            return "fa-circle";
    }
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatDateShort(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

/**
 * Get the counterparty name for display.
 * Company users see recruiter info; recruiters see company info.
 */
export function getCounterpartyName(
    invitation: RecruiterCompanyRelationship,
    isCompanyUser: boolean,
): string {
    if (isCompanyUser) {
        return invitation.recruiter?.user?.name || "Unknown Recruiter";
    }
    return invitation.company?.name || "Unknown Company";
}

/**
 * Get the counterparty subtext for display.
 * Company users see recruiter email; recruiters see company industry/location.
 */
export function getCounterpartySubtext(
    invitation: RecruiterCompanyRelationship,
    isCompanyUser: boolean,
): string {
    if (isCompanyUser) {
        return invitation.recruiter?.user?.email || "";
    }
    return [invitation.company?.industry, invitation.company?.headquarters_location]
        .filter(Boolean)
        .join(" \u00b7 ");
}

/**
 * Get initials for avatar display.
 */
export function getInitials(name: string): string {
    const parts = name.split(" ");
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}
