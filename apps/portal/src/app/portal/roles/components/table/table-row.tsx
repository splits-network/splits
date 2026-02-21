"use client";

import { Fragment } from "react";
import type { Job } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    salaryDisplay,
    formatStatus,
    isNew,
    postedAgo,
    companyName,
} from "../shared/helpers";
import { DetailLoader } from "../shared/job-detail";
import RoleActionsToolbar from "../shared/actions-toolbar";

export function TableRow({
    job,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
    onUpdateItem,
}: {
    job: Job;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Job>) => void;
}) {
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

                {/* Title */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        {isNew(job) && (
                            <i
                                className="fa-duotone fa-regular fa-sparkles text-sm text-warning"
                                title="New in the last 7 days"
                            />
                        )}
                        <span className="font-bold text-sm text-base-content">
                            {job.title}
                        </span>
                    </div>
                </td>

                {/* Company */}
                <td className="px-4 py-3 text-sm font-semibold text-base-content/70">
                    {companyName(job)}
                </td>

                {/* Location */}
                <td className="px-4 py-3 text-sm text-base-content/60">
                    {job.location || "—"}
                </td>

                {/* Salary */}
                <td className="px-4 py-3 text-sm font-bold text-base-content">
                    {salaryDisplay(job) || "—"}
                </td>

                {/* Fee % */}
                <td className="px-4 py-3 text-sm font-bold text-primary">
                    {job.fee_percentage}%
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                    <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] font-bold ${statusColor(job.status)}`}
                    >
                        {formatStatus(job.status)}
                    </span>
                </td>

                {/* Apps */}
                <td className="px-4 py-3 text-sm font-bold text-base-content">
                    {job.application_count ?? 0}
                </td>

                {/* Posted */}
                <td className="px-4 py-3 text-sm text-base-content/50">
                    {postedAgo(job)}
                </td>

                {/* Actions */}
                <td
                    className="px-4 py-3 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap z-100">
                        <RoleActionsToolbar
                            job={job}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                            onUpdateItem={onUpdateItem}
                            showActions={{
                                viewDetails: false,
                                statusActions: false,
                                share: false,
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
                        <DetailLoader
                            jobId={job.id}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                            onUpdateItem={onUpdateItem}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
