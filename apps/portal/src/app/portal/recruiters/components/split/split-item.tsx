"use client";

import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
import { statusBorder } from "../shared/status-color";
import { BaselBadge } from "@splits-network/basel-ui";
import {
    recruiterLocation,
    formatStatus,
    placementsDisplay,
    successRateDisplay,
    joinedAgo,
    isNew,
} from "../shared/helpers";
import RecruiterActionsToolbar from "../shared/actions-toolbar";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import { PlanBadge } from "@/components/entitlements/plan-badge";
import type { PlanTier } from "@/contexts/user-profile-context";

export function SplitItem({
    recruiter,
    isSelected,
    onSelect,
    onRefresh,
}: {
    recruiter: RecruiterWithUser;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { getLevel } = useGamification();
    const level = getLevel(recruiter.id);
    const name = getDisplayName(recruiter);
    const location = recruiterLocation(recruiter);
    const status = recruiter.status || "active";
    const successRate = successRateDisplay(recruiter);

    return (
        <div
            onClick={onSelect}
            className={`relative cursor-pointer px-4 py-2.5 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : `bg-base-100 ${statusBorder(status)}`
            }`}
        >
            {/* Row 1: name + joined time */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    {isNew(recruiter) && (
                        <i className="fa-duotone fa-regular fa-sparkles text-warning text-sm flex-shrink-0" />
                    )}
                    <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                        {name}
                    </h4>
                    {level && <LevelBadge level={level} size="sm" />}
                    {recruiter.plan_tier && <PlanBadge tier={recruiter.plan_tier as PlanTier} />}
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {joinedAgo(recruiter)}
                </span>
            </div>

            {/* Row 2: firm + location */}
            <div className="flex items-center gap-1.5 mt-0.5 truncate">
                <span className="text-sm text-base-content/60 truncate">
                    {recruiter.firm_name || "Independent"}
                </span>
                <span className="text-base-content/20">&middot;</span>
                <span className={`text-sm truncate ${location ? "text-base-content/50" : "text-base-content/30"}`}>
                    {location || "No location"}
                </span>
            </div>

            {/* Row 3: placements + success rate + status */}
            <div className="flex items-center gap-2 mt-0.5 pr-10">
                <span className="text-sm font-bold text-base-content/60">
                    {placementsDisplay(recruiter)} placements
                </span>
                <span className={`text-sm font-bold ${successRate ? "text-accent" : "text-base-content/30"}`}>
                    {successRate ? `${successRate} success` : "No rate"}
                </span>
                <BaselBadge color={status === "active" ? "success" : status === "pending" ? "warning" : status === "suspended" ? "error" : "neutral"} size="xs" variant="soft">
                    {formatStatus(status)}
                </BaselBadge>
            </div>

            {/* Actions */}
            <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
                <RecruiterActionsToolbar
                    recruiter={recruiter}
                    variant="icon-only"
                    size="xs"
                    showActions={{ viewDetails: false }}
                    onRefresh={onRefresh}
                />
            </div>
        </div>
    );
}
