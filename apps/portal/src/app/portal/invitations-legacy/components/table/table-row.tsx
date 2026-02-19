"use client";

import { Fragment } from "react";
import { Badge } from "@splits-network/memphis-ui";
import type { Invitation } from "../../types";
import {
    getDisplayStatus,
    getInitials,
    isRecentInvitation,
    timeAgo,
} from "../../types";
import type { AccentClasses } from "../shared/accent";
import { InvitationDetail } from "../shared/invitation-detail";
import ActionsToolbar from "../shared/actions-toolbar";

export function TableRow({
    invitation,
    accent,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    invitation: Invitation;
    accent: AccentClasses;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;
    const candidate = invitation.candidate;
    const candidateName = candidate?.full_name || "Unknown Candidate";
    const status = getDisplayStatus(invitation);

    return (
        <Fragment>
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors border-l-4 ${
                    isSelected
                        ? `${ac.bgLight} ${ac.border}`
                        : `border-transparent ${idx % 2 === 0 ? "bg-white" : "bg-cream"}`
                }`}
            >
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? ac.text : "text-dark/40"}`}
                    />
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        {isRecentInvitation(invitation) &&
                            !invitation.consent_given &&
                            !invitation.declined_at && (
                                <i className="fa-duotone fa-regular fa-sparkles text-sm text-yellow" />
                            )}
                        <div className="flex items-center gap-3">
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
                            <span className="font-bold text-sm text-dark">
                                {candidateName}
                            </span>
                        </div>
                    </div>
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${ac.text}`}>
                    {candidate?.email || "--"}
                </td>
                <td className="px-4 py-3 text-sm text-dark/70">
                    {candidate?.current_title || "--"}
                </td>
                <td className="px-4 py-3">
                    <Badge color={status.color}>
                        <i
                            className={`fa-duotone fa-regular ${status.icon} mr-1`}
                        />
                        {status.label}
                    </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-dark/60">
                    {candidate?.location || "--"}
                </td>
                <td className="px-4 py-3 text-sm text-dark/60">
                    {timeAgo(invitation.invited_at)}
                </td>
                <td
                    className="px-4 py-3 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap z-10">
                        <ActionsToolbar
                            invitation={invitation}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                            showActions={{
                                viewCandidate: true,
                                resend: true,
                                cancel: true,
                                viewDeclineReason: true,
                            }}
                        />
                    </div>
                </td>
            </tr>
            {isSelected && (
                <tr>
                    <td
                        colSpan={colSpan}
                        className={`p-0 bg-white border-t-4 border-b-4 ${ac.border}`}
                    >
                        <InvitationDetail
                            invitation={invitation}
                            accent={ac}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
