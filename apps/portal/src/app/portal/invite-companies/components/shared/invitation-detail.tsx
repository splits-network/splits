"use client";

import { Badge } from "@splits-network/memphis-ui";
import type { CompanyInvitation } from "../../types";
import type { AccentClasses } from "./accent";
import { statusVariant } from "./accent";
import {
    formatStatus,
    formatDate,
    getDaysUntilExpiry,
    isExpiringSoon,
    getInviteLink,
    recruiterName,
    recruiterInitials,
} from "./helpers";
import InvitationActionsToolbar from "./actions-toolbar";

// ─── Detail Panel ───────────────────────────────────────────────────────────

export function InvitationDetail({
    invitation,
    accent,
    onClose,
    onRefresh,
}: {
    invitation: CompanyInvitation;
    accent: AccentClasses;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const name = recruiterName(invitation);
    const daysLeft = invitation.expires_at
        ? getDaysUntilExpiry(invitation.expires_at)
        : null;
    const expiringSoon = isExpiringSoon(invitation);

    return (
        <div>
            {/* Header */}
            <div className={`p-6 border-b-4 ${accent.border}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <Badge color={statusVariant(invitation.status)} className="mb-3">
                            {formatStatus(invitation.status)}
                        </Badge>
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2 text-dark">
                            {invitation.company_name_hint || "Company Invitation"}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            {invitation.invited_email && (
                                <span className={`font-bold ${accent.text}`}>
                                    <i className="fa-duotone fa-regular fa-envelope mr-1" />
                                    {invitation.invited_email}
                                </span>
                            )}
                            <span className="text-dark/50">|</span>
                            <span className="text-dark/70">
                                <i className="fa-duotone fa-regular fa-calendar mr-1" />
                                Created {formatDate(invitation.created_at)}
                            </span>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className={`btn btn-xs btn-square btn-ghost flex-shrink-0 ${accent.text}`}
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    )}
                </div>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {invitation.email_sent_at && (
                        <Badge color="teal" variant="outline">
                            <i className="fa-duotone fa-regular fa-envelope-circle-check mr-1" />
                            Email Sent
                        </Badge>
                    )}
                    {expiringSoon && (
                        <Badge color="coral" variant="outline">
                            <i className="fa-duotone fa-regular fa-clock mr-1" />
                            Expires Soon
                        </Badge>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-4">
                    <InvitationActionsToolbar
                        invitation={invitation}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div className={`grid grid-cols-3 border-b-4 ${accent.border}`}>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {invitation.invite_code}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Invite Code
                    </div>
                </div>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {daysLeft !== null ? (daysLeft > 0 ? `${daysLeft}d` : "Expired") : "—"}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Days Left
                    </div>
                </div>
                <div className="p-4 text-center">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {invitation.status === "accepted" ? "Yes" : "No"}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Accepted
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Personal Message */}
                {invitation.personal_message && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="badge badge-xs badge-purple">
                                <i className="fa-duotone fa-regular fa-message" />
                            </span>
                            Personal Message
                        </h3>
                        <p className="text-sm text-dark/80 whitespace-pre-wrap">
                            {invitation.personal_message}
                        </p>
                    </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 border-2 border-dark/20">
                        <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Invite Link
                        </div>
                        <div className="text-sm font-bold text-dark truncate">
                            {getInviteLink(invitation)}
                        </div>
                    </div>
                    <div className="p-3 border-2 border-dark/20">
                        <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                            Expires
                        </div>
                        <div className="text-sm font-bold text-dark">
                            {invitation.expires_at
                                ? formatDate(invitation.expires_at)
                                : "—"}
                        </div>
                    </div>
                    {invitation.accepted_at && (
                        <div className="p-3 border-2 border-teal/40">
                            <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                Accepted
                            </div>
                            <div className="text-sm font-bold text-teal">
                                {formatDate(invitation.accepted_at)}
                            </div>
                        </div>
                    )}
                    {invitation.email_sent_at && (
                        <div className="p-3 border-2 border-dark/20">
                            <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                Email Sent
                            </div>
                            <div className="text-sm font-bold text-dark">
                                {formatDate(invitation.email_sent_at)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Recruiter Info */}
                <div className={`p-4 border-4 ${accent.border}`}>
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 text-dark">
                        Invited By
                    </h3>
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-12 h-12 flex items-center justify-center border-2 ${accent.border} bg-cream font-bold text-sm text-dark`}
                        >
                            {recruiterInitials(name)}
                        </div>
                        <div>
                            <div className="font-bold text-sm text-dark">
                                {name}
                            </div>
                            {invitation.recruiter?.user?.email && (
                                <div className={`text-sm ${accent.text}`}>
                                    {invitation.recruiter.user.email}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
