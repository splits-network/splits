"use client";

/**
 * Plan Badge Component
 *
 * Displays the user's current subscription plan tier with appropriate styling.
 * Only shows for recruiters who have subscription plans.
 *
 * Tiers:
 * - Starter: neutral/ghost style
 * - Pro: primary style with star icon
 * - Partner: accent style with crown icon
 */

import Link from "next/link";
import { useSubscription, PlanTier } from "@/contexts/subscription-context";
import { useUserProfile } from "@/contexts";

interface PlanBadgeConfig {
    icon: string;
    className: string;
    label: string;
}

const PLAN_CONFIGS: Record<PlanTier, PlanBadgeConfig> = {
    starter: {
        icon: "fa-duotone fa-regular fa-seedling",
        className: "badge-ghost",
        label: "Starter",
    },
    pro: {
        icon: "fa-duotone fa-regular fa-star",
        className: "badge-primary",
        label: "Pro",
    },
    partner: {
        icon: "fa-duotone fa-regular fa-crown",
        className: "badge-accent",
        label: "Partner",
    },
};

export function PlanBadge() {
    const { isRecruiter } = useUserProfile();
    const { planTier, planName, isLoading, isActive } = useSubscription();

    // Only show for recruiters
    if (!isRecruiter) {
        return null;
    }

    // Show skeleton while loading
    if (isLoading) {
        return <div className="skeleton h-6 w-16 rounded-full"></div>;
    }

    const config = PLAN_CONFIGS[planTier];
    const displayName = planName || config.label;

    return (
        <Link
            href="/portal/billing"
            className={`badge ${config.className} gap-1 cursor-pointer hover:opacity-80 transition-opacity`}
            title={`${displayName} Plan - Click to manage`}
        >
            <i className={`${config.icon} text-xs`}></i>
            <span className="text-xs font-medium">{displayName}</span>
            {!isActive && planTier !== "starter" && (
                <span className="badge badge-warning badge-xs ml-1">!</span>
            )}
        </Link>
    );
}
