/**
 * Matches page types and helpers.
 * Imports the base EnrichedMatch type from shared-types and re-exports.
 */
import type {
    EnrichedMatch,
    MatchTier,
    MatchStatus,
    MatchFactors,
} from "@splits-network/shared-types";
import type { BaselSemanticColor, BaselSortOption } from "@splits-network/basel-ui";

export type { EnrichedMatch, MatchTier, MatchStatus, MatchFactors };

export type ViewMode = "table" | "grid" | "split";

export interface MatchFilters {
    match_tier?: MatchTier;
    status?: MatchStatus;
    min_score?: number;
    salary_overlap?: string;
    location_compatible?: string;
    employment_type_match?: string;
    job_level_match?: string;
    availability_compatible?: string;
    invite_status?: string;
}

export const MATCH_TIER_LABELS: Record<string, string> = {
    standard: "Standard",
    true: "True Score",
};

export const MATCH_STATUS_LABELS: Record<string, string> = {
    active: "Active",
    dismissed: "Dismissed",
    applied: "Applied",
};

export const MATCH_SCORE_LABELS: Record<string, string> = {
    "40": "40+ Worth Reviewing",
    "55": "55+ Promising",
    "70": "70+ Strong",
    "85": "85+ Excellent",
};

export const SALARY_OVERLAP_LABELS: Record<string, string> = {
    yes: "Salary Aligned",
    no: "Salary Mismatch",
};

export const LOCATION_COMPATIBLE_LABELS: Record<string, string> = {
    yes: "Location Compatible",
    no: "Location Mismatch",
};

export const EMPLOYMENT_TYPE_MATCH_LABELS: Record<string, string> = {
    yes: "Type Match",
    no: "Type Mismatch",
};

export const JOB_LEVEL_MATCH_LABELS: Record<string, string> = {
    yes: "Level Match",
    no: "Level Mismatch",
};

export const AVAILABILITY_COMPATIBLE_LABELS: Record<string, string> = {
    yes: "Available",
    no: "Unavailable",
};

export const INVITE_STATUS_LABELS: Record<string, string> = {
    sent: "Invited",
    denied: "Denied",
    applied: "Applied",
    not_invited: "Not Invited",
};

export const MATCH_SORT_OPTIONS: BaselSortOption[] = [
    { value: "overall_score", label: "Match Score" },
    { value: "created_at", label: "Date Created" },
    { value: "generated_at", label: "Generated Date" },
];

/* ── Display helpers ── */

export function candidateDisplayName(match: EnrichedMatch): string {
    if (!match.candidate) return "Unknown Candidate";
    return match.candidate.full_name || "Unknown Candidate";
}

export function candidateInitials(match: EnrichedMatch): string {
    const name = candidateDisplayName(match);
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function jobDisplayTitle(match: EnrichedMatch): string {
    return match.job?.title || "Unknown Job";
}

export function companyDisplayName(match: EnrichedMatch): string {
    return match.job?.companies?.name || "N/A";
}

export function isNewMatch(match: EnrichedMatch): boolean {
    if (!match.generated_at) return false;
    const genDate = new Date(match.generated_at);
    const daysSince = (Date.now() - genDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
}

export function formatMatchDate(date: string | null | undefined): string {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function timeAgoMatch(date: string | null | undefined): string {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 30) return `${days} days ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

/* ── Status color helper ── */

export function matchStatusBadgeColor(status?: string): BaselSemanticColor {
    switch (status) {
        case "active":
            return "success";
        case "dismissed":
            return "error";
        case "applied":
            return "info";
        default:
            return "neutral";
    }
}

export function formatMatchStatus(status?: string): string {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

/* ── Tier badge helper ── */

export function tierBadgeColor(tier: MatchTier): BaselSemanticColor {
    return tier === "true" ? "primary" : "neutral";
}

export function tierLabel(tier: MatchTier): string {
    switch (tier) {
        case "true":
            return "True Score";
        case "standard":
            return "Standard";
        default:
            return "Standard";
    }
}
