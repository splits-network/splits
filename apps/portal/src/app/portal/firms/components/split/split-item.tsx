"use client";

import type { Firm } from "../../types";
import { firmStatusBadgeColor } from "../shared/status-color";
import {
    formatStatus,
    createdAgo,
    memberCountDisplay,
    teamSizeDisplay,
} from "../shared/helpers";

import { useGamification } from "@splits-network/shared-gamification";
import { BaselBadge, BaselLevelIndicator } from "@splits-network/basel-ui";

export function SplitItem({
    firm,
    isSelected,
    onSelect,
    onRefresh,
}: {
    firm: Firm;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { getLevel } = useGamification();
    const firmLevel = firm.id ? getLevel(firm.id) : undefined;

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Row 1: firm name + created ago */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-bold text-sm tracking-tight truncate text-base-content flex items-center gap-1.5">
                    {firm.name}
                    {firmLevel && <BaselLevelIndicator level={firmLevel.current_level} title={firmLevel.title} totalXp={firmLevel.total_xp} xpToNextLevel={firmLevel.xp_to_next_level} />}
                </h4>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {createdAgo(firm)}
                </span>
            </div>

            {/* Row 2: member count */}
            <div className="text-sm font-semibold text-base-content/60 mb-1">
                {memberCountDisplay(firm)}
            </div>

            {/* Row 3: status pill + team size */}
            <div className="flex items-center justify-between gap-2 mb-1">
                <BaselBadge
                    color={firmStatusBadgeColor(firm.status)}
                    variant="soft"
                    size="sm"
                >
                    {formatStatus(firm.status)}
                </BaselBadge>
                <span className="text-sm text-base-content/50">
                    <i className="fa-duotone fa-regular fa-user-group mr-1" />
                    {teamSizeDisplay(firm.team_size_range)}
                </span>
            </div>
        </div>
    );
}
