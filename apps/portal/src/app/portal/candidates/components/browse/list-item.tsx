"use client";

import { Candidate } from "../../types";

interface ListItemProps {
    item: Candidate;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function ListItem({ item, isSelected, onSelect }: ListItemProps) {
    const isNew = item.is_new;

    return (
        <div
            onClick={() => onSelect(item.id)}
            className={`
                group relative p-3 sm:p-4 border-b border-base-300 cursor-pointer transition-all duration-200
                hover:bg-base-100
                ${isSelected ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10" : "border-l-4 border-l-transparent"}
                ${isNew && !isSelected ? "bg-base-100/40" : ""}
            `}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3
                            className={`truncate text-sm ${isNew ? "font-bold text-base-content" : "font-medium text-base-content/90"}`}
                        >
                            {item.full_name}
                        </h3>

                        {item.verification_status === "verified" && (
                            <span className="text-secondary" title="Verified">
                                <i className="fa-duotone fa-regular fa-badge-check text-xs" />
                            </span>
                        )}

                        {isNew && (
                            <span
                                className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse"
                                title="New candidate"
                            />
                        )}
                    </div>

                    <div className="text-xs text-base-content/60 truncate mb-1.5">
                        {item.current_title || "No Title"}
                        {item.current_company && (
                            <span className="opacity-70">
                                {" "}
                                at {item.current_company}
                            </span>
                        )}
                    </div>

                    {/* Badges Row */}
                    <div className="flex flex-wrap gap-1.5">
                        {item.has_active_relationship && (
                            <span className="badge badge-xs badge-success badge-soft gap-1 border-0">
                                <i className="fa-duotone fa-regular fa-user-check text-[10px]" />
                                Representing
                            </span>
                        )}
                        {item.has_pending_invitation && (
                            <span className="badge badge-xs badge-info badge-soft gap-1 border-0">
                                <i className="fa-duotone fa-regular fa-envelope-open-text text-[10px]" />
                                Invited
                            </span>
                        )}
                        {!item.has_active_relationship &&
                            !item.has_other_active_recruiters && (
                                <span className="badge badge-xs badge-accent badge-soft gap-1 border-0">
                                    <i className="fa-duotone fa-regular fa-user-plus text-[10px]" />
                                    Available
                                </span>
                            )}
                        {item.is_sourcer && (
                            <span className="badge badge-xs badge-info badge-soft gap-1 border-0">
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-[10px]" />
                                Sourcer
                            </span>
                        )}
                        {item.has_other_active_recruiters && (
                            <span
                                className="badge badge-xs badge-warning badge-soft gap-1 border-0"
                                title={`${item.other_active_recruiters_count} other recruiter(s)`}
                            >
                                <i className="fa-duotone fa-regular fa-users text-[10px]" />
                                Represented
                            </span>
                        )}
                    </div>
                </div>

                {/* Date */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                        className={`text-[10px] ${isNew ? "font-semibold text-primary" : "text-base-content/40"}`}
                    >
                        {item.created_at
                            ? new Date(item.created_at).toLocaleDateString(
                                  undefined,
                                  { month: "short", day: "numeric" },
                              )
                            : ""}
                    </span>
                </div>
            </div>
        </div>
    );
}
