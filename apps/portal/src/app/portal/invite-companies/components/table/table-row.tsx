"use client";

import { Fragment } from "react";
import { Badge } from "@splits-network/memphis-ui";
import type { CompanyInvitation } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
import {
    formatStatus,
    formatDate,
    createdAgo,
    isExpiringSoon,
    getDaysUntilExpiry,
} from "../shared/helpers";
import { InvitationDetail } from "../shared/invitation-detail";
import InvitationActionsToolbar from "../shared/actions-toolbar";

export function TableRow({
    invitation,
    accent,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    invitation: CompanyInvitation;
    accent: AccentClasses;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;
    const daysLeft = invitation.expires_at
        ? getDaysUntilExpiry(invitation.expires_at)
        : null;

    return (
        <Fragment>
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors border-l-4 ${
                    isSelected
                        ? `${ac.bgLight} ${ac.border}`
                        : `border-transparent ${idx % 2 === 0 ? "bg-white" : "bg-cream"}`
                }`}
            >
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? ac.text : "text-dark/40"}`}
                    />
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        {isExpiringSoon(invitation) && (
                            <i className="fa-duotone fa-regular fa-clock text-sm text-coral" />
                        )}
                        <span className="font-bold text-sm text-dark">
                            {invitation.company_name_hint || "—"}
                        </span>
                    </div>
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${ac.text}`}>
                    {invitation.invited_email || "—"}
                </td>
                <td className="px-4 py-3 text-sm font-mono font-bold tracking-wider text-dark">
                    {invitation.invite_code}
                </td>
                <td className="px-4 py-3">
                    <Badge color={statusVariant(invitation.status)}>
                        {formatStatus(invitation.status)}
                    </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-dark/60">
                    {createdAgo(invitation)}
                </td>
                <td className="px-4 py-3 text-sm">
                    {daysLeft !== null ? (
                        <span className={`font-bold ${daysLeft <= 3 ? "text-coral" : "text-dark/60"}`}>
                            {daysLeft > 0 ? `${daysLeft}d` : "Expired"}
                        </span>
                    ) : (
                        <span className="text-dark/40">—</span>
                    )}
                </td>
                <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap z-10">
                        <InvitationActionsToolbar
                            invitation={invitation}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                            showActions={{
                                copyCode: false,
                                copyLink: true,
                                share: false,
                                resend: false,
                                revoke: false,
                            }}
                        />
                    </div>
                </td>
            </tr>
            {isSelected && (
                <tr>
                    <td
                        colSpan={colSpan}
                        className={`p-0 bg-white border-t-4 border-b-4 ${ac.border}`}
                    >
                        <InvitationDetail
                            invitation={invitation}
                            accent={ac}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
