"use client";

import { Invitation, getDisplayStatus } from "../../types";

interface ListItemProps {
    item: Invitation;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function ListItem({
    item,
    isSelected,
    onSelect,
}: ListItemProps) {
    const candidate = item.candidate;
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

                        {candidate?.verification_status === "verified" && (
                            <span className="text-secondary" title="Verified">
                                <i className="fa-duotone fa-regular fa-badge-check text-xs" />
                            </span>
                        )}
                    </div>

                    <div className="text-xs text-base-content/60 truncate mb-1.5">
                        {candidate?.email || "No email"}
                        {candidate?.current_title && (
                            <span className="opacity-70">
                                {" "}
                                &bull; {candidate.current_title}
                            </span>
                        )}
                        {candidate?.current_company && (
                            <span className="opacity-70">
                                {" "}
                                at {candidate.current_company}
                            </span>
                        )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-wrap gap-1.5">
                        <span
                            className={`badge badge-xs ${status.badgeClass} badge-soft gap-1 border-0`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${status.icon} text-[10px]`}
                            />
                            {status.label}
                        </span>
                    </div>
                </div>

                {/* Date / Quick Actions */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[10px] text-base-content/40">
                        {item.invited_at
                            ? new Date(item.invited_at).toLocaleDateString(
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
                                const url = `${window.location.origin}${window.location.pathname}?invitationId=${item.id}`;
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
