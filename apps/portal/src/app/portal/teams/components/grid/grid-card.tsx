"use client";

import type { Team } from "../../types";
import { formatCurrency } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    formatStatus,
    createdAgo,
    teamInitials,
    memberCountDisplay,
} from "../shared/helpers";
import { TeamActionsToolbar } from "../shared/actions-toolbar";

export function GridCard({
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
            className={[
                "group cursor-pointer bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected ? "border-primary border-l-4" : "border-base-200",
            ].join(" ")}
        >
            {/* Status pill */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(team.status)}`}
                >
                    {formatStatus(team.status)}
                </span>
            </div>

            {/* Team name */}
            <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors mb-1">
                {team.name}
            </h3>

            {/* Member count */}
            <div className="text-sm font-semibold text-base-content/60 mb-2">
                {memberCountDisplay(team)}
            </div>

            {/* Stats: placements */}
            <div className="text-sm text-base-content/70 mb-1">
                <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                {team.total_placements} placement
                {team.total_placements !== 1 ? "s" : ""}
            </div>

            {/* Revenue — highlighted */}
            <div className="text-base font-black tracking-tight text-primary mb-3">
                {formatCurrency(team.total_revenue)}
            </div>

            {/* Created ago */}
            <div className="text-xs text-base-content/40">
                {createdAgo(team)}
            </div>

            {/* Footer: team initials + actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-base-200">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-base-200 border border-base-300 text-xs font-bold text-base-content/60">
                        {teamInitials(team.name)}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-base-content truncate">
                            {team.name}
                        </div>
                    </div>
                </div>

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <TeamActionsToolbar
                        team={team}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            viewDetails: true,
                            inviteMember: false,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
