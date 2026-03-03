import { formatRelativeTime } from "@/lib/utils";
import type { RecruiterWithUser } from "../../types";
import { getDisplayName } from "../../types";

export function recruiterName(recruiter: RecruiterWithUser): string {
    return getDisplayName(recruiter);
}

export function recruiterEmail(recruiter: RecruiterWithUser): string | null {
    return recruiter.users?.email || recruiter.email || null;
}

export function recruiterLocation(recruiter: RecruiterWithUser): string | null {
    return recruiter.location || null;
}

export function formatStatus(status?: string): string {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function joinedAgo(recruiter: RecruiterWithUser): string {
    if (!recruiter.created_at) return "";
    return formatRelativeTime(recruiter.created_at);
}

export function isNew(recruiter: RecruiterWithUser): boolean {
    if (!recruiter.created_at) return false;
    const d =
        typeof recruiter.created_at === "string"
            ? new Date(recruiter.created_at)
            : recruiter.created_at;
    return (Date.now() - d.getTime()) / 86400000 <= 14;
}

export function placementsDisplay(recruiter: RecruiterWithUser): string {
    return String(recruiter.total_placements ?? 0);
}

export function successRateDisplay(
    recruiter: RecruiterWithUser,
): string | null {
    if (recruiter.hire_rate == null) return null;
    return `${Math.round(recruiter.hire_rate)}%`;
}

export function reputationDisplay(
    recruiter: RecruiterWithUser,
): string | null {
    if (
        recruiter.reputation_score === undefined ||
        recruiter.reputation_score === null
    )
        return null;
    return String(Math.round(recruiter.reputation_score));
}

export function experienceDisplay(
    recruiter: RecruiterWithUser,
): string | null {
    if (!recruiter.years_experience) return null;
    return `${recruiter.years_experience}+ yrs`;
}

export function memberSinceDisplay(recruiter: RecruiterWithUser): string | null {
    if (!recruiter.created_at) return null;
    const d = new Date(recruiter.created_at);
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
}
