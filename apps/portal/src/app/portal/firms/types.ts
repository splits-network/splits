// ===== Firm Types =====

export type FirmStatus = "active" | "suspended";
export type MemberRole = "owner" | "admin" | "member" | "collaborator";
export type MemberStatus = "active" | "invited" | "removed";

export type TeamSizeRange = 'solo' | '2_5' | '6_15' | '16_50' | '50_plus';
export type PlacementType = 'permanent' | 'contract' | 'contract_to_hire' | 'executive_search';

export interface Firm {
    id: string;
    name: string;
    owner_user_id: string;
    billing_organization_id: string | null;
    status: FirmStatus;
    member_count: number;
    active_member_count: number;
    total_placements: number;
    total_revenue: number;
    admin_take_rate: number;
    // Profile / branding
    slug: string | null;
    tagline: string | null;
    description: string | null;
    logo_url: string | null;
    logo_path: string | null;
    banner_url: string | null;
    banner_path: string | null;
    // Specialization
    industries: string[];
    specialties: string[];
    placement_types: PlacementType[];
    geo_focus: string[];
    // Location
    headquarters_city: string | null;
    headquarters_state: string | null;
    headquarters_country: string | null;
    founded_year: number | null;
    team_size_range: TeamSizeRange | null;
    // Contact
    website_url: string | null;
    linkedin_url: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    // Marketplace toggles
    marketplace_visible: boolean;
    marketplace_approved_at: string | null;
    candidate_firm: boolean;
    company_firm: boolean;
    // Visibility controls
    show_member_count: boolean;
    show_placement_stats: boolean;
    show_contact_info: boolean;
    created_at: string;
}

export interface FirmMember {
    id: string;
    firm_id: string;
    recruiter_id: string;
    role: MemberRole;
    joined_at: string;
    status: MemberStatus;
    recruiter: {
        id: string;
        user_id: string;
        status: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    };
}

export type InvitationStatus = "pending" | "accepted" | "declined" | "cancelled";

export interface FirmInvitation {
    id: string;
    email: string;
    role: MemberRole;
    status: InvitationStatus;
    token: string;
    invited_by: string;
    expires_at: string;
    created_at: string;
}

export interface SplitConfiguration {
    id: string;
    firm_id: string;
    model: "flat_split" | "tiered_split" | "individual_credit" | "hybrid";
    config: any;
    is_default: boolean;
    created_at: string;
}

export interface FirmFilters {
    status?: string;
}

// ===== Formatting Helpers =====

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
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

export const TEAM_SIZE_LABELS: Record<TeamSizeRange, string> = {
    solo: 'Solo',
    '2_5': '2–5',
    '6_15': '6–15',
    '16_50': '16–50',
    '50_plus': '50+',
};

export const PLACEMENT_TYPE_LABELS: Record<PlacementType, string> = {
    permanent: 'Permanent',
    contract: 'Contract',
    contract_to_hire: 'Contract-to-Hire',
    executive_search: 'Executive Search',
};
