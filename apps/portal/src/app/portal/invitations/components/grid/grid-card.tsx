"use client";

import type { Invitation } from "../../types";
import { getDisplayStatus } from "../../types";
import { statusBadgeClass, statusBorder } from "../shared/status-color";
import {
    formatDateShort,
    timeAgo,
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

    const isExpiringSoon =
        invitation.invitation_expires_at &&
        !invitation.consent_given &&
        !invitation.declined_at &&
        new Date(invitation.invitation_expires_at).getTime() - Date.now() <
            3 * 24 * 60 * 60 * 1000;

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer bg-base-100 border border-base-300 border-l-4 transition-all",
                isSelected
                    ? `${borderClass} shadow-md`
                    : "border-l-base-300 hover:border-l-primary/50 hover:shadow-md",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-5 pt-5 pb-4">
                {/* Kicker + status badge */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 truncate">
                        Candidate Invitation
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`badge ${statusBadgeClass(invitation)}`}>
                            <i className={`fa-duotone fa-regular ${status.icon} mr-1`} />
                            {status.label}
                        </span>
                        {isRecentInvitation(invitation) &&
                            !invitation.consent_given &&
                            !invitation.declined_at && (
                                <span className="badge badge-warning badge-outline">
                                    <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                                    New
                                </span>
                            )}
                    </div>
                </div>

                {/* Avatar + Name */}
                <div className="flex items-end gap-3">
                    {candidate?.profile_picture ? (
                        <img
                            src={candidate.profile_picture}
                            alt={name}
                            className="w-14 h-14 shrink-0 object-cover border-2 border-base-300"
                        />
                    ) : (
                        <div className="w-14 h-14 shrink-0 bg-primary text-primary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
                            {getInitials(name)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Candidate
                        </p>
                        <h3 className="text-2xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                    </div>
                </div>

                {/* Meta: email + invited ago */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/40">
                    {candidate?.email && (
                        <span className="flex items-center gap-1.5 truncate">
                            <i className="fa-duotone fa-regular fa-envelope text-xs" />
                            {candidate.email}
                        </span>
                    )}
                    {candidate?.email && (
                        <span className="text-base-content/20">|</span>
                    )}
                    <span className="flex items-center gap-1.5 shrink-0">
                        <i className="fa-duotone fa-regular fa-paper-plane text-xs" />
                        {timeAgo(invitation.invited_at)}
                    </span>
                </div>
            </div>

            {/* Title & Company */}
            {(candidate?.current_title || candidate?.current_company) && (
                <div className="px-5 py-3 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1">
                        Role
                    </p>
                    <p className="text-sm font-semibold text-base-content/70">
                        {candidate.current_title}
                        {candidate.current_title && candidate.current_company && " at "}
                        {candidate.current_company}
                    </p>
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 divide-x divide-base-300 border-b border-base-300">
                <div className="px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                        Invited
                    </p>
                    <p className="text-sm font-bold text-base-content">
                        {formatDateShort(invitation.invited_at) || "N/A"}
                    </p>
                </div>
                <div className="px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                        Expires
                    </p>
                    <p className={`text-sm font-bold ${isExpiringSoon ? "text-error" : "text-base-content"}`}>
                        {formatDateShort(invitation.invitation_expires_at) || "N/A"}
                    </p>
                </div>
            </div>

            {/* Tags */}
            <div className="px-5 py-3 border-b border-base-300">
                <div className="flex flex-wrap gap-1.5">
                    {candidate?.location && (
                        <span className="badge badge-outline badge-sm">
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {candidate.location}
                        </span>
                    )}
                    {isExpiringSoon && (
                        <span className="badge badge-error badge-outline badge-sm">
                            <i className="fa-duotone fa-regular fa-clock mr-1" />
                            Expiring
                        </span>
                    )}
                    {!candidate?.location && !isExpiringSoon && (
                        <span className="text-sm text-base-content/20 italic">
                            No tags
                        </span>
                    )}
                </div>
            </div>

            {/* Footer: actions */}
            <div className="px-5 py-3 flex items-center justify-end">
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
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
        </article>
    );
}
