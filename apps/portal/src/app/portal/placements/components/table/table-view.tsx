"use client";

import { Fragment } from "react";
import type { Placement } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    candidateName,
    jobTitle,
    companyName,
    formatDate,
    formatCurrency,
    formatStatus,
    isNew,
} from "../shared/helpers";
import { DetailPanel } from "../shared/detail-panel";

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
                                className={`px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 ${i === 0 ? "w-8" : ""}`}
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
                            : `border-l-4 border-l-transparent ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`;

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
                                                <i
                                                    className="fa-duotone fa-regular fa-sparkles text-sm text-warning"
                                                    title="Placed in the last 7 days"
                                                />
                                            )}
                                            <span className="font-bold text-sm text-base-content">
                                                {candidateName(placement)}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Job */}
                                    <td className="px-4 py-3 text-sm font-semibold text-base-content/70">
                                        {jobTitle(placement)}
                                    </td>

                                    {/* Company */}
                                    <td className="px-4 py-3 text-sm font-semibold text-base-content/70">
                                        {companyName(placement)}
                                    </td>

                                    {/* Salary */}
                                    <td className="px-4 py-3 text-sm font-bold text-base-content">
                                        {formatCurrency(placement.salary || 0)}
                                    </td>

                                    {/* Your Share */}
                                    <td className="px-4 py-3 text-sm font-bold text-primary">
                                        {formatCurrency(
                                            placement.recruiter_share || 0,
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] font-bold ${statusColor(state)}`}
                                        >
                                            {formatStatus(state)}
                                        </span>
                                    </td>

                                    {/* Hired date */}
                                    <td className="px-4 py-3 text-sm text-base-content/50">
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
                                            <DetailPanel
                                                placement={placement}
                                                onClose={() =>
                                                    onSelect(placement)
                                                }
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
