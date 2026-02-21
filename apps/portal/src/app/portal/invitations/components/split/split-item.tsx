"use client";

import type { Invitation } from "../../types";
import { getDisplayStatus } from "../../types";
import { statusColor, statusBorder } from "../shared/status-color";
import {
    getInitials,
    isRecentInvitation,
    timeAgo,
    candidateName,
} from "../shared/helpers";
import ActionsToolbar from "../shared/actions-toolbar";

export function SplitItem({
    invitation,
    isSelected,
    onSelect,
    onRefresh,
}: {
    invitation: Invitation;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const candidate = invitation.candidate;
    const name = candidateName(invitation);
    const status = getDisplayStatus(invitation);
    const borderClass = statusBorder(invitation);

    return (
        <div
            onClick={onSelect}
            className={`relative cursor-pointer p-4 transition-colors border-b border-base-200 border-l-4 ${
                isSelected
                    ? `bg-base-200/50 ${borderClass}`
                    : "bg-base-100 border-transparent hover:bg-base-200/30"
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                    {isRecentInvitation(invitation) &&
                        !invitation.consent_given &&
                        !invitation.declined_at && (
                            <i className="fa-duotone fa-regular fa-sparkles text-sm flex-shrink-0 text-warning" />
                        )}
                    <div className="flex items-center gap-2">
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
                        <h4 className="font-black text-sm tracking-tight truncate">
                            {name}
                        </h4>
                    </div>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/30">
                    {timeAgo(invitation.invited_at)}
                </span>
            </div>
            {candidate?.email && (
                <div className="text-sm text-base-content/50 mb-1 truncate pl-10">
                    {candidate.email}
                </div>
            )}
            <div className="flex items-center justify-between pl-10">
                <span className="text-sm text-base-content/40">
                    {candidate?.current_title && (
                        <>
                            <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                            {candidate.current_title}
                        </>
                    )}
                </span>
                <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-0.5 ${statusColor(invitation)}`}
                >
                    <i
                        className={`fa-duotone fa-regular ${status.icon} mr-1`}
                    />
                    {status.label}
                </span>
            </div>
            {candidate?.location && (
                <div className="flex items-center gap-3 mt-1 pl-10">
                    <span className="text-sm text-base-content/40">
                        <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                        {candidate.location}
                    </span>
                </div>
            )}

            {/* Actions */}
            <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
                <ActionsToolbar
                    invitation={invitation}
                    variant="icon-only"
                    size="xs"
                    showActions={{ viewCandidate: false }}
                    onRefresh={onRefresh}
                />
            </div>
        </div>
    );
}
