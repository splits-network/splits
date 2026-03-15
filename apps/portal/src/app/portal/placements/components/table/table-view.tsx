"use client";

import { Fragment } from "react";
import type { Placement } from "../../types";
import { statusColorName } from "../shared/status-color";
import { BaselBadge } from "@splits-network/basel-ui";
import {
    candidateName,
    jobTitle,
    companyName,
    formatDate,
    formatCurrency,
    formatStatus,
    isNew,
} from "../shared/helpers";
import { DetailLoader } from "../shared/placement-detail";

const COLUMNS = [
    "",
    "Candidate",
    "Job",
    "Company",
    "Salary",
    "Your Share",
    "Status",
    "Hired",
] as const;

export function TableView({
    placements,
    onSelect,
    selectedId,
    onRefresh,
}: {
    placements: Placement[];
    onSelect: (p: Placement) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    return (
        <div className="overflow-x-auto border-2 border-base-300">
            <table className="w-full" style={{ minWidth: 900 }}>
                <thead>
                    <tr className="bg-base-200 border-b-2 border-base-300">
                        {COLUMNS.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-sm uppercase tracking-[0.2em] font-bold text-base-content/40 ${i === 0 ? "w-8" : ""}`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {placements.map((placement, idx) => {
                        const isSelected = selectedId === placement.id;
                        const state = placement.state || "unknown";
                        const rowBase = isSelected
                            ? "bg-primary/5 border-l-4 border-l-primary"
                            : `border-l-4 border-l-transparent ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"} hover:bg-primary/5`;

                        return (
                            <Fragment key={placement.id}>
                                <tr
                                    onClick={() => onSelect(placement)}
                                    className={`cursor-pointer transition-colors ${rowBase}`}
                                >
                                    {/* Chevron */}
                                    <td className="px-4 py-3 w-8">
                                        <i
                                            className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? "text-primary" : "text-base-content/30"}`}
                                        />
                                    </td>

                                    {/* Candidate */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {isNew(placement) && (
                                                <span className="tooltip tooltip-bottom" data-tip="Placed in the last 7 days">
                                                    <i className="fa-duotone fa-regular fa-sparkles text-sm text-warning" />
                                                </span>
                                            )}
                                            <span className="font-bold text-sm text-base-content">
                                                {candidateName(placement)}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Job */}
                                    <td className={`px-4 py-3 text-sm font-semibold ${placement.job?.title ? "text-base-content/70" : "text-base-content/30"}`}>
                                        {jobTitle(placement)}
                                    </td>

                                    {/* Company */}
                                    <td className={`px-4 py-3 text-sm font-semibold ${placement.job?.company?.name ? "text-base-content/70" : "text-base-content/30"}`}>
                                        {companyName(placement)}
                                    </td>

                                    {/* Salary */}
                                    <td className={`px-4 py-3 text-sm font-bold ${placement.salary ? "text-base-content" : "text-base-content/30"}`}>
                                        {placement.salary ? formatCurrency(placement.salary) : "\u2014"}
                                    </td>

                                    {/* Your Share */}
                                    <td className={`px-4 py-3 text-sm font-bold ${placement.recruiter_share ? "text-primary" : "text-base-content/30"}`}>
                                        {placement.recruiter_share ? formatCurrency(placement.recruiter_share) : "\u2014"}
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3">
                                        <BaselBadge color={statusColorName(state)} size="xs" variant="soft">
                                            {formatStatus(state)}
                                        </BaselBadge>
                                    </td>

                                    {/* Hired date */}
                                    <td className={`px-4 py-3 text-sm ${placement.hired_at ? "text-base-content/50" : "text-base-content/30"}`}>
                                        {formatDate(placement.hired_at)}
                                    </td>
                                </tr>

                                {/* Expanded detail row */}
                                {isSelected && (
                                    <tr>
                                        <td
                                            colSpan={COLUMNS.length}
                                            className="p-0 bg-base-100 border-t-2 border-b-2 border-primary"
                                        >
                                            <DetailLoader
                                                placementId={placement.id}
                                                onClose={() =>
                                                    onSelect(placement)
                                                }
                                                onRefresh={onRefresh}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
