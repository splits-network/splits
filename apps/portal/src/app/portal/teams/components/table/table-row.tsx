"use client";

import { Fragment } from "react";
import type { Team } from "../../types";
import { formatCurrency } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    formatStatus,
    createdAgo,
    memberCountDisplay,
} from "../shared/helpers";
import { TeamDetailLoader } from "../shared/team-detail";
import { TeamActionsToolbar } from "../shared/actions-toolbar";

export function TableRow({
    team,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    team: Team;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const rowBase = isSelected
        ? "bg-primary/5 border-l-4 border-l-primary"
        : `border-l-4 border-l-transparent ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`;

    return (
        <Fragment>
            {/* Main row */}
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors ${rowBase}`}
            >
                {/* Chevron */}
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? "text-primary" : "text-base-content/30"}`}
                    />
                </td>

                {/* Team Name */}
                <td className="px-4 py-3">
                    <span className="font-bold text-sm text-base-content">
                        {team.name}
                    </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                    <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] font-bold ${statusColor(team.status)}`}
                    >
                        {formatStatus(team.status)}
                    </span>
                </td>

                {/* Members */}
                <td className="px-4 py-3 text-sm text-base-content/70">
                    {memberCountDisplay(team)}
                </td>

                {/* Placements */}
                <td className="px-4 py-3 text-sm font-bold text-base-content">
                    {team.total_placements}
                </td>

                {/* Revenue */}
                <td className="px-4 py-3 text-sm font-bold text-primary">
                    {formatCurrency(team.total_revenue)}
                </td>

                {/* Created */}
                <td className="px-4 py-3 text-sm text-base-content/50">
                    {createdAgo(team)}
                </td>

                {/* Actions */}
                <td
                    className="px-4 py-3 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap z-10">
                        <TeamActionsToolbar
                            team={team}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                            showActions={{
                                viewDetails: false,
                                inviteMember: false,
                            }}
                        />
                    </div>
                </td>
            </tr>

            {/* Expanded detail row */}
            {isSelected && (
                <tr>
                    <td
                        colSpan={colSpan}
                        className="p-0 bg-base-100 border-t-2 border-b-2 border-primary"
                    >
                        <TeamDetailLoader
                            teamId={team.id}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
