"use client";

import type { Invitation } from "../../types";
import { getDisplayStatus } from "../../types";
import { statusColorName, statusBorder } from "../shared/status-color";
import { BaselBadge } from "@splits-network/basel-ui";
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
    const title = candidate?.current_title || null;
    const company = candidate?.current_company || null;
    const headline = title && company ? `${title} at ${company}` : title || company || null;

    const isExpiringSoon =
        invitation.invitation_expires_at &&
        !invitation.consent_given &&
        !invitation.declined_at &&
        new Date(invitation.invitation_expires_at).getTime() - Date.now() <
            3 * 24 * 60 * 60 * 1000;

    // Inline metadata
    const metaItems: { icon: string; color: string; value: string; muted: boolean; tooltip: string }[] = [
        { icon: "fa-paper-plane", color: "text-primary", value: formatDateShort(invitation.invited_at) || "\u2014", muted: !invitation.invited_at, tooltip: "Invited date" },
        { icon: "fa-clock", color: isExpiringSoon ? "text-error" : "text-accent", value: formatDateShort(invitation.invitation_expires_at) || "\u2014", muted: !invitation.invitation_expires_at, tooltip: "Expires" },
        { icon: "fa-location-dot", color: "text-info", value: candidate?.location || "\u2014", muted: !candidate?.location, tooltip: "Location" },
    ];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-colors",
                isSelected
                    ? `${borderClass} bg-primary/5`
                    : "border-l-base-300 hover:border-base-content/20",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                {/* Avatar + Name block */}
                <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                        {candidate?.profile_picture ? (
                            <img
                                src={candidate.profile_picture}
                                alt={name}
                                className="w-12 h-12 object-cover border border-base-300"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center text-sm font-black tracking-tight select-none">
                                {getInitials(name)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            Candidate
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                        <p className={`text-sm truncate mt-0.5 ${headline ? "text-base-content/50" : "text-base-content/30"}`}>
                            {headline || "No title specified"}
                        </p>
                    </div>
                </div>

                {/* Email + invited ago */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/50">
                    {candidate?.email && (
                        <>
                            <span className="flex items-center gap-1.5 truncate">
                                <i className="fa-duotone fa-regular fa-envelope text-xs text-secondary" />
                                {candidate.email}
                            </span>
                            <span className="text-base-content/20">|</span>
                        </>
                    )}
                    <span className="flex items-center gap-1.5 shrink-0">
                        <i className="fa-duotone fa-regular fa-paper-plane text-xs text-accent" />
                        {timeAgo(invitation.invited_at)}
                    </span>
                </div>
            </div>

            {/* Inline metadata: invited · expires · location */}
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                {metaItems.map((item, i) => (
                    <span key={i} className={`tooltip tooltip-bottom flex items-center gap-1 ${item.muted ? "text-base-content/30" : "text-base-content/50"}`} data-tip={item.tooltip}>
                        <i className={`fa-duotone fa-regular ${item.icon} ${item.muted ? "text-base-content/20" : item.color} text-xs`} />
                        <span className="truncate">{item.value}</span>
                    </span>
                ))}
            </div>

            {/* Badge row: emphasis (soft-outline) + default (soft) */}
            <div className="px-5 py-3 flex-1">
                <div className="flex flex-wrap gap-1.5">
                    <BaselBadge
                        color={statusColorName(invitation)}
                        variant="soft-outline"
                        size="sm"
                        icon={status.icon}
                    >
                        {status.label}
                    </BaselBadge>
                    {isRecentInvitation(invitation) &&
                        !invitation.consent_given &&
                        !invitation.declined_at && (
                            <BaselBadge color="warning" variant="soft-outline" size="sm" icon="fa-sparkles">
                                New
                            </BaselBadge>
                        )}
                    {isExpiringSoon && (
                        <BaselBadge color="error" variant="soft-outline" size="sm" icon="fa-clock">
                            Expiring
                        </BaselBadge>
                    )}
                    {candidate?.location && (
                        <BaselBadge color="neutral" variant="soft" size="sm" icon="fa-location-dot">
                            {candidate.location}
                        </BaselBadge>
                    )}
                </div>
            </div>

            {/* Footer: actions */}
            <div
                className="flex items-center justify-end px-5 py-3 border-t border-base-300"
                onClick={(e) => e.stopPropagation()}
            >
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
        </article>
    );
}
