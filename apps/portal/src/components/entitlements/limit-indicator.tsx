"use client";

import Link from "next/link";
import type { NumericEntitlement } from "@splits-network/shared-types";
import { useUserProfile } from "@/contexts/user-profile-context";

interface LimitIndicatorProps {
    /** The numeric entitlement to check */
    entitlement: NumericEntitlement;
    /** Current usage count */
    current: number;
    /** Label for the resource (e.g., "messages", "saved candidates") */
    label: string;
    /** Upgrade CTA text override */
    ctaText?: string;
}

/**
 * Shows usage vs. limit for numeric entitlements.
 * Displays a progress indicator, warning when near limit, and upsell CTA at limit.
 *
 * @example
 * ```tsx
 * <LimitIndicator
 *     entitlement="messaging_initiations_per_month"
 *     current={messageCount}
 *     label="messages"
 * />
 * ```
 */
export function LimitIndicator({
    entitlement,
    current,
    label,
    ctaText = "Upgrade for more",
}: LimitIndicatorProps) {
    const { getLimit } = useUserProfile();
    const limit = getLimit(entitlement);

    // Unlimited — no indicator needed
    if (limit === -1) return null;

    const atLimit = current >= limit;
    const nearLimit = current >= limit * 0.8;
    const percentage = Math.min((current / limit) * 100, 100);

    if (atLimit) {
        return (
            <div className="flex items-center gap-3 rounded-lg bg-warning/10 px-4 py-2">
                <i className="fa-duotone fa-regular fa-circle-exclamation text-warning" />
                <span className="text-sm text-base-content/80">
                    {current}/{limit} {label} used
                </span>
                <Link
                    href="/portal/profile?section=subscription"
                    className="btn btn-primary btn-xs ml-auto"
                >
                    {ctaText}
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <progress
                className={`progress w-24 ${nearLimit ? "progress-warning" : "progress-primary"}`}
                value={percentage}
                max={100}
            />
            <span className="text-sm text-base-content/60">
                {current}/{limit} {label}
            </span>
        </div>
    );
}
