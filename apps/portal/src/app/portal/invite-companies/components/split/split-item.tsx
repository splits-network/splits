"use client";

import { Badge } from "@splits-network/memphis-ui";
import type { CompanyInvitation } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
import {
    formatStatus,
    createdAgo,
    isExpiringSoon,
    getDaysUntilExpiry,
} from "../shared/helpers";

export function SplitItem({
    invitation,
    accent,
    isSelected,
    onSelect,
}: {
    invitation: CompanyInvitation;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const ac = accent;
    const daysLeft = invitation.expires_at
        ? getDaysUntilExpiry(invitation.expires_at)
        : null;

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer p-4 transition-colors border-b-2 border-dark/10 border-l-4 ${
                isSelected
                    ? `${ac.bgLight} ${ac.border}`
                    : "bg-white border-transparent"
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                    {isExpiringSoon(invitation) && (
                        <i className="fa-duotone fa-regular fa-clock text-sm flex-shrink-0 text-coral" />
                    )}
                    <h4 className="font-black text-sm uppercase tracking-tight truncate text-dark">
                        {invitation.company_name_hint || "Company Invitation"}
                    </h4>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-dark/40">
                    {createdAgo(invitation)}
                </span>
            </div>
            {invitation.invited_email && (
                <div className={`text-sm font-bold mb-1 ${ac.text}`}>
                    {invitation.invited_email}
                </div>
            )}
            <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold tracking-wider text-dark/70">
                    {invitation.invite_code}
                </span>
                <Badge color={statusVariant(invitation.status)}>
                    {formatStatus(invitation.status)}
                </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1">
                {daysLeft !== null && (
                    <span className={`text-sm font-bold ${daysLeft <= 3 ? "text-coral" : "text-dark/40"}`}>
                        {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                    </span>
                )}
                {invitation.email_sent_at && (
                    <span className="text-sm text-teal">
                        <i className="fa-duotone fa-regular fa-envelope-circle-check mr-1" />
                        Sent
                    </span>
                )}
            </div>
        </div>
    );
}
