"use client";

import { Fragment } from "react";
import type { CompanyInvitation } from "../../types";
import { statusColor, statusBorder, statusIcon } from "../shared/status-color";
import {
    formatStatus,
    createdAgo,
    isExpiringSoon,
    getDaysUntilExpiry,
} from "../shared/helpers";
import { InvitationDetail } from "../shared/invitation-detail";
import InvitationActionsToolbar from "../shared/actions-toolbar";

export function TableRow({
    invitation,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    invitation: CompanyInvitation;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const daysLeft = invitation.expires_at
        ? getDaysUntilExpiry(invitation.expires_at)
        : null;
    const borderClass = statusBorder(invitation.status);

    return (
        <Fragment>
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors border-l-4 ${
                    isSelected
                        ? `bg-base-200/50 ${borderClass}`
                        : `border-transparent ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`
                }`}
            >
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? "text-primary" : "text-base-content/30"}`}
                    />
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        {isExpiringSoon(invitation) && (
                            <i className="fa-duotone fa-regular fa-clock text-sm text-warning" />
                        )}
                        <span className="font-bold text-sm">
                            {invitation.company_name_hint || "\u2014"}
                        </span>
                    </div>
                </td>
                <td className="px-4 py-3 text-sm text-base-content/60">
                    {invitation.invited_email || "\u2014"}
                </td>
                <td className="px-4 py-3 text-sm font-mono font-bold tracking-wider text-base-content">
                    {invitation.invite_code}
                </td>
                <td className="px-4 py-3">
                    <span
                        className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(invitation.status)}`}
                    >
                        <i className={`fa-duotone fa-regular ${statusIcon(invitation.status)} mr-1`} />
                        {formatStatus(invitation.status)}
                    </span>
                </td>
                <td className="px-4 py-3 text-sm text-base-content/50">
                    {createdAgo(invitation)}
                </td>
                <td className="px-4 py-3 text-sm">
                    {daysLeft !== null ? (
                        <span className={`font-bold ${daysLeft <= 3 ? "text-error" : "text-base-content/50"}`}>
                            {daysLeft > 0 ? `${daysLeft}d` : "Expired"}
                        </span>
                    ) : (
                        <span className="text-base-content/30">{"\u2014"}</span>
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
                        className="p-0 bg-base-100 border-t-2 border-b-2 border-base-300"
                    >
                        <InvitationDetail
                            invitation={invitation}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
