"use client";

import { Fragment } from "react";
import { Badge } from "@splits-network/memphis-ui";
import type { Job } from "../../roles/types";
import { accentAt, statusVariant } from "./accent";
import {
    salaryDisplay,
    formatStatus,
    isNew,
    postedAgo,
    companyName,
} from "./helpers";
import { DetailLoader } from "./job-detail";
import RoleActionsToolbar from "./actions-toolbar";

export function TableView({
    jobs,
    onSelect,
    selectedId,
    onRefresh,
}: {
    jobs: Job[];
    onSelect: (j: Job) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const columns = ["", "Title", "Company", "Location", "Salary", "Fee %", "Status", "Apps", "Posted", ""];

    return (
        <div className="overflow-x-auto border-4 border-dark">
            <table className="w-full" style={{ minWidth: 900 }}>
                <thead>
                    <tr className="bg-dark">
                        {columns.map((h, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${i === 0 ? "w-8" : ""} ${accentAt(i).text}`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job, idx) => {
                        const ac = accentAt(idx);
                        const isSelected = selectedId === job.id;
                        return (
                            <Fragment key={job.id}>
                                <tr
                                    onClick={() => onSelect(job)}
                                    className={`cursor-pointer transition-colors border-l-4 ${
                                        isSelected
                                            ? `${ac.bgLight} ${ac.border}`
                                            : `border-transparent ${idx % 2 === 0 ? "bg-white" : "bg-cream"}`
                                    }`}
                                >
                                    <td className="px-4 py-3 w-8">
                                        <i
                                            className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-[10px] transition-transform ${isSelected ? ac.text : "text-dark/40"}`}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {isNew(job) && (
                                                <i className="fa-duotone fa-regular fa-sparkles text-[10px] text-yellow" />
                                            )}
                                            <span className="font-bold text-sm text-dark">
                                                {job.title}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={`px-4 py-3 text-sm font-semibold ${ac.text}`}>
                                        {companyName(job)}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-dark/70">
                                        {job.location || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold text-dark">
                                        {salaryDisplay(job) || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold text-purple">
                                        {job.fee_percentage}%
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={statusVariant(job.status)}>
                                            {formatStatus(job.status)}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-bold text-dark">
                                        {job.application_count ?? 0}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-dark/60">
                                        {postedAgo(job)}
                                    </td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex gap-1 justify-end">
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
                                            colSpan={columns.length}
                                            className={`p-0 bg-white border-t-4 border-b-4 ${ac.border}`}
                                        >
                                            <DetailLoader
                                                jobId={job.id}
                                                accent={ac}
                                                onClose={() => onSelect(job)}
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
