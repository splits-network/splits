"use client";

import { Badge, Card } from "@splits-network/memphis-ui";
import type { Team } from "../../types";
import { formatCurrency } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
import { formatStatus, memberCountDisplay } from "../shared/helpers";
import { TeamActionsToolbar } from "../shared/actions-toolbar";

export function GridCard({
    team,
    accent,
    isSelected,
    onSelect,
    onRefresh,
}: {
    team: Team;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;

    return (
        <Card
            onClick={onSelect}
            className={`cursor-pointer border-4 transition-transform hover:-translate-y-1 relative ${isSelected ? ac.border : "border-dark/30"}`}
        >
            {/* Corner accent */}
            <div className={`absolute top-0 right-0 w-8 h-8 ${ac.bg}`} />

            <div className="card-body">
                <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-1 text-dark">
                    {team.name}
                </h3>

                <div className="flex items-center justify-between mb-3">
                    <Badge color={statusVariant(team.status)}>
                        {formatStatus(team.status)}
                    </Badge>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-dark/70">
                        <i className="fa-duotone fa-regular fa-users w-4" />
                        <span>{memberCountDisplay(team)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark/70">
                        <i className="fa-duotone fa-regular fa-briefcase w-4" />
                        <span>
                            {team.total_placements} placement
                            {team.total_placements !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-dark/70">
                        <i className="fa-duotone fa-regular fa-dollar-sign w-4" />
                        <span className="font-bold">
                            {formatCurrency(team.total_revenue)}
                        </span>
                    </div>
                </div>
            </div>

            <div className={`card-actions justify-end gap-3 pt-3 border-t-2 ${ac.border}/30`}>
                <div className="mt-2 shrink-0">
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
        </Card>
    );
}
