export type ConnectionStatus = "pending" | "active" | "declined" | "terminated";

export interface RecruiterCompanyRelationship {
    id: string;
    recruiter_id: string;
    company_id: string;
    relationship_type: "sourcer" | "recruiter";
    status: ConnectionStatus;
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
    relationship_type?: string;
}

export const RELATIONSHIP_TYPE_LABELS: Record<string, string> = {
    sourcer: "Sourcer",
    recruiter: "Recruiter",
};

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

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
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

import type { BaselSortOption } from "@splits-network/basel-ui";

export const CONNECTION_STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    active: "Active",
    declined: "Declined",
    terminated: "Terminated",
};

export const CONNECTION_SORT_OPTIONS: BaselSortOption[] = [
    { value: "created_at", label: "Date Created" },
    { value: "status", label: "Status" },
];
