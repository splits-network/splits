"use client";

import type { Placement } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    isNew,
    candidateName,
    jobTitle,
    companyName,
    formatCurrency,
    formatDate,
    formatStatus,
} from "../shared/helpers";

export function GridCard({
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
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected ? "border-primary border-l-4" : "border-base-200",
            ].join(" ")}
        >
            {/* Top row: status pill + NEW badge */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(state)}`}
                >
                    {formatStatus(state)}
                </span>

                {isNew(placement) && (
                    <span className="text-[10px] uppercase tracking-wider bg-warning/15 text-warning px-2 py-1">
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </span>
                )}
            </div>

            {/* Candidate name */}
            <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors mb-1">
                {candidateName(placement)}
            </h3>

            {/* Company */}
            <div className="text-sm font-semibold text-base-content/60 mb-2">
                {companyName(placement)}
            </div>

            {/* Job title */}
            <div className="flex items-center gap-1 text-sm text-base-content/50 mb-4">
                <i className="fa-duotone fa-regular fa-briefcase" />
                {jobTitle(placement)}
            </div>

            {/* Salary */}
            <div className="text-base font-black tracking-tight text-primary mb-3">
                {formatCurrency(placement.salary || 0)}
            </div>

            {/* Fee + share row */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-bold text-accent">
                    <i className="fa-duotone fa-regular fa-percent mr-1" />
                    {placement.fee_percentage || 0}% fee
                </span>
                <span className="text-sm font-bold text-base-content/60">
                    <i className="fa-duotone fa-regular fa-coins mr-1" />
                    {formatCurrency(placement.recruiter_share || 0)} share
                </span>
            </div>

            {/* Guarantee tag */}
            {placement.guarantee_days !== undefined &&
                placement.guarantee_days !== null && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        <span className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1">
                            {placement.guarantee_days}d guarantee
                        </span>
                    </div>
                )}

            {/* Footer: hired date */}
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-base-200">
                <span className="text-xs text-base-content/40">
                    <i className="fa-duotone fa-regular fa-calendar mr-1" />
                    {formatDate(placement.hired_at)}
                </span>
            </div>
        </div>
    );
}
