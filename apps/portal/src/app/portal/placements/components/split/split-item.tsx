"use client";

import type { Placement } from "../../types";
import { statusColorName, statusBorder } from "../shared/status-color";
import { BaselBadge, BaselAvatar } from "@splits-network/basel-ui";
import {
    candidateName,
    candidateInitials,
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
            className={`cursor-pointer px-6 py-4 border-b border-base-300 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : `bg-base-100 ${statusBorder(state)}`
            }`}
        >
            {/* Row 1: avatar + candidate name + time ago */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                    <BaselAvatar
                        initials={candidateInitials(placement)}
                        alt={candidateName(placement)}
                        size="xs"
                    />
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
                    <span className="tooltip tooltip-bottom" data-tip="Job title">
                        <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                    </span>
                    {jobTitle(placement)}
                </div>
                <BaselBadge color={statusColorName(state)} size="xs" variant="soft">
                    {formatStatus(state)}
                </BaselBadge>
            </div>

            {/* Row 4: salary + your share */}
            <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${placement.salary ? "text-base-content/70" : "text-base-content/30"}`}>
                    {placement.salary ? formatCurrency(placement.salary) : "\u2014"}
                </span>
                <span className={`text-sm font-bold ${placement.recruiter_share ? "text-primary" : "text-base-content/30"}`}>
                    {placement.recruiter_share ? `${formatCurrency(placement.recruiter_share)} share` : "\u2014"}
                </span>
            </div>
        </div>
    );
}
