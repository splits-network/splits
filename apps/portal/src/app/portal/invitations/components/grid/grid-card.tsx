"use client";

import type { Invitation } from "../../types";
import { getDisplayStatus } from "../../types";
import { statusColor, statusBorder } from "../shared/status-color";
import {
    formatDateShort,
    getInitials,
    isRecentInvitation,
    candidateName,
} from "../shared/helpers";
import ActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
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
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected
                    ? `border-primary border-l-4 ${borderClass}`
                    : "border-base-200",
            ].join(" ")}
        >
            {/* Top row: status pill + NEW badge */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(invitation)}`}
                >
                    <i
                        className={`fa-duotone fa-regular ${status.icon} mr-1`}
                    />
                    {status.label}
                </span>

                {isRecentInvitation(invitation) &&
                    !invitation.consent_given &&
                    !invitation.declined_at && (
                        <span className="text-[10px] uppercase tracking-wider bg-warning/15 text-warning px-2 py-1">
                            <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                            New
                        </span>
                    )}
            </div>

            {/* Avatar + Name */}
            <div className="flex items-center gap-3 mb-2">
                {candidate?.profile_picture ? (
                    <img
                        src={candidate.profile_picture}
                        alt={name}
                        className="w-10 h-10 shrink-0 object-cover border-2 border-base-300"
                    />
                ) : (
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-base-300 bg-base-200 text-sm font-bold text-base-content/60">
                        {getInitials(name)}
                    </div>
                )}
                <div className="min-w-0">
                    <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors truncate">
                        {name}
                    </h3>
                    {candidate?.email && (
                        <div className="text-sm text-base-content/50 truncate">
                            {candidate.email}
                        </div>
                    )}
                </div>
            </div>

            {/* Title & Company */}
            {(candidate?.current_title || candidate?.current_company) && (
                <div className="text-sm font-semibold text-base-content/60 mb-2">
                    {candidate.current_title}
                    {candidate.current_title &&
                        candidate.current_company &&
                        " at "}
                    {candidate.current_company}
                </div>
            )}

            {/* Invited date */}
            <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-bold text-base-content/60">
                    <i className="fa-duotone fa-regular fa-paper-plane mr-1" />
                    {formatDateShort(invitation.invited_at)}
                </span>
            </div>

            {/* Location */}
            {candidate?.location && (
                <div className="flex flex-wrap gap-1 mb-4">
                    <span className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1">
                        <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                        {candidate.location}
                    </span>
                </div>
            )}

            {/* Footer: expiry + actions */}
            <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-base-200">
                <div className="text-sm text-base-content/40">
                    <i className="fa-duotone fa-regular fa-clock mr-1" />
                    Expires{" "}
                    {formatDateShort(invitation.invitation_expires_at) || "N/A"}
                </div>
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
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
            </div>
        </div>
    );
}
