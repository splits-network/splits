"use client";

import { useState } from "react";
import type { CompanyInvitation } from "../../types";
import { statusBadgeClass, statusBorder, statusIcon } from "../shared/status-color";
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

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer bg-base-100 border border-base-300 border-l-4 transition-all",
                isSelected
                    ? `${statusBorder(invitation.status)} shadow-md`
                    : "border-l-base-300 hover:border-l-primary/50 hover:shadow-md",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-5 pt-5 pb-4">
                {/* Kicker + status badge */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 truncate">
                        Company Invitation
                    </p>
                    <span className={`badge ${statusBadgeClass(invitation.status)} shrink-0`}>
                        <i className={`fa-duotone fa-regular ${statusIcon(invitation.status)} mr-1`} />
                        {formatStatus(invitation.status)}
                    </span>
                </div>

                {/* Avatar + Name */}
                <div className="flex items-end gap-3">
                    <div className="w-14 h-14 shrink-0 bg-primary text-primary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Company
                        </p>
                        <h3 className="text-2xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                    </div>
                </div>

                {/* Meta: email + created */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/40">
                    {invitation.invited_email && (
                        <span className="flex items-center gap-1.5 truncate">
                            <i className="fa-duotone fa-regular fa-envelope text-xs" />
                            {invitation.invited_email}
                        </span>
                    )}
                    {invitation.invited_email && (
                        <span className="text-base-content/20">|</span>
                    )}
                    <span className="flex items-center gap-1.5 shrink-0">
                        <i className="fa-duotone fa-regular fa-clock text-xs" />
                        {createdAgo(invitation)}
                    </span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 divide-x divide-base-300 border-b border-base-300">
                <div className="px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                        Invite Code
                    </p>
                    <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-black font-mono tracking-wider text-base-content truncate">
                            {invitation.invite_code}
                        </p>
                        <CopyButton value={invitation.invite_code} />
                    </div>
                </div>
                <div className="px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                        Days Left
                    </p>
                    <p className={`text-sm font-black ${daysLeft !== null && daysLeft <= 3 ? "text-error" : "text-base-content"}`}>
                        {daysLeft !== null
                            ? daysLeft > 0
                                ? `${daysLeft}d`
                                : "Expired"
                            : "\u2014"}
                    </p>
                </div>
            </div>

            {/* Tags */}
            <div className="px-5 py-3 border-b border-base-300">
                <div className="flex flex-wrap gap-1.5">
                    {invitation.email_sent_at && (
                        <span className="badge badge-success badge-outline badge-sm">
                            <i className="fa-duotone fa-regular fa-envelope-circle-check mr-1" />
                            Sent
                        </span>
                    )}
                    {invitation.personal_message && (
                        <span className="badge badge-info badge-outline badge-sm">
                            <i className="fa-duotone fa-regular fa-message mr-1" />
                            Message
                        </span>
                    )}
                    {isExpiringSoon(invitation) && (
                        <span className="badge badge-error badge-outline badge-sm">
                            <i className="fa-duotone fa-regular fa-clock mr-1" />
                            Expiring
                        </span>
                    )}
                    {!invitation.email_sent_at &&
                        !invitation.personal_message &&
                        !isExpiringSoon(invitation) && (
                            <span className="text-sm text-base-content/20 italic">
                                No tags
                            </span>
                        )}
                </div>
            </div>

            {/* Footer: recruiter + actions */}
            <div className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-base-200 border border-base-300 text-xs font-bold text-base-content/60">
                        {recruiterInitials(recName)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-base-content truncate">
                            {recName}
                        </p>
                    </div>
                </div>
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
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
        <button onClick={handleCopy} className="btn btn-xs btn-ghost btn-square">
            <i className={`fa-duotone fa-regular text-base ${copied ? "fa-check text-success" : "fa-copy text-base-content/40"}`} />
        </button>
    );
}
