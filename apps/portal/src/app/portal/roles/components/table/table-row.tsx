"use client";

import { Fragment } from "react";
import { Badge } from "@splits-network/memphis-ui";
import type { Job } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
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
    accent,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    job: Job;
    accent: AccentClasses;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;

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
                        {isNew(job) && (
                            <i className="fa-duotone fa-regular fa-sparkles text-sm text-yellow" />
                        )}
                        <span className="font-bold text-sm text-dark">
                            {job.title}
                        </span>
                    </div>
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${ac.text}`}>
                    {companyName(job)}
                </td>
                <td className="px-4 py-3 text-sm text-dark/70">
                    {job.location || "—"}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-dark">
                    {salaryDisplay(job) || "—"}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-purple">
                    {job.fee_percentage}%
                </td>
                <td className="px-4 py-3">
                    <Badge color={statusVariant(job.status)}>
                        {formatStatus(job.status)}
                    </Badge>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-dark">
                    {job.application_count ?? 0}
                </td>
                <td className="px-4 py-3 text-sm text-dark/60">
                    {postedAgo(job)}
                </td>
                <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap z-10">
                        <RoleActionsToolbar
                            job={job}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                            showActions={{
                                viewDetails: false,
                                statusActions: false,
                                share: false,
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
                        <DetailLoader
                            jobId={job.id}
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
