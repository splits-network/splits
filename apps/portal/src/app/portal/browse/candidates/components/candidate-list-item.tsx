"use client";

import { Candidate } from "./types";

interface CandidateListItemProps {
    candidate: Candidate;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function CandidateListItem({
    candidate,
    isSelected,
    onSelect,
}: CandidateListItemProps) {
    const isNew = candidate.is_new;

    return (
        <div
            onClick={() => onSelect(candidate.id)}
            id={`candidate-item-${candidate.id}`}
            className={`
                group relative p-3 sm:p-4 border-b border-base-300 cursor-pointer transition-all duration-200
                hover:bg-base-100
                ${isSelected ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10" : "border-l-4 border-l-transparent"}
                ${isNew && !isSelected ? "bg-base-100/40" : ""}
            `}
        >
            <div className="flex items-start justify-between gap-3">
                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3
                            className={`truncate text-sm ${isNew ? "font-bold text-base-content" : "font-medium text-base-content/90"}`}
                        >
                            {candidate.full_name}
                        </h3>

                        {candidate.verification_status === "verified" && (
                            <span className="text-secondary" title="Verified">
                                <i className="fa-duotone fa-regular fa-badge-check text-xs"></i>
                            </span>
                        )}

                        {isNew && (
                            <span
                                className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse"
                                title="New candidate"
                            ></span>
                        )}
                    </div>

                    <div className="text-xs text-base-content/60 truncate mb-1.5">
                        {candidate.current_title || "No Title"}
                        {candidate.current_company && (
                            <span className="opacity-70">
                                {" "}
                                at {candidate.current_company}
                            </span>
                        )}
                    </div>

                    {/* Badges Row */}
                    <div className="flex flex-wrap gap-1.5">
                        {candidate.has_active_relationship && (
                            <span className="badge badge-xs badge-success badge-soft gap-1 border-0">
                                <i className="fa-duotone fa-solid fa-user-check text-[10px]"></i>
                                Representing
                            </span>
                        )}
                        {candidate.has_pending_invitation && (
                            <span className="badge badge-xs badge-info badge-soft gap-1 border-0">
                                <i className="fa-duotone fa-solid fa-envelope-open-text text-[10px]"></i>
                                Invited
                            </span>
                        )}
                        {!candidate.has_active_relationship &&
                            !candidate.has_other_active_recruiters && (
                                <span className="badge badge-xs badge-accent badge-soft gap-1 border-0">
                                    <i className="fa-duotone fa-solid fa-user-plus text-[10px]"></i>
                                    Available
                                </span>
                            )}
                        {candidate.is_sourcer && (
                            <span className="badge badge-xs badge-info badge-soft gap-1 border-0">
                                <i className="fa-duotone fa-solid fa-magnifying-glass text-[10px]"></i>
                                Sourcer
                            </span>
                        )}
                        {candidate.has_other_active_recruiters && (
                            <span
                                className="badge badge-xs badge-warning badge-soft gap-1 border-0"
                                title={`${candidate.other_active_recruiters_count} other recruiter(s)`}
                            >
                                <i className="fa-duotone fa-solid fa-users text-[10px]"></i>
                                Represented
                            </span>
                        )}
                    </div>
                </div>

                {/* Date / Quick Actions */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                        className={`text-[10px] ${isNew ? "font-semibold text-primary" : "text-base-content/40"}`}
                    >
                        {new Date(candidate.created_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                        )}
                    </span>

                    {/* Quick Actions - Visible on Hover/Selected */}
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
                                const url = `${window.location.origin}${window.location.pathname}?candidateId=${candidate.id}`;
                                navigator.clipboard.writeText(url);
                            }}
                        >
                            <i className="fa-duotone fa-solid fa-link text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
