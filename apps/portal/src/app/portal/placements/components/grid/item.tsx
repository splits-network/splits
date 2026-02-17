"use client";

import { Badge } from "@splits-network/memphis-ui";
import {
    Placement,
    getStatusDisplay,
    formatCurrency,
    formatPlacementDate,
} from "../../types";

interface ItemProps {
    item: Placement;
    onViewDetails: () => void;
}

// Cycle through accent colors
const ACCENT_COLORS = ["coral", "teal", "yellow", "purple"] as const;

export default function Item({ item, onViewDetails }: ItemProps) {
    const status = getStatusDisplay(item);
    const accentColor =
        ACCENT_COLORS[
            Math.abs(
                item.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0),
            ) % 4
        ];

    return (
        <div
            className="border-4 border-dark bg-white p-5 transition-transform hover:-translate-y-1 cursor-pointer relative"
            onClick={onViewDetails}
        >
            {/* Corner accent */}
            <div
                className={`absolute top-0 right-0 w-8 h-8 bg-${accentColor}`}
            />

            {/* Header */}
            <div className="mb-4">
                <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-1 text-dark">
                    {item.candidate?.full_name || "Unknown Candidate"}
                </h3>
                <div className="text-sm font-bold text-${accentColor}">
                    {item.job?.company?.name || "N/A"}
                </div>
            </div>

            {/* Job Title */}
            <div className="mb-3">
                <div className="flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-briefcase text-xs text-dark opacity-60" />
                    <span className="text-xs font-bold text-dark">
                        {item.job?.title || "Unknown Job"}
                    </span>
                </div>
            </div>

            {/* Salary and Earnings */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-black text-dark">
                    {formatCurrency(item.salary || 0)}
                </span>
                <span className={`text-xs font-bold text-${accentColor}`}>
                    {formatCurrency(item.recruiter_share || 0)} earned
                </span>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between mb-3">
                <Badge
                    color={
                        item.state === "hired"
                            ? "teal"
                            : item.state === "pending_payout"
                              ? "yellow"
                              : "purple"
                    }
                    size="sm"
                >
                    <i
                        className={`fa-duotone fa-regular ${status.icon} mr-1`}
                    ></i>
                    {status.label}
                </Badge>
            </div>

            {/* Date */}
            <div
                className={`pt-3 border-t-2 border-${accentColor} border-opacity-30`}
            >
                <div className="flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-calendar-check text-xs text-dark opacity-60" />
                    <span className="text-xs text-dark opacity-60 font-bold uppercase tracking-wider">
                        {formatPlacementDate(item.hired_at)}
                    </span>
                </div>
            </div>
        </div>
    );
}
