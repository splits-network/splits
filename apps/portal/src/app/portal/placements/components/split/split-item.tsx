"use client";

import type { Placement } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    candidateName,
    jobTitle,
    companyName,
    timeAgo,
    formatCurrency,
    formatStatus,
} from "../shared/helpers";

export function SplitItem({
    placement,
    isSelected,
    onSelect,
}: {
    placement: Placement;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const state = placement.state || "unknown";

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Row 1: candidate name + time ago */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                        {candidateName(placement)}
                    </h4>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {timeAgo(placement.hired_at)}
                </span>
            </div>

            {/* Row 2: company name */}
            <div className="text-sm font-semibold text-base-content/60 mb-1 truncate">
                {companyName(placement)}
            </div>

            {/* Row 3: job title + status */}
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-sm text-base-content/50 truncate">
                    <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                    {jobTitle(placement)}
                </div>
                <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold flex-shrink-0 ${statusColor(state)}`}
                >
                    {formatStatus(state)}
                </span>
            </div>

            {/* Row 4: salary + your share */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-base-content/70">
                    {formatCurrency(placement.salary || 0)}
                </span>
                <span className="text-sm font-bold text-primary">
                    {formatCurrency(placement.recruiter_share || 0)} share
                </span>
            </div>
        </div>
    );
}
