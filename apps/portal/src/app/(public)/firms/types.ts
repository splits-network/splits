export interface PublicFirm {
    id: string;
    name: string;
    slug: string;
    tagline?: string | null;
    description?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
    industries: string[];
    specialties: string[];
    placement_types: string[];
    geo_focus: string[];
    headquarters_city?: string | null;
    headquarters_state?: string | null;
    headquarters_country?: string | null;
    founded_year?: number | null;
    team_size_range?: string | null;
    website_url?: string | null;
    linkedin_url?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    seeking_split_partners: boolean;
    accepts_candidate_submissions: boolean;
    show_member_count: boolean;
    show_placement_stats: boolean;
    show_contact_info: boolean;
    active_member_count?: number | null;
    created_at: string;
}

export interface FirmMember {
    id: string;
    role: string;
    joined_at: string;
    recruiter: {
        id: string;
        user: {
            name: string;
        };
    };
}

export interface PublicFirmFilters {
    seeking_split_partners?: boolean;
    accepts_candidate_submissions?: boolean;
    industry?: string;
}

export function firmLocation(firm: PublicFirm): string | null {
    const parts = [
        firm.headquarters_city,
        firm.headquarters_state,
        firm.headquarters_country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
}

export function firmInitials(name: string): string {
    const words = name.split(" ");
    const first = words[0]?.[0]?.toUpperCase() || "";
    const last = words.length > 1 ? words[words.length - 1]?.[0]?.toUpperCase() || "" : "";
    return words.length > 1 ? first + last : first;
}
