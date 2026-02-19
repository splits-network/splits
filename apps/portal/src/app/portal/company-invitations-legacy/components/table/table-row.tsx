"use client";

import { Fragment } from "react";
import { Badge } from "@splits-network/memphis-ui";
import { useUserProfile } from "@/contexts";
import type { RecruiterCompanyRelationship } from "../../types";
import {
    getStatusLabel,
    formatDate,
    getCounterpartyName,
    getCounterpartySubtext,
    getInitials,
    isRecent,
    timeAgo,
} from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
import { ConnectionDetail } from "../shared/connection-detail";
import ConnectionActionsToolbar from "../shared/actions-toolbar";

export function TableRow({
    invitation,
    accent,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    invitation: RecruiterCompanyRelationship;
    accent: AccentClasses;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;
    const { isCompanyUser } = useUserProfile();
    const counterpartyName = getCounterpartyName(invitation, isCompanyUser);
    const counterpartySubtext = getCounterpartySubtext(invitation, isCompanyUser);

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
                        {isRecent(invitation) && invitation.status === "pending" && (
                            <i className="fa-duotone fa-regular fa-sparkles text-sm text-yellow" />
                        )}
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-8 h-8 shrink-0 flex items-center justify-center border-2 ${ac.border} bg-cream text-xs font-bold text-dark`}
                            >
                                {getInitials(counterpartyName)}
                            </div>
                            <span className="font-bold text-sm text-dark">
                                {counterpartyName}
                            </span>
                        </div>
                    </div>
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${ac.text}`}>
                    {counterpartySubtext || "--"}
                </td>
                <td className="px-4 py-3 text-sm text-dark/70 capitalize">
                    {invitation.relationship_type}
                </td>
                <td className="px-4 py-3">
                    <Badge color={statusVariant(invitation.status)}>
                        {getStatusLabel(invitation.status)}
                    </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-dark/60">
                    {invitation.can_manage_company_jobs ? (
                        <i className="fa-duotone fa-regular fa-check-circle text-teal" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-times-circle text-dark/30" />
                    )}
                </td>
                <td className="px-4 py-3 text-sm text-dark/60">
                    {timeAgo(invitation.created_at)}
                </td>
                <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap z-10">
                        <ConnectionActionsToolbar
                            invitation={invitation}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                            showActions={{
                                accept: true,
                                decline: true,
                                terminate: true,
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
                        <ConnectionDetail
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
