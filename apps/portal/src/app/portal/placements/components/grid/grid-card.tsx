"use client";

import type { Placement } from "../../types";
import { statusColorName, statusBorder } from "../shared/status-color";
import { BaselBadge } from "@splits-network/basel-ui";
import {
    isNew,
    candidateName,
    candidateInitials,
    companyInitials,
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
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-all w-full",
                isSelected
                    ? `${statusBorder(state)} shadow-md`
                    : "border-l-primary shadow-sm hover:shadow-md",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-5 pt-5 pb-4">
                {/* Kicker row: status + NEW badge */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40">
                        Placement
                    </p>
                    <div className="flex items-center gap-2">
                        {isNew(placement) && (
                            <BaselBadge color="warning" variant="soft" size="sm" icon="fa-sparkles">
                                New
                            </BaselBadge>
                        )}
                        <BaselBadge color={statusColorName(state)} size="sm">
                            {formatStatus(state)}
                        </BaselBadge>
                    </div>
                </div>

                {/* Overlapping avatars + Name block */}
                <div className="flex items-end gap-3">
                    <div className="relative shrink-0 w-14 h-14">
                        {/* Candidate avatar (left, on top) */}
                        <div className="absolute top-0 left-0 w-10 h-10 bg-primary text-primary-content flex items-center justify-center text-xs font-black tracking-tight select-none z-10 border-2 border-base-300">
                            {candidateInitials(placement)}
                        </div>
                        {/* Company avatar (offset right, behind) */}
                        <div className="absolute bottom-0 right-0 w-10 h-10 bg-secondary text-secondary-content flex items-center justify-center text-xs font-black tracking-tight select-none border-2 border-base-300">
                            {companyInitials(placement)}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {candidateName(placement)}
                        </h3>
                        <p className="text-sm font-semibold text-base-content/50 mt-1 truncate">
                            {jobTitle(placement)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Placement Details */}
            <div className="px-5 py-4 border-b border-base-300">
                <div className="flex items-center gap-3 text-sm text-base-content/60 flex-wrap">
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-calendar-check text-xs text-primary" />
                        {formatDate(placement.hired_at)}
                    </span>
                    <span className="text-base-content/20">|</span>
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-building text-xs text-primary" />
                        {companyName(placement)}
                    </span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="border-b border-base-300">
                <div className="grid grid-cols-3 divide-x divide-base-300">
                    {/* Salary */}
                    <div className="flex items-center gap-2 px-2 py-3 min-w-0 overflow-hidden">
                        <div className="w-7 h-7 flex items-center justify-center shrink-0 bg-primary text-primary-content">
                            <i className="fa-duotone fa-regular fa-dollar-sign text-xs" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-sm font-black text-base-content leading-none block truncate">
                                {formatCurrency(placement.salary || 0)}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none">
                                Salary
                            </span>
                        </div>
                    </div>

                    {/* Fee % */}
                    <div className="flex items-center gap-2 px-2 py-3 min-w-0 overflow-hidden">
                        <div className="w-7 h-7 flex items-center justify-center shrink-0 bg-secondary text-secondary-content">
                            <i className="fa-duotone fa-regular fa-percent text-xs" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-sm font-black text-base-content leading-none block truncate">
                                {placement.fee_percentage || 0}%
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none">
                                Fee
                            </span>
                        </div>
                    </div>

                    {/* Share */}
                    <div className="flex items-center gap-2 px-2 py-3 min-w-0 overflow-hidden">
                        <div className="w-7 h-7 flex items-center justify-center shrink-0 bg-accent text-accent-content">
                            <i className="fa-duotone fa-regular fa-coins text-xs" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-sm font-black text-base-content leading-none block truncate">
                                {formatCurrency(placement.recruiter_share || 0)}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none">
                                Share
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: guarantee + status badge */}
            <div className="px-5 py-4 mt-auto">
                <div className="flex items-center justify-between">
                    {placement.guarantee_days !== undefined &&
                    placement.guarantee_days !== null ? (
                        <span className="flex items-center gap-1.5 text-sm text-base-content/50">
                            <i className="fa-duotone fa-regular fa-shield-check text-xs" />
                            {placement.guarantee_days}d guarantee
                        </span>
                    ) : (
                        <span />
                    )}
                    <BaselBadge color={statusColorName(state)} icon="fa-shield-check">
                        {formatStatus(state)}
                    </BaselBadge>
                </div>
            </div>
        </article>
    );
}
