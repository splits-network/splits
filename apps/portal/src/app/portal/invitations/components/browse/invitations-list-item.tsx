"use client";

import { RecruiterCandidateWithCandidate } from "@splits-network/shared-types";

interface InvitationsListItemProps {
    invitation: RecruiterCandidateWithCandidate;
    isSelected: boolean;
    onSelect: (invitation: RecruiterCandidateWithCandidate) => void;
}

export default function InvitationsListItem({
    invitation,
    isSelected,
    onSelect,
}: InvitationsListItemProps) {
    const candidate = invitation.candidate;
    const isNew = false; // Could be computed based on invitation date logic

    // Status badge configuration
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "accepted":
                return "badge-success";
            case "declined":
                return "badge-error";
            case "expired":
                return "badge-warning";
            default:
                return "badge-info";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "accepted":
                return "fa-user-check";
            case "declined":
                return "fa-user-xmark";
            case "expired":
                return "fa-clock";
            default:
                return "fa-envelope-open-text";
        }
    };

    return (
        <div
            onClick={() => onSelect(invitation)}
            id={`invitation-item-${invitation.id}`}
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
                            {candidate?.full_name || "Unknown Candidate"}
                        </h3>

                        {candidate?.verification_status === "verified" && (
                            <span className="text-secondary" title="Verified">
                                <i className="fa-duotone fa-regular fa-badge-check text-xs"></i>
                            </span>
                        )}

                        {isNew && (
                            <span
                                className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse"
                                title="New invitation"
                            ></span>
                        )}
                    </div>

                    <div className="text-xs text-base-content/60 truncate mb-1.5">
                        {candidate?.email || "No email"}
                        {candidate?.current_title && (
                            <span className="opacity-70">
                                {" "}
                                • {candidate.current_title}
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
                            className={`badge badge-xs ${getStatusBadge(invitation.status || "pending")} badge-soft gap-1 border-0`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${getStatusIcon(invitation.status || "pending")} text-[10px]`}
                            ></i>
                            {(invitation.status || "pending")
                                .charAt(0)
                                .toUpperCase() +
                                (invitation.status || "pending").slice(1)}
                        </span>
                    </div>
                </div>

                {/* Date / Quick Actions */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                        className={`text-[10px] ${isNew ? "font-semibold text-primary" : "text-base-content/40"}`}
                    >
                        {invitation.invited_at
                            ? new Date(
                                  invitation.invited_at,
                              ).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                              })
                            : ""}
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
                                const url = `${window.location.origin}${window.location.pathname}?invitationId=${invitation.id}`;
                                navigator.clipboard.writeText(url);
                            }}
                        >
                            <i className="fa-duotone fa-regular fa-link text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
