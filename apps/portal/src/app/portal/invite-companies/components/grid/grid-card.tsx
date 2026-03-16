"use client";

import { useState } from "react";
import type { CompanyInvitation } from "../../types";
import { statusColorName, statusBorder, statusIcon } from "../shared/status-color";
import { BaselBadge } from "@splits-network/basel-ui";
import {
    formatStatus,
    getDaysUntilExpiry,
    isExpiringSoon,
    createdAgo,
    recruiterName,
    recruiterInitials,
} from "../shared/helpers";
import InvitationActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
    invitation,
    isSelected,
    onSelect,
    onRefresh,
}: {
    invitation: CompanyInvitation;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const daysLeft = invitation.expires_at
        ? getDaysUntilExpiry(invitation.expires_at)
        : null;
    const name = invitation.company_name_hint || "Company Invitation";
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    const recName = recruiterName(invitation);
    const expiring = isExpiringSoon(invitation);

    // Inline metadata
    const metaItems: { icon: string; color: string; value: string; muted: boolean; tooltip: string }[] = [
        { icon: "fa-hashtag", color: "text-primary", value: invitation.invite_code, muted: false, tooltip: "Invite code" },
        { icon: "fa-clock", color: daysLeft !== null && daysLeft <= 3 ? "text-error" : "text-accent", value: daysLeft !== null ? (daysLeft > 0 ? `${daysLeft}d remaining` : "Expired") : "\u2014", muted: daysLeft === null, tooltip: "Days until expiry" },
        { icon: "fa-user-tie", color: "text-secondary", value: recName, muted: false, tooltip: "Invited by" },
    ];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-colors",
                isSelected
                    ? `${statusBorder(invitation.status)} bg-primary/5`
                    : "border-l-base-300 hover:border-base-content/20",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                {/* Avatar + Name block */}
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 shrink-0 mt-0.5 bg-primary text-primary-content flex items-center justify-center text-sm font-black tracking-tight select-none">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            Company
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                        <p className={`text-sm truncate mt-0.5 ${invitation.invited_email ? "text-base-content/50" : "text-base-content/30"}`}>
                            {invitation.invited_email || "No email specified"}
                        </p>
                    </div>
                    {/* Copy code button */}
                    <div className="shrink-0 mt-1" onClick={(e) => e.stopPropagation()}>
                        <CopyButton value={invitation.invite_code} />
                    </div>
                </div>

                {/* Created ago */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/50">
                    <span className="flex items-center gap-1.5 shrink-0">
                        <i className="fa-duotone fa-regular fa-paper-plane text-xs text-accent" />
                        {createdAgo(invitation)}
                    </span>
                </div>
            </div>

            {/* Inline metadata: code · days left · recruiter */}
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
                    <BaselBadge color={statusColorName(invitation.status)} variant="soft-outline" size="sm" icon={statusIcon(invitation.status)}>
                        {formatStatus(invitation.status)}
                    </BaselBadge>
                    {expiring && (
                        <BaselBadge color="error" variant="soft-outline" size="sm" icon="fa-clock">
                            Expiring
                        </BaselBadge>
                    )}
                    {invitation.email_sent_at && (
                        <BaselBadge color="success" variant="soft" size="sm" icon="fa-envelope-circle-check">
                            Sent
                        </BaselBadge>
                    )}
                    {invitation.personal_message && (
                        <BaselBadge color="info" variant="soft" size="sm" icon="fa-message">
                            Message
                        </BaselBadge>
                    )}
                </div>
            </div>

            {/* Footer: actions */}
            <div
                className="flex items-center justify-end px-5 py-3 border-t border-base-300"
                onClick={(e) => e.stopPropagation()}
            >
                <InvitationActionsToolbar
                    invitation={invitation}
                    variant="icon-only"
                    size="sm"
                    onRefresh={onRefresh}
                    showActions={{
                        copyCode: false,
                        copyLink: false,
                        share: true,
                        resend: true,
                        revoke: false,
                    }}
                />
            </div>
        </article>
    );
}

function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button onClick={handleCopy} className="btn btn-sm btn-ghost btn-square tooltip tooltip-bottom" data-tip="Copy invite code">
            <i className={`fa-duotone fa-regular ${copied ? "fa-check text-success" : "fa-copy text-base-content/40"}`} />
        </button>
    );
}
