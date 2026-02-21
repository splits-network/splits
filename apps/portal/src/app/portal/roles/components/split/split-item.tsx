"use client";

import type { Job } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    salaryDisplay,
    formatStatus,
    isNew,
    postedAgo,
    companyName,
} from "../shared/helpers";
import RoleActionsToolbar from "../shared/actions-toolbar";

export function SplitItem({
    job,
    isSelected,
    onSelect,
    onRefresh,
}: {
    job: Job;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    return (
        <div
            onClick={onSelect}
            className={`relative cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Row 1: title + posted time */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    {isNew(job) && (
                        <i className="fa-duotone fa-regular fa-star text-primary text-xs flex-shrink-0" />
                    )}
                    <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                        {job.title}
                    </h4>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {postedAgo(job)}
                </span>
            </div>

            {/* Row 2: company name */}
            <div className="text-sm font-semibold text-base-content/60 mb-1 truncate">
                {companyName(job)}
            </div>

            {/* Row 3: location + status pill */}
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-sm text-base-content/50 truncate">
                    {job.location ? (
                        <>
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {job.location}
                        </>
                    ) : null}
                </div>
                <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold flex-shrink-0 ${statusColor(
                        job.status,
                    )}`}
                >
                    {formatStatus(job.status)}
                </span>
            </div>

            {/* Row 4: salary, fee %, application count */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-base-content/70">
                    {salaryDisplay(job) || "Competitive"}
                </span>
                <span className="text-sm font-bold text-accent">
                    {job.fee_percentage}%
                </span>
                <span className="text-sm text-base-content/40">
                    {job.application_count ?? 0} apps
                </span>
            </div>

            {/* Actions */}
            <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
                <RoleActionsToolbar
                    job={job}
                    variant="icon-only"
                    size="xs"
                    showActions={{ viewDetails: false }}
                    onRefresh={onRefresh}
                />
            </div>
        </div>
    );
}
