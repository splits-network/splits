"use client";

import { Fragment } from "react";
import { useUserProfile } from "@/contexts";
import type { RecruiterCompanyRelationship } from "../../types";
import {
    getStatusLabel,
    getCounterpartyName,
    getCounterpartySubtext,
} from "../../types";
import { statusColor } from "../shared/status-color";
import { isNew, postedAgo } from "../shared/helpers";
import { ConnectionDetail } from "../shared/connection-detail";
import ConnectionActionsToolbar from "../shared/actions-toolbar";

export function TableRow({
    invitation,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    invitation: RecruiterCompanyRelationship;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { isCompanyUser } = useUserProfile();
    const counterpartyName = getCounterpartyName(invitation, isCompanyUser);
    const counterpartySubtext = getCounterpartySubtext(invitation, isCompanyUser);

    const rowBase = isSelected
        ? "bg-primary/5 border-l-4 border-l-primary"
        : `border-l-4 border-l-transparent ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`;

    return (
        <Fragment>
            {/* Main row */}
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors ${rowBase}`}
            >
                {/* Chevron */}
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? "text-primary" : "text-base-content/30"}`}
                    />
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        {isNew(invitation) && invitation.status === "pending" && (
                            <i
                                className="fa-duotone fa-regular fa-sparkles text-sm text-warning"
                                title="New in the last 7 days"
                            />
                        )}
                        <span className="font-bold text-sm text-base-content">
                            {counterpartyName}
                        </span>
                    </div>
                </td>

                {/* Details */}
                <td className="px-4 py-3 text-sm font-semibold text-base-content/70">
                    {counterpartySubtext || "—"}
                </td>

                {/* Type */}
                <td className="px-4 py-3 text-sm text-base-content/60 capitalize">
                    {invitation.relationship_type}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                    <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] font-bold ${statusColor(invitation.status)}`}
                    >
                        {getStatusLabel(invitation.status)}
                    </span>
                </td>

                {/* Jobs */}
                <td className="px-4 py-3 text-sm text-base-content">
                    {invitation.can_manage_company_jobs ? (
                        <i className="fa-duotone fa-regular fa-check text-success" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-xmark text-base-content/20" />
                    )}
                </td>

                {/* Received */}
                <td className="px-4 py-3 text-sm text-base-content/50">
                    {postedAgo(invitation)}
                </td>

                {/* Actions */}
                <td
                    className="px-4 py-3 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap z-10">
                        <ConnectionActionsToolbar
                            invitation={invitation}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                        />
                    </div>
                </td>
            </tr>

            {/* Expanded detail row */}
            {isSelected && (
                <tr>
                    <td
                        colSpan={colSpan}
                        className="p-0 bg-base-100 border-t-2 border-b-2 border-primary"
                    >
                        <ConnectionDetail
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
