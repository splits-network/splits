"use client";

import type { CompanyInvitation } from "../../types";
import { statusColor, statusIcon } from "./status-color";
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

export function InvitationDetail({
    invitation,
    onClose,
    onRefresh,
}: {
    invitation: CompanyInvitation;
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
            <div className="sticky top-0 z-10 bg-base-100 border-b-2 border-base-300 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                                className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 ${statusColor(invitation.status)}`}
                            >
                                <i className={`fa-duotone fa-regular ${statusIcon(invitation.status)} mr-1`} />
                                {formatStatus(invitation.status)}
                            </span>
                            {invitation.email_sent_at && (
                                <span className="text-[10px] uppercase tracking-wider bg-success/15 text-success px-2 py-1">
                                    <i className="fa-duotone fa-regular fa-envelope-circle-check mr-1" />
                                    Email Sent
                                </span>
                            )}
                            {expiringSoon && (
                                <span className="text-[10px] uppercase tracking-wider bg-error/15 text-error px-2 py-1">
                                    <i className="fa-duotone fa-regular fa-clock mr-1" />
                                    Expires Soon
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight mb-3">
                            {invitation.company_name_hint || "Company Invitation"}
                        </h2>
                        <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                            {invitation.invited_email && (
                                <span>
                                    <i className="fa-duotone fa-regular fa-envelope mr-1" />
                                    {invitation.invited_email}
                                </span>
                            )}
                            <span>
                                <i className="fa-duotone fa-regular fa-calendar mr-1" />
                                Created {formatDate(invitation.created_at)}
                            </span>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
                        </button>
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

            {/* Content */}
            <div className="p-6 space-y-8">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Invite Code
                        </p>
                        <p className="text-lg font-black tracking-tight font-mono">
                            {invitation.invite_code}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Days Left
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {daysLeft !== null ? (daysLeft > 0 ? `${daysLeft}d` : "Expired") : "\u2014"}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Accepted
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {invitation.status === "accepted" ? "Yes" : "No"}
                        </p>
                    </div>
                </div>

                {/* Personal Message */}
                {invitation.personal_message && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Personal Message
                        </h3>
                        <div className="p-4 border-l-4 border-primary bg-primary/5 text-sm text-base-content/80 whitespace-pre-wrap">
                            {invitation.personal_message}
                        </div>
                    </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Invite Link
                        </p>
                        <p className="font-bold text-sm truncate">
                            {getInviteLink(invitation)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Expires
                        </p>
                        <p className="font-bold text-sm">
                            {invitation.expires_at
                                ? formatDate(invitation.expires_at)
                                : "\u2014"}
                        </p>
                    </div>
                    {invitation.accepted_at && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Accepted
                            </p>
                            <p className="font-bold text-sm text-success">
                                {formatDate(invitation.accepted_at)}
                            </p>
                        </div>
                    )}
                    {invitation.email_sent_at && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Email Sent
                            </p>
                            <p className="font-bold text-sm">
                                {formatDate(invitation.email_sent_at)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Recruiter Info */}
                <div className="border-t-2 border-base-300 pt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                        Invited By
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-sm">
                            {recruiterInitials(name)}
                        </div>
                        <div>
                            <p className="font-bold">{name}</p>
                            {invitation.recruiter?.user?.email && (
                                <p className="text-sm text-base-content/50">
                                    {invitation.recruiter.user.email}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
