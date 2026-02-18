"use client";

import { Badge, Card } from "@splits-network/memphis-ui";
import type { CompanyInvitation } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
import {
    formatStatus,
    formatDate,
    getDaysUntilExpiry,
    isExpiringSoon,
    createdAgo,
    recruiterName,
    recruiterInitials,
} from "../shared/helpers";
import InvitationActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
    invitation,
    accent,
    isSelected,
    onSelect,
    onRefresh,
}: {
    invitation: CompanyInvitation;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;
    const daysLeft = invitation.expires_at
        ? getDaysUntilExpiry(invitation.expires_at)
        : null;
    const name = recruiterName(invitation);

    return (
        <Card
            onClick={onSelect}
            className={`cursor-pointer border-4 transition-transform hover:-translate-y-1 relative ${isSelected ? ac.border : "border-dark/30"}`}
        >
            {/* Corner accent */}
            <div className={`absolute top-0 right-0 w-8 h-8 ${ac.bg}`} />

            <div className="card-body">
                <div className="flex items-center justify-between mb-2">
                    <Badge color={statusVariant(invitation.status)}>
                        {formatStatus(invitation.status)}
                    </Badge>
                    {isExpiringSoon(invitation) && (
                        <Badge color="coral" size="sm">
                            <i className="fa-duotone fa-regular fa-clock mr-1" />
                            Expiring
                        </Badge>
                    )}
                </div>

                <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-1 text-dark">
                    {invitation.company_name_hint || "Company Invitation"}
                </h3>

                {invitation.invited_email && (
                    <div className={`text-sm font-bold mb-2 ${ac.text}`}>
                        <i className="fa-duotone fa-regular fa-envelope mr-1" />
                        {invitation.invited_email}
                    </div>
                )}

                <div className="flex items-center gap-1 text-sm mb-3 text-dark/60">
                    <i className="fa-duotone fa-regular fa-calendar" />
                    {createdAgo(invitation)}
                </div>

                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-black text-dark font-mono tracking-wider">
                        {invitation.invite_code}
                    </span>
                    {daysLeft !== null && (
                        <span className={`text-sm font-bold ${daysLeft <= 3 ? "text-coral" : "text-dark/60"}`}>
                            {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                        </span>
                    )}
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap gap-1">
                    {invitation.email_sent_at && (
                        <Badge color="teal" variant="outline">
                            <i className="fa-duotone fa-regular fa-envelope-circle-check mr-1" />
                            Sent
                        </Badge>
                    )}
                    {invitation.personal_message && (
                        <Badge color="purple" variant="outline">
                            <i className="fa-duotone fa-regular fa-message mr-1" />
                            Message
                        </Badge>
                    )}
                </div>
            </div>
            <div
                className={`card-actions justify-between gap-3 pt-3 border-t-2 ${ac.border}/30`}
            >
                {/* Recruiter footer */}
                <div className="flex flex-row items-center gap-2 mt-2 min-w-0">
                    <div
                        className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 ${ac.border} bg-cream text-sm font-bold text-dark`}
                    >
                        {recruiterInitials(name)}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-dark truncate">
                            {name}
                        </div>
                        <div className="text-sm text-dark/50 truncate">
                            Recruiter
                        </div>
                    </div>
                </div>
                <div className="mt-2 shrink-0">
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
        </Card>
    );
}
