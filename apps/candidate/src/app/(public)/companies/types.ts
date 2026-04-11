export interface PublicCompany {
    id: string;
    name: string;
    slug: string;
    tagline?: string | null;
    description?: string | null;
    logo_url?: string | null;
    website?: string | null;
    industry?: string | null;
    company_size?: string | null;
    headquarters_location?: string | null;
    stage?: string | null;
    founded_year?: number | null;
    linkedin_url?: string | null;
    glassdoor_url?: string | null;
    twitter_url?: string | null;
    open_roles_count: number;
    created_at: string;
}

export interface PublicCompanyFilters {
    industry?: string;
    company_size?: string;
    stage?: string;
}

export interface PublicCompanyProfile {
    company: PublicCompany;
    perks: { id: string; name: string; category: string }[];
    culture_tags: { id: string; name: string; category: string }[];
    skills: { id: string; name: string }[];
    reputation: {
        reputation_score: number;
        reputation_tier: string;
        total_hires: number;
        total_placements: number;
        hire_rate: number;
        completion_rate: number;
    } | null;
}

export function companyInitials(name: string): string {
    const words = name.split(" ");
    const first = words[0]?.[0]?.toUpperCase() || "";
    const last =
        words.length > 1
            ? words[words.length - 1]?.[0]?.toUpperCase() || ""
            : "";
    return words.length > 1 ? first + last : first;
}

export function companyLocation(
    company: Pick<PublicCompany, "headquarters_location">,
): string | null {
    return company.headquarters_location || null;
}
