// ===== Team Types =====

export type TeamStatus = "active" | "suspended";
export type MemberRole = "owner" | "admin" | "member" | "collaborator";
export type MemberStatus = "active" | "invited" | "removed";

export interface Team {
    id: string;
    name: string;
    owner_user_id: string;
    billing_organization_id: string | null;
    status: TeamStatus;
    member_count: number;
    active_member_count: number;
    total_placements: number;
    total_revenue: number;
    created_at: string;
}

export interface TeamMember {
    id: string;
    team_id: string;
    recruiter_id: string;
    role: MemberRole;
    joined_at: string;
    status: MemberStatus;
    recruiter: {
        id: string;
        user_id: string;
        name: string;
        email: string;
    };
}

export interface SplitConfiguration {
    id: string;
    team_id: string;
    model: "flat_split" | "tiered_split" | "individual_credit" | "hybrid";
    config: any;
    is_default: boolean;
    created_at: string;
}

export interface TeamFilters {
    status?: string;
}

// ===== Formatting Helpers =====

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export const ROLE_LABELS: Record<string, string> = {
    owner: "Owner",
    admin: "Admin",
    member: "Member",
    collaborator: "Collaborator",
};

export const STATUS_LABELS: Record<string, string> = {
    active: "Active",
    suspended: "Suspended",
    invited: "Invited",
    removed: "Removed",
};

export function formatMemberRole(role: string): string {
    return ROLE_LABELS[role] || role;
}

export function formatMemberStatus(status: string): string {
    return STATUS_LABELS[status] || status;
}
