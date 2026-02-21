"use client";

import type { Team } from "../../types";
import { formatCurrency } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    formatStatus,
    createdAgo,
    memberCountDisplay,
} from "../shared/helpers";
import { TeamActionsToolbar } from "../shared/actions-toolbar";

export function SplitItem({
    team,
    isSelected,
    onSelect,
    onRefresh,
}: {
    team: Team;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    return (
        <div
            onClick={onSelect}
            className={`relative cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Row 1: team name + created ago */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                    {team.name}
                </h4>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {createdAgo(team)}
                </span>
            </div>

            {/* Row 2: member count */}
            <div className="text-sm font-semibold text-base-content/60 mb-1">
                {memberCountDisplay(team)}
            </div>

            {/* Row 3: status pill + revenue */}
            <div className="flex items-center justify-between gap-2 mb-1">
                <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold flex-shrink-0 ${statusColor(team.status)}`}
                >
                    {formatStatus(team.status)}
                </span>
                <span className="text-sm font-bold text-primary">
                    {formatCurrency(team.total_revenue)}
                </span>
            </div>

            {/* Row 4: placements */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-base-content/50">
                    <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                    {team.total_placements} placement
                    {team.total_placements !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Actions */}
            <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
                <TeamActionsToolbar
                    team={team}
                    variant="icon-only"
                    size="xs"
                    showActions={{ viewDetails: false }}
                    onRefresh={onRefresh}
                />
            </div>
        </div>
    );
}
