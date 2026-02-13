// ===== TYPES =====

export interface JobRequirement {
    id: string;
    requirement_type: "mandatory" | "preferred";
    description: string;
    sort_order: number;
}

export interface Job {
    id: string;
    title: string;
    description?: string | null;
    candidate_description?: string | null;
    location?: string | null;
    employment_type?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    department?: string | null;
    open_to_relocation?: boolean;
    commute_types?: string[] | null;
    job_level?: string | null;
    show_salary_range?: boolean;
    guarantee_days?: number | null;
    status?: string;
    updated_at?: string;
    created_at?: string | Date;
    // Denormalized company fields (fallbacks when company relation not loaded)
    company_name?: string | null;
    company_industry?: string | null;
    company_headquarters_location?: string | null;
    // Relation
    company?: {
        id: string;
        name: string;
        logo_url?: string | null;
        headquarters_location?: string | null;
        industry?: string | null;
        description?: string | null;
    };
    requirements?: JobRequirement[];
}

export interface JobFilters {
    employment_type?: string;
}

// ===== CONSTANTS =====

export const EMPLOYMENT_TYPES = [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "temporary", label: "Temporary" },
] as const;

// ===== HELPERS =====

export function formatEmploymentType(type?: string | null): string {
    if (!type) return "Not specified";
    return type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

export function getJobFreshnessBadge(
    postedAt?: string | Date,
    createdAt?: string | Date,
): { label: string; color: string; icon: string } | null {
    const date = postedAt || createdAt;
    if (!date) return null;

    const dateObj = typeof date === "string" ? new Date(date) : date;
    const daysOld = Math.floor(
        (Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysOld <= 3) {
        return { label: "New", color: "badge-success", icon: "fa-sparkles" };
    } else if (daysOld <= 7) {
        return { label: "Recent", color: "badge-secondary", icon: "fa-clock" };
    }
    return null;
}

export function getCompanyInitials(companyName?: string): string {
    const name = companyName || "Company";
    const words = name.split(" ");
    const firstInitial = words[0]?.[0]?.toUpperCase() || "";
    const lastInitial = words[words.length - 1]?.[0]?.toUpperCase() || "";
    return words.length > 1 ? firstInitial + lastInitial : firstInitial;
}

export function getTruncatedDescription(
    job: Job,
    maxLength: number = 150,
): string {
    const desc = job.candidate_description || job.description;
    if (!desc) return "No description provided";
    return desc.length > maxLength ? desc.substring(0, maxLength) + "..." : desc;
}

export function getStatusBadgeColor(status?: string): string {
    switch (status) {
        case "active":
            return "badge-success";
        case "paused":
            return "badge-warning";
        case "filled":
            return "badge-info";
        case "closed":
            return "badge-error";
        default:
            return "badge-neutral";
    }
}

export function formatStatus(status?: string): string {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

// Resolve company name from relation or denormalized field
export function getCompanyName(job: Job): string {
    return job.company?.name || job.company_name || "Company";
}

// Resolve company industry from relation or denormalized field
export function getCompanyIndustry(job: Job): string | null {
    return job.company?.industry || job.company_industry || null;
}

// Resolve company HQ from relation or denormalized field
export function getCompanyHQ(job: Job): string | null {
    return (
        job.company?.headquarters_location ||
        job.company_headquarters_location ||
        null
    );
}

// Check if salary should be visible to candidates
export function shouldShowSalary(job: Job): boolean {
    if (job.show_salary_range === false) return false;
    return !!(job.salary_min || job.salary_max);
}
