"use client";

import { Application, getDisplayStatus } from "../../types";

interface ListItemProps {
    item: Application;
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
    const status = getDisplayStatus(item);

    return (
        <div
            onClick={() => onSelect(item.id)}
            className={`
                group relative p-3 sm:p-4 border-b border-base-300 cursor-pointer transition-all duration-200
                hover:bg-base-100
                ${isSelected ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10" : "border-l-4 border-l-transparent"}
            `}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="truncate text-sm font-medium text-base-content/90">
                            {candidate?.full_name || "Unknown Candidate"}
                        </h3>
                    </div>

                    <div className="text-xs text-base-content/60 truncate mb-1.5">
                        {job?.title || "Unknown Job"}
                        {job?.company?.name && (
                            <span className="opacity-70">
                                {" "}
                                &bull; {job.company.name}
                            </span>
                        )}
                    </div>

                    {/* Status + AI Score Badges */}
                    <div className="flex flex-wrap gap-1.5">
                        <span
                            className={`badge badge-sm ${status.badgeClass} badge-soft gap-1 border-0`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${status.icon} text-[10px]`}
                            />
                            {status.label}
                        </span>
                        {item.ai_review?.fit_score != null && (
                            <span className="badge badge-sm badge-accent badge-soft gap-1 border-0">
                                <i className="fa-duotone fa-regular fa-robot text-[10px]" />
                                {Math.round(item.ai_review.fit_score)}%
                            </span>
                        )}
                    </div>
                </div>

                {/* Date / Quick Actions */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[10px] text-base-content/40">
                        {item.created_at
                            ? new Date(item.created_at).toLocaleDateString(
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
                                const url = `${window.location.origin}${window.location.pathname}?applicationId=${item.id}`;
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
