"use client";

import { Badge, Card } from "@splits-network/memphis-ui";
import type { Invitation } from "../../types";
import {
    getDisplayStatus,
    formatDateShort,
    getInitials,
    isRecentInvitation,
} from "../../types";
import type { AccentClasses } from "../shared/accent";
import ActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
    invitation,
    accent,
    isSelected,
    onSelect,
    onRefresh,
}: {
    invitation: Invitation;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;
    const candidate = invitation.candidate;
    const candidateName = candidate?.full_name || "Unknown Candidate";
    const status = getDisplayStatus(invitation);

    return (
        <Card
            onClick={onSelect}
            className={`cursor-pointer border-4 transition-transform hover:-translate-y-1 relative ${isSelected ? ac.border : "border-dark/30"}`}
        >
            {/* Corner accent */}
            <div className={`absolute top-0 right-0 w-8 h-8 ${ac.bg}`} />

            <div className="card-body">
                {isRecentInvitation(invitation) &&
                    !invitation.consent_given &&
                    !invitation.declined_at && (
                        <Badge color="yellow" className="mb-2" size="sm">
                            <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                            New
                        </Badge>
                    )}

                <div className="flex items-center gap-3 mb-2">
                    {candidate?.profile_picture ? (
                        <img
                            src={candidate.profile_picture}
                            alt={candidateName}
                            className={`w-10 h-10 shrink-0 object-cover border-2 ${ac.border}`}
                        />
                    ) : (
                        <div
                            className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 ${ac.border} bg-cream text-sm font-bold text-dark`}
                        >
                            {getInitials(candidateName)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h3 className="font-black text-base uppercase tracking-tight leading-tight truncate text-dark">
                            {candidateName}
                        </h3>
                        {candidate?.email && (
                            <div className="text-sm text-dark/50 truncate">
                                {candidate.email}
                            </div>
                        )}
                    </div>
                </div>

                {/* Title & Company */}
                {(candidate?.current_title || candidate?.current_company) && (
                    <div className={`text-sm font-bold mb-2 ${ac.text}`}>
                        {candidate.current_title}
                        {candidate.current_title &&
                            candidate.current_company &&
                            " at "}
                        {candidate.current_company}
                    </div>
                )}

                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-dark/70">
                        <i className="fa-duotone fa-regular fa-paper-plane mr-1" />
                        {formatDateShort(invitation.invited_at)}
                    </span>
                    <Badge color={status.color}>
                        <i
                            className={`fa-duotone fa-regular ${status.icon} mr-1`}
                        />
                        {status.label}
                    </Badge>
                </div>

                {/* Location */}
                {candidate?.location && (
                    <div className="flex flex-wrap gap-1">
                        <Badge color="teal" variant="outline">
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {candidate.location}
                        </Badge>
                    </div>
                )}
            </div>

            <div
                className={`card-actions justify-between gap-3 pt-3 border-t-2 ${ac.border}/30`}
            >
                <div className="flex flex-row items-center gap-2 mt-2 min-w-0">
                    <div className="text-sm font-bold text-dark/50">
                        <i className="fa-duotone fa-regular fa-clock mr-1" />
                        Expires{" "}
                        {formatDateShort(invitation.invitation_expires_at) ||
                            "N/A"}
                    </div>
                </div>
                <div className="mt-2 shrink-0">
                    <ActionsToolbar
                        invitation={invitation}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            viewCandidate: true,
                            resend: true,
                            cancel: true,
                            viewDeclineReason: true,
                        }}
                    />
                </div>
            </div>
        </Card>
    );
}
