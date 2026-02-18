"use client";

import { Fragment, useState } from "react";
import { Badge } from "@splits-network/memphis-ui";
import type { Team } from "../../types";
import { formatCurrency, formatDate } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
import { formatStatus, memberCountDisplay, createdAgo } from "../shared/helpers";
import { TeamActionsToolbar } from "../shared/actions-toolbar";
import { TeamDetailLoader } from "../shared/team-detail";

export function TableRow({
    team,
    accent,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    team: Team;
    accent: AccentClasses;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;
    const [expanded, setExpanded] = useState(false);

    const handleClick = () => {
        setExpanded((prev) => !prev);
        onSelect();
    };

    const rowBg = isSelected
        ? `${ac.bgLight} ${ac.border}`
        : idx % 2 === 0
          ? "bg-white"
          : "bg-cream";

    return (
        <Fragment>
            <tr
                onClick={handleClick}
                className={`cursor-pointer transition-colors hover:bg-cream/80 ${rowBg} ${isSelected ? "border-l-4" : "border-l-4 border-transparent"}`}
            >
                {/* Chevron */}
                <td className="w-8 px-4">
                    <i
                        className={`fa-duotone fa-regular fa-chevron-right text-sm transition-transform ${
                            expanded ? "rotate-90" : ""
                        } ${ac.text}`}
                    />
                </td>

                {/* Team Name */}
                <td className="px-4 py-3">
                    <span className="font-black text-sm uppercase tracking-tight text-dark">
                        {team.name}
                    </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                    <Badge color={statusVariant(team.status)} size="sm">
                        {formatStatus(team.status)}
                    </Badge>
                </td>

                {/* Members */}
                <td className="px-4 py-3">
                    <span className="text-sm text-dark/70">
                        {memberCountDisplay(team)}
                    </span>
                </td>

                {/* Placements */}
                <td className="px-4 py-3">
                    <span className="text-sm font-bold text-dark">
                        {team.total_placements}
                    </span>
                </td>

                {/* Revenue */}
                <td className="px-4 py-3">
                    <span className="text-sm font-bold text-dark">
                        {formatCurrency(team.total_revenue)}
                    </span>
                </td>

                {/* Created */}
                <td className="px-4 py-3">
                    <span className="text-sm text-dark/50">
                        {createdAgo(team)}
                    </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                    <div onClick={(e) => e.stopPropagation()}>
                        <TeamActionsToolbar
                            team={team}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                            showActions={{
                                viewDetails: true,
                                inviteMember: false,
                            }}
                        />
                    </div>
                </td>
            </tr>

            {/* Expandable Detail Row */}
            {expanded && isSelected && (
                <tr>
                    <td colSpan={colSpan} className="p-0">
                        <div className={`border-t-4 ${ac.border}`}>
                            <TeamDetailLoader
                                team={team}
                                accent={ac}
                                onClose={handleClick}
                                onRefresh={onRefresh}
                            />
                        </div>
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
