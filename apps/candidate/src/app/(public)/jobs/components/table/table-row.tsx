"use client";

import { Fragment } from "react";
import type { Job } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    salaryDisplay,
    formatEmploymentType,
    formatStatusLabel,
    isNew,
    postedAgo,
    companyName,
} from "../shared/helpers";
import { JobDetailLoader } from "../shared/job-detail";

interface TableRowProps {
    job: Job;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
}

export function TableRow({
    job,
    idx,
    isSelected,
    colSpan,
    onSelect,
}: TableRowProps) {
    const name = companyName(job);
    const salary = salaryDisplay(job);
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
                        className={`fa-duotone fa-regular ${
                            isSelected
                                ? "fa-chevron-down"
                                : "fa-chevron-right"
                        } text-sm transition-transform ${
                            isSelected
                                ? "text-primary"
                                : "text-base-content/30"
                        }`}
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
                    {name}
                </td>

                {/* Location */}
                <td className="px-4 py-3 text-sm text-base-content/60 hidden md:table-cell">
                    {job.location || "\u2014"}
                </td>

                {/* Salary */}
                <td className="px-4 py-3 text-sm font-bold text-base-content hidden lg:table-cell">
                    {salary || "\u2014"}
                </td>

                {/* Type */}
                <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1">
                        {formatEmploymentType(job.employment_type)}
                    </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                    <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] font-bold ${statusColor(job.status)}`}
                    >
                        {formatStatusLabel(job.status)}
                    </span>
                </td>

                {/* Posted */}
                <td className="px-4 py-3 text-sm text-base-content/50 hidden md:table-cell">
                    {postedAgo(job)}
                </td>
            </tr>

            {/* Expanded detail */}
            {isSelected && (
                <tr>
                    <td
                        colSpan={colSpan}
                        className="p-0 bg-base-100 border-t-2 border-b-2 border-primary"
                    >
                        <JobDetailLoader
                            jobId={job.id}
                            onClose={onSelect}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
