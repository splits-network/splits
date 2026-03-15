"use client";

import { Fragment } from "react";
import type { Job } from "../../types";
import { BaselBadge } from "@splits-network/basel-ui";
import {
    salaryDisplay,
    formatEmploymentType,
    isNew,
    postedAgo,
    companyName,
    matchScoreTextColor,
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
        ? "bg-primary/5 border-l-2 border-l-primary"
        : `${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`;

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
                            isSelected ? "fa-chevron-down" : "fa-chevron-right"
                        } text-sm transition-transform ${
                            isSelected ? "text-primary" : "text-base-content/30"
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
                <td className={`px-4 py-3 text-sm hidden md:table-cell ${job.location ? "text-base-content/60" : "text-base-content/30"}`}>
                    {job.location || "Not listed"}
                </td>

                {/* Salary */}
                <td className={`px-4 py-3 text-sm font-bold hidden lg:table-cell ${salary ? "text-base-content" : "text-base-content/30 font-normal"}`}>
                    {salary || "Not listed"}
                </td>

                {/* Type */}
                <td className="px-4 py-3 hidden xl:table-cell">
                    <BaselBadge variant="outline" size="sm">
                        {formatEmploymentType(job.employment_type)}
                    </BaselBadge>
                </td>

                {/* Match */}
                <td className="px-4 py-3 hidden lg:table-cell">
                    {job.match_score != null ? (
                        <span className={`text-sm font-black ${matchScoreTextColor(job.match_score)}`}>
                            {Math.round(job.match_score)}%
                        </span>
                    ) : (
                        <span className="text-sm text-base-content/30">&mdash;</span>
                    )}
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
                        <JobDetailLoader jobId={job.id} onClose={onSelect} />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
