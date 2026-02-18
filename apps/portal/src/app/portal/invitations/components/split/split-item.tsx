"use client";

import { Badge } from "@splits-network/memphis-ui";
import type { Invitation } from "../../types";
import {
    getDisplayStatus,
    getInitials,
    isRecentInvitation,
    timeAgo,
} from "../../types";
import type { AccentClasses } from "../shared/accent";

export function SplitItem({
    invitation,
    accent,
    isSelected,
    onSelect,
}: {
    invitation: Invitation;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const ac = accent;
    const candidate = invitation.candidate;
    const candidateName = candidate?.full_name || "Unknown Candidate";
    const status = getDisplayStatus(invitation);

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer p-4 transition-colors border-b-2 border-dark/10 border-l-4 ${
                isSelected
                    ? `${ac.bgLight} ${ac.border}`
                    : "bg-white border-transparent"
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                    {isRecentInvitation(invitation) &&
                        !invitation.consent_given &&
                        !invitation.declined_at && (
                            <i className="fa-duotone fa-regular fa-sparkles text-sm flex-shrink-0 text-yellow" />
                        )}
                    <div className="flex items-center gap-2">
                        {candidate?.profile_picture ? (
                            <img
                                src={candidate.profile_picture}
                                alt={candidateName}
                                className={`w-8 h-8 shrink-0 object-cover border-2 ${ac.border}`}
                            />
                        ) : (
                            <div
                                className={`w-8 h-8 shrink-0 flex items-center justify-center border-2 ${ac.border} bg-cream text-xs font-bold text-dark`}
                            >
                                {getInitials(candidateName)}
                            </div>
                        )}
                        <h4 className="font-black text-sm uppercase tracking-tight truncate text-dark">
                            {candidateName}
                        </h4>
                    </div>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-dark/40">
                    {timeAgo(invitation.invited_at)}
                </span>
            </div>
            {candidate?.email && (
                <div className={`text-sm font-bold mb-1 truncate ${ac.text}`}>
                    {candidate.email}
                </div>
            )}
            <div className="flex items-center justify-between">
                <span className="text-sm text-dark/50">
                    {candidate?.current_title && (
                        <>
                            <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                            {candidate.current_title}
                        </>
                    )}
                </span>
                <Badge color={status.color}>
                    <i
                        className={`fa-duotone fa-regular ${status.icon} mr-1`}
                    />
                    {status.label}
                </Badge>
            </div>
            {candidate?.location && (
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-dark/50">
                        <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                        {candidate.location}
                    </span>
                </div>
            )}
        </div>
    );
}
