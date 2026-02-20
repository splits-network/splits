"use client";

import type { Job } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    salaryDisplay,
    formatStatusLabel,
    isNew,
    postedAgo,
    companyName,
} from "../shared/helpers";

interface SplitItemProps {
    job: Job;
    isSelected: boolean;
    onSelect: () => void;
}

export function SplitItem({ job, isSelected, onSelect }: SplitItemProps) {
    const name = companyName(job);
    const salary = salaryDisplay(job);

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Title + posted time */}
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

            {/* Company */}
            <div className="text-sm font-semibold text-base-content/60 mb-1 truncate">
                {name}
            </div>

            {/* Location + status */}
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-sm text-base-content/50 truncate">
                    {job.location && (
                        <>
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {job.location}
                        </>
                    )}
                </div>
                <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold flex-shrink-0 ${statusColor(job.status)}`}
                >
                    {formatStatusLabel(job.status)}
                </span>
            </div>

            {/* Salary */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-base-content/70">
                    {salary || "Competitive"}
                </span>
            </div>
        </div>
    );
}
