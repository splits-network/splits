"use client";

import { Fragment } from "react";
import type { Invitation } from "../../types";
import { getDisplayStatus } from "../../types";
import { statusColor, statusBorder } from "../shared/status-color";
import {
    getInitials,
    isRecentInvitation,
    timeAgo,
    candidateName,
} from "../shared/helpers";
import { InvitationDetail } from "../shared/invitation-detail";
import ActionsToolbar from "../shared/actions-toolbar";

export function TableRow({
    invitation,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    invitation: Invitation;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const candidate = invitation.candidate;
    const name = candidateName(invitation);
    const status = getDisplayStatus(invitation);
    const borderClass = statusBorder(invitation);

    return (
        <Fragment>
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors border-l-4 ${
                    isSelected
                        ? `bg-base-200/50 ${borderClass}`
                        : `border-transparent ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`
                }`}
            >
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? "text-primary" : "text-base-content/30"}`}
                    />
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        {isRecentInvitation(invitation) &&
                            !invitation.consent_given &&
                            !invitation.declined_at && (
                                <i className="fa-duotone fa-regular fa-sparkles text-sm text-warning" />
                            )}
                        <div className="flex items-center gap-3">
                            {candidate?.profile_picture ? (
                                <img
                                    src={candidate.profile_picture}
                                    alt={name}
                                    className="w-8 h-8 shrink-0 object-cover border border-base-300"
                                />
                            ) : (
                                <div className="w-8 h-8 shrink-0 flex items-center justify-center border border-base-300 bg-base-200 text-xs font-bold text-base-content/60">
                                    {getInitials(name)}
                                </div>
                            )}
                            <span className="font-bold text-sm">
                                {name}
                            </span>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3 text-sm text-base-content/60">
                    {candidate?.email || "--"}
                </td>
                <td className="px-4 py-3 text-sm text-base-content/50">
                    {candidate?.current_title || "--"}
                </td>
                <td className="px-4 py-3">
                    <span
                        className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(invitation)}`}
                    >
                        <i
                            className={`fa-duotone fa-regular ${status.icon} mr-1`}
                        />
                        {status.label}
                    </span>
                </td>
                <td className="px-4 py-3 text-sm text-base-content/50">
                    {candidate?.location || "--"}
                </td>
                <td className="px-4 py-3 text-sm text-base-content/50">
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
                        className="p-0 bg-base-100 border-t-2 border-b-2 border-base-300"
                    >
                        <InvitationDetail
                            invitation={invitation}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
