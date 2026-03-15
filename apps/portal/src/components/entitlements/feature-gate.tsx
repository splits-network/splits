"use client";

import { type ReactNode } from "react";
import type { BooleanEntitlement } from "@splits-network/shared-types";
import { useUserProfile } from "@/contexts/user-profile-context";
import { UpgradePrompt } from "./upgrade-prompt";

interface FeatureGateProps {
    /** The boolean entitlement to check */
    entitlement: BooleanEntitlement;
    /** Content to render when the user has the entitlement */
    children: ReactNode;
    /** Custom fallback — defaults to <UpgradePrompt> */
    fallback?: ReactNode;
    /** Variant for the default UpgradePrompt fallback */
    variant?: "inline" | "overlay" | "card" | "banner";
}

/**
 * Conditionally renders children based on a boolean entitlement.
 * Shows an upgrade prompt when the user's plan doesn't include the feature.
 *
 * @example
 * ```tsx
 * <FeatureGate entitlement="ai_match_scoring">
 *     <TrueScorePanel data={matchData} />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
    entitlement,
    children,
    fallback,
    variant = "card",
}: FeatureGateProps) {
    const { hasEntitlement } = useUserProfile();

    if (hasEntitlement(entitlement)) {
        return <>{children}</>;
    }

    return (
        <>
            {fallback ?? (
                <UpgradePrompt entitlement={entitlement} variant={variant} />
            )}
        </>
    );
}
