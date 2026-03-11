/**
 * Universal badge helpers for companies — single source of truth
 * for relationship status, hiring, company size, and stage badge colors/labels.
 */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

export interface BadgeInfo {
    label: string;
    color: BaselSemanticColor;
    icon?: string;
    variant?: "solid" | "soft" | "outline" | "ghost";
}

// ── Relationship status ──

const RELATIONSHIP_STATUS_BADGE: Record<string, BadgeInfo> = {
    active: { label: "Active", color: "success" },
    pending: { label: "Pending", color: "warning" },
    declined: { label: "Declined", color: "error" },
    terminated: { label: "Terminated", color: "neutral" },
};

export function relationshipStatusBadge(status?: string | null): BadgeInfo | null {
    if (!status) return null;
    return RELATIONSHIP_STATUS_BADGE[status] || { label: status, color: "neutral" };
}

// ── Relationship type ──

const RELATIONSHIP_TYPE_BADGE: Record<string, BadgeInfo> = {
    sourcer: { label: "Sourcer", color: "secondary" },
    recruiter: { label: "Recruiter", color: "primary" },
};

export function relationshipTypeBadge(type?: string | null): BadgeInfo | null {
    if (!type) return null;
    return RELATIONSHIP_TYPE_BADGE[type] || { label: type, color: "neutral" };
}

// ── Hiring status ──

export function hiringBadge(openRolesCount?: number | null): BadgeInfo | null {
    if (openRolesCount == null || openRolesCount <= 0) return null;
    return {
        label: `Hiring (${openRolesCount})`,
        color: "success",
        variant: "soft",
    };
}

// ── Company size ──

const SIZE_BADGE: Record<string, BadgeInfo> = {
    "1-10": { label: "1-10", color: "secondary" },
    "11-50": { label: "11-50", color: "secondary" },
    "51-200": { label: "51-200", color: "accent" },
    "201-500": { label: "201-500", color: "accent" },
    "501+": { label: "501+", color: "primary" },
};

export function sizeBadge(size?: string | null): BadgeInfo | null {
    if (!size) return null;
    return SIZE_BADGE[size] || { label: size, color: "neutral" };
}

// ── Company stage ──

const STAGE_BADGE: Record<string, BadgeInfo> = {
    startup: { label: "Startup", color: "accent" },
    growth: { label: "Growth", color: "primary" },
    enterprise: { label: "Enterprise", color: "info" },
    public: { label: "Public", color: "secondary" },
};

export function stageBadge(stage?: string | null): BadgeInfo | null {
    if (!stage) return null;
    const key = stage.toLowerCase();
    return STAGE_BADGE[key] || { label: stage, color: "neutral" };
}
