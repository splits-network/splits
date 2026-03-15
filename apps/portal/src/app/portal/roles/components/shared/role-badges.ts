/**
 * Universal badge helpers for roles/jobs — single source of truth
 * for employment type, commute type, and job level badge colors/labels.
 */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

export interface BadgeInfo {
    label: string;
    color: BaselSemanticColor;
    icon?: string;
    variant?: "solid" | "soft" | "outline" | "ghost";
}

// ── Employment type ──

const EMPLOYMENT_BADGE: Record<string, BadgeInfo> = {
    full_time: { label: "Full Time", color: "primary" },
    contract: { label: "Contract", color: "accent" },
    temporary: { label: "Temporary", color: "secondary" },
};

export function employmentBadge(type?: string | null): BadgeInfo | null {
    if (!type) return null;
    const key = type.toLowerCase().replace(/[- ]/g, "_");
    return EMPLOYMENT_BADGE[key] || { label: type.replace(/_/g, " "), color: "neutral" };
}

// ── Commute type ──

const COMMUTE_BADGE: Record<string, BadgeInfo> = {
    remote: { label: "Remote", color: "primary" },
    hybrid_1: { label: "Hybrid 1d", color: "info" },
    hybrid_2: { label: "Hybrid 2d", color: "info" },
    hybrid_3: { label: "Hybrid 3d", color: "info" },
    hybrid_4: { label: "Hybrid 4d", color: "info" },
    in_office: { label: "In Office", color: "neutral" },
};

export function commuteBadges(types?: string[] | null): BadgeInfo[] {
    if (!types || types.length === 0) return [];
    return types.map((t) => COMMUTE_BADGE[t] || { label: t, color: "neutral" as const });
}

// ── Job level ──

const LEVEL_BADGE: Record<string, BadgeInfo> = {
    entry: { label: "Entry", color: "neutral" },
    mid: { label: "Mid", color: "secondary" },
    senior: { label: "Senior", color: "primary" },
    lead: { label: "Lead", color: "accent" },
    manager: { label: "Manager", color: "warning" },
    director: { label: "Director", color: "info" },
    vp: { label: "VP", color: "info" },
    c_suite: { label: "C-Suite", color: "error" },
};

export function levelBadge(level?: string | null): BadgeInfo | null {
    if (!level) return null;
    return LEVEL_BADGE[level] || { label: level, color: "neutral" };
}

// ── 3rd party firm ──

export function thirdPartyBadge(job: { company_id: string | null; source_firm_id?: string | null }): BadgeInfo | null {
    if (!job.company_id && job.source_firm_id) {
        return { label: "3rd Party", color: "warning", variant: "soft" };
    }
    return null;
}
