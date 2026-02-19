"use client";

import type { CompanyInvitation } from "../../types";
import { statusColor, statusIcon } from "../shared/status-color";
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
    const name = recruiterName(invitation);

    return (
        <div
            onClick={onSelect}
            className={[
                "group cursor-pointer bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected ? "border-primary border-l-4" : "border-base-200",
            ].join(" ")}
        >
            {/* Top row: status pill + expiring badge */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(invitation.status)}`}
                >
                    <i className={`fa-duotone fa-regular ${statusIcon(invitation.status)} mr-1`} />
                    {formatStatus(invitation.status)}
                </span>

                {isExpiringSoon(invitation) && (
                    <span className="text-[10px] uppercase tracking-wider bg-error/15 text-error px-2 py-1">
                        <i className="fa-duotone fa-regular fa-clock mr-1" />
                        Expiring
                    </span>
                )}
            </div>

            {/* Name */}
            <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors mb-1">
                {invitation.company_name_hint || "Company Invitation"}
            </h3>

            {/* Email */}
            {invitation.invited_email && (
                <div className="text-sm font-semibold text-base-content/60 mb-2">
                    <i className="fa-duotone fa-regular fa-envelope mr-1" />
                    {invitation.invited_email}
                </div>
            )}

            {/* Code + Days left */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-black font-mono tracking-wider text-base-content">
                    {invitation.invite_code}
                </span>
                {daysLeft !== null && (
                    <span className={`text-sm font-bold ${daysLeft <= 3 ? "text-error" : "text-base-content/50"}`}>
                        {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                    </span>
                )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
                {invitation.email_sent_at && (
                    <span className="text-[10px] uppercase tracking-wider bg-success/15 text-success px-2 py-0.5">
                        <i className="fa-duotone fa-regular fa-envelope-circle-check mr-1" />
                        Sent
                    </span>
                )}
                {invitation.personal_message && (
                    <span className="text-[10px] uppercase tracking-wider bg-info/15 text-info px-2 py-0.5">
                        <i className="fa-duotone fa-regular fa-message mr-1" />
                        Message
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-base-200">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-base-200 border border-base-300 text-xs font-bold text-base-content/60">
                        {recruiterInitials(name)}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-base-content truncate">
                            {name}
                        </div>
                        <div className="text-xs text-base-content/40 truncate">
                            {createdAgo(invitation)}
                        </div>
                    </div>
                </div>
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <InvitationActionsToolbar
                        invitation={invitation}
                        variant="icon-only"
                        size="xs"
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
        </div>
    );
}
