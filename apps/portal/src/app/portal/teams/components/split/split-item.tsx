"use client";

import { Badge } from "@splits-network/memphis-ui";
import type { Team } from "../../types";
import { formatCurrency } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
import { formatStatus, createdAgo } from "../shared/helpers";

export function SplitItem({
    team,
    accent,
    isSelected,
    onSelect,
}: {
    team: Team;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const ac = accent;

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer p-4 border-b-2 border-dark/10 border-l-4 transition-colors ${
                isSelected
                    ? `${ac.bgLight} ${ac.border}`
                    : "border-transparent hover:bg-cream/50"
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-black text-sm uppercase tracking-tight text-dark truncate">
                    {team.name}
                </h4>
                <span className="text-xs text-dark/40 whitespace-nowrap">
                    {createdAgo(team)}
                </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <Badge color={statusVariant(team.status)} size="sm">
                    {formatStatus(team.status)}
                </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-dark/60">
                <span>
                    <i className="fa-duotone fa-regular fa-users mr-1" />
                    {team.active_member_count} members
                </span>
                <span>
                    <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                    {team.total_placements}
                </span>
                <span className="font-bold">
                    {formatCurrency(team.total_revenue)}
                </span>
            </div>
        </div>
    );
}
