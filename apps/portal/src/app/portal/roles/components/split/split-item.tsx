"use client";

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

export function SplitItem({
    job,
    accent,
    isSelected,
    onSelect,
}: {
    job: Job;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const ac = accent;

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer p-4 transition-colors border-b-2 border-dark/10 border-l-4 ${
                isSelected
                    ? `${ac.bgLight} ${ac.border}`
                    : "bg-white border-transparent"
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                    {isNew(job) && (
                        <i className="fa-duotone fa-regular fa-sparkles text-sm flex-shrink-0 text-yellow" />
                    )}
                    <h4 className="font-black text-sm uppercase tracking-tight truncate text-dark">
                        {job.title}
                    </h4>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-dark/40">
                    {postedAgo(job)}
                </span>
            </div>
            <div className={`text-sm font-bold mb-1 ${ac.text}`}>
                {companyName(job)}
            </div>
            <div className="flex items-center justify-between">
                {job.location && (
                    <span className="text-sm text-dark/50">
                        <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                        {job.location}
                    </span>
                )}
                <Badge variant={statusVariant(job.status)}>
                    {formatStatus(job.status)}
                </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-bold text-dark/70">
                    {salaryDisplay(job) || "Competitive"}
                </span>
                <span className="text-sm font-bold text-purple">
                    {job.fee_percentage}%
                </span>
                <span className="text-sm text-dark/40">
                    {job.application_count ?? 0} apps
                </span>
            </div>
        </div>
    );
}
