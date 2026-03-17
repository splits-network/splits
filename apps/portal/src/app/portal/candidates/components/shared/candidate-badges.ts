/**
 * Candidate badge helpers — reusable label + color mappings for BaselBadge.
 *
 * Relationship status, job type, and account status badges used across
 * grid cards, table rows, split items, and detail views.
 */

import type { BaselSemanticColor } from "@splits-network/basel-ui";
import type { Candidate } from "../../types";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BadgeInfo {
    label: string;
    color: BaselSemanticColor;
    icon?: string;
    variant?: "solid" | "soft" | "outline" | "ghost";
}

/* ─── Relationship ───────────────────────────────────────────────────────── */

/**
 * Returns a badge describing the current user's relationship to a candidate.
 * Returns `null` if no relationship exists.
 */
export function relationshipBadge(candidate: Candidate): BadgeInfo | null {
    if (candidate.has_active_relationship) {
        return { label: "Mine", color: "success", icon: "fa-handshake" };
    }
    if (candidate.is_sourcer) {
        return { label: "Sourced", color: "info", icon: "fa-seedling" };
    }
    if (candidate.has_pending_invitation) {
        return { label: "Pending", color: "warning", icon: "fa-clock", variant: "soft" };
    }
    return null;
}

/* ─── Job Type ───────────────────────────────────────────────────────────── */

const JOB_TYPE_BADGE: Record<string, BadgeInfo> = {
    full_time: { label: "Full Time", color: "primary" },
    contract: { label: "Contract", color: "accent" },
    freelance: { label: "Freelance", color: "secondary" },
    part_time: { label: "Part Time", color: "info" },
    internship: { label: "Internship", color: "warning" },
};

/** Normalise casing variants ("Full-time" → "full_time") */
function normalizeJobType(raw: string): string {
    return raw.trim().toLowerCase().replace(/[- ]/g, "_");
}

/**
 * Returns an array of colored badges — one per job type.
 * Handles comma-separated lists stored in a single string.
 */
export function jobTypeBadges(type?: string | null): BadgeInfo[] {
    if (!type) return [{ label: "Not Specified", color: "neutral", variant: "ghost" }];
    const parts = type.split(",").map((s) => s.trim()).filter(Boolean);
    return parts.map((raw) => {
        const key = normalizeJobType(raw);
        return JOB_TYPE_BADGE[key] || { label: raw.replace(/_/g, " "), color: "neutral" };
    });
}

/* ─── Account Status ─────────────────────────────────────────────────────── */

/**
 * Returns a badge if the candidate has no platform account.
 * Returns `null` if the candidate is registered.
 */
export function accountBadge(candidate: Candidate): BadgeInfo | null {
    if (!candidate.user_id) {
        return { label: "No Account", color: "error", icon: "fa-user-slash" };
    }
    return null;
}
