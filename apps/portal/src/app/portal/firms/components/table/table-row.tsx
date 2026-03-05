"use client";

import { Fragment } from "react";
import type { Firm } from "../../types";
import { formatCurrency } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    formatStatus,
    createdAgo,
    memberCountDisplay,
} from "../shared/helpers";
import { FirmDetailLoader } from "../shared/firm-detail-loader";
import { FirmActionsToolbar } from "../shared/actions-toolbar";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";

export function TableRow({
    firm,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    firm: Firm;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { getLevel } = useGamification();
    const firmLevel = firm.id ? getLevel(firm.id) : undefined;

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

                {/* Firm Name */}
                <td className="px-4 py-3">
                    <span className="font-bold text-sm text-base-content inline-flex items-center gap-1.5">
                        {firm.name}
                        {firmLevel && <LevelBadge level={firmLevel} size="sm" />}
                    </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                    <span
                        className={`inline-flex items-center px-2 py-0.5 text-sm uppercase tracking-[0.15em] font-bold ${statusColor(firm.status)}`}
                    >
                        {formatStatus(firm.status)}
                    </span>
                </td>

                {/* Members */}
                <td className="px-4 py-3 text-sm text-base-content/70">
                    {memberCountDisplay(firm)}
                </td>

                {/* Placements */}
                <td className="px-4 py-3 text-sm font-bold text-base-content">
                    {firm.total_placements}
                </td>

                {/* Revenue */}
                <td className="px-4 py-3 text-sm font-bold text-primary">
                    {formatCurrency(firm.total_revenue)}
                </td>

                {/* Created */}
                <td className="px-4 py-3 text-sm text-base-content/50">
                    {createdAgo(firm)}
                </td>

                {/* Actions */}
                <td
                    className="px-4 py-3 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap">
                        <FirmActionsToolbar
                            firm={firm}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                            showActions={{
                                inviteMember: false,
                            }}
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
                        <FirmDetailLoader
                            firmId={firm.id}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
