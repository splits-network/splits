"use client";

import type { Job } from "../../types";
import {
    salaryDisplay,
    isNew,
    postedAgo,
    companyName,
    matchScoreTextColor,
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
            className={`cursor-pointer px-5 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors ${
                isSelected
                    ? "bg-primary/5 border-l-2 border-l-primary"
                    : "bg-base-100"
            }`}
        >
            {/* Title + match score */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    {isNew(job) && (
                        <i className="fa-duotone fa-regular fa-sparkles text-warning text-xs flex-shrink-0" />
                    )}
                    <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                        {job.title}
                    </h4>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {job.match_score != null && (
                        <span className={`text-sm font-black ${matchScoreTextColor(job.match_score)}`}>
                            {Math.round(job.match_score)}%
                        </span>
                    )}
                    <span className="text-sm whitespace-nowrap text-base-content/40">
                        {postedAgo(job)}
                    </span>
                </div>
            </div>

            {/* Company */}
            <div className="text-sm font-semibold text-base-content/60 mb-1 truncate">
                {name}
            </div>

            {/* Location */}
            <div className={`text-sm truncate mb-1 ${job.location ? "text-base-content/50" : "text-base-content/30"}`}>
                <i className={`fa-duotone fa-regular fa-location-dot mr-1 ${job.location ? "text-info" : "text-base-content/20"}`} />
                {job.location || "Location not specified"}
            </div>

            {/* Salary */}
            <div className="flex items-center gap-1 mt-1">
                <i className={`fa-duotone fa-regular fa-dollar-sign text-xs ${salary ? "text-success" : "text-base-content/20"}`} />
                <span className={`text-sm font-bold ${salary ? "text-base-content/70" : "text-base-content/30"}`}>
                    {salary || "Not listed"}
                </span>
            </div>
        </div>
    );
}
