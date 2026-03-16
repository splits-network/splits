import type { Firm } from "../../types";

export function formatStatus(status?: string): string {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function createdAgo(firm: Firm): string {
    const created = new Date(firm.created_at);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

export function firmInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

export function memberCountDisplay(firm: Firm): string {
    if (firm.member_count === firm.active_member_count) {
        return `${firm.active_member_count} member${firm.active_member_count !== 1 ? "s" : ""}`;
    }
    return `${firm.active_member_count} active (${firm.member_count} total)`;
}

const TEAM_SIZE_MAP: Record<string, string> = {
    solo: "Solo",
    "2_5": "2–5",
    "6_15": "6–15",
    "16_50": "16–50",
    "50_plus": "50+",
};

export function teamSizeDisplay(range: string | null): string {
    if (!range) return "Not set";
    return TEAM_SIZE_MAP[range] || range;
}

export function marketplaceSignals(firm: Firm): string[] {
    const signals: string[] = [];
    if (firm.marketplace_visible) signals.push("Listed");
    if (firm.candidate_firm) signals.push("Split Partners");
    if (firm.company_firm) signals.push("Candidate Submissions");
    return signals;
}

export function foundedYearDisplay(year: number | null): string | null {
    if (!year) return null;
    return `Est. ${year}`;
}
