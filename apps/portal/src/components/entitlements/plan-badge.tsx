"use client";

import type { PlanTier } from "@/contexts/user-profile-context";

interface PlanBadgeProps {
    /** The plan tier to display */
    tier: PlanTier;
    /** Size variant */
    size?: "sm" | "md";
}

const TIER_CONFIG: Record<
    Exclude<PlanTier, "starter">,
    { label: string; className: string }
> = {
    pro: {
        label: "Pro",
        className: "badge badge-secondary",
    },
    partner: {
        label: "Partner",
        className: "badge badge-primary",
    },
};

/**
 * Displays a Pro or Partner badge for recruiter marketplace listings.
 * Returns null for Starter tier (no badge for free users).
 */
export function PlanBadge({ tier, size = "sm" }: PlanBadgeProps) {
    if (tier === "starter") return null;

    const config = TIER_CONFIG[tier];
    const sizeClass = size === "sm" ? "badge-sm" : "";

    return <span className={`${config.className} ${sizeClass}`}>{config.label}</span>;
}
