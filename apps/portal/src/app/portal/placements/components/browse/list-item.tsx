"use client";

import { Badge } from "@splits-network/memphis-ui";
import { Placement, getStatusDisplay, formatCurrency } from "../../types";

interface ListItemProps {
    item: Placement;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function ListItem({
    item,
    isSelected,
    onSelect,
}: ListItemProps) {
    const candidate = item.candidate;
    const job = item.job;
    const status = getStatusDisplay(item);

    return (
        <div
            onClick={() => onSelect(item.id)}
            className={`
                group relative p-3 sm:p-4 border-b-2 border-dark cursor-pointer transition-all duration-200
                hover:bg-white
                ${isSelected ? "bg-white border-l-4 border-l-coral" : "border-l-4 border-l-transparent bg-cream"}
            `}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="truncate text-sm font-black text-dark uppercase tracking-tight">
                            {candidate?.full_name || "Unknown Candidate"}
                        </h3>
                    </div>

                    <div className="text-xs text-dark opacity-70 truncate mb-2 font-bold">
                        {job?.title || "Unknown Job"}
                        {job?.company?.name && (
                            <span className="opacity-70">
                                {" "}
                                &bull; {job.company.name}
                            </span>
                        )}
                    </div>

                    {/* Status + Earnings Badges */}
                    <div className="flex flex-wrap gap-2">
                        <Badge
                            color={
                                item.state === "hired"
                                    ? "teal"
                                    : item.state === "pending_payout"
                                      ? "yellow"
                                      : "purple"
                            }
                            size="sm"
                        >
                            <i
                                className={`fa-duotone fa-regular ${status.icon} mr-1`}
                            ></i>
                            {status.label}
                        </Badge>
                        <Badge color="coral" size="sm">
                            <i className="fa-duotone fa-regular fa-dollar-sign mr-1"></i>
                            {formatCurrency(item.recruiter_share || 0)}
                        </Badge>
                    </div>
                </div>

                {/* Date / Quick Actions */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[10px] text-dark opacity-40 font-bold uppercase tracking-wider">
                        {item.hired_at
                            ? new Date(item.hired_at).toLocaleDateString(
                                  undefined,
                                  { month: "short", day: "numeric" },
                              )
                            : ""}
                    </span>

                    {/* Copy Link - Visible on Hover/Selected */}
                    <div
                        className={`
                            flex gap-1 transition-opacity duration-200 mt-1
                            ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                        `}
                    >
                        <button
                            className="btn btn-xs btn-square btn-ghost h-6 w-6"
                            title="Copy Link"
                            onClick={(e) => {
                                e.stopPropagation();
                                const url = `${window.location.origin}${window.location.pathname}?placementId=${item.id}`;
                                navigator.clipboard.writeText(url);
                            }}
                        >
                            <i className="fa-duotone fa-regular fa-link text-xs" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
