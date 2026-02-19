"use client";

import type { CompanyInvitation } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    formatStatus,
    createdAgo,
    isExpiringSoon,
    getDaysUntilExpiry,
} from "../shared/helpers";

export function SplitItem({
    invitation,
    isSelected,
    onSelect,
}: {
    invitation: CompanyInvitation;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const daysLeft = invitation.expires_at
        ? getDaysUntilExpiry(invitation.expires_at)
        : null;

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Row 1: name + posted time */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    {isExpiringSoon(invitation) && (
                        <i className="fa-duotone fa-regular fa-clock text-warning text-xs flex-shrink-0" />
                    )}
                    <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                        {invitation.company_name_hint || "Company Invitation"}
                    </h4>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {createdAgo(invitation)}
                </span>
            </div>

            {/* Row 2: email */}
            {invitation.invited_email && (
                <div className="text-sm font-semibold text-base-content/60 mb-1 truncate">
                    {invitation.invited_email}
                </div>
            )}

            {/* Row 3: code + status */}
            <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-mono font-bold tracking-wider text-base-content/70">
                    {invitation.invite_code}
                </span>
                <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold flex-shrink-0 ${statusColor(invitation.status)}`}
                >
                    {formatStatus(invitation.status)}
                </span>
            </div>

            {/* Row 4: days left + tags */}
            <div className="flex items-center gap-3">
                {daysLeft !== null && (
                    <span className={`text-sm font-bold ${daysLeft <= 3 ? "text-error" : "text-base-content/40"}`}>
                        {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                    </span>
                )}
                {invitation.email_sent_at && (
                    <span className="text-sm text-success">
                        <i className="fa-duotone fa-regular fa-envelope-circle-check mr-1" />
                        Sent
                    </span>
                )}
            </div>
        </div>
    );
}
