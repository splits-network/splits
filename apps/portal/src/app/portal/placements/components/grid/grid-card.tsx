"use client";

import type { Placement } from "../../types";
import { statusColorName } from "../shared/status-color";
import { BaselBadge, type BaselSemanticColor } from "@splits-network/basel-ui";
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
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-all hover:shadow-md",
                isSelected
                    ? "border-l-primary border-primary"
                    : "border-l-primary",
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

            {/* Stats Grid */}
            <div className="border-b border-base-300">
                <div className="grid grid-cols-2 divide-x divide-y divide-base-300">
                    {[
                        { label: "Salary", value: formatCurrency(placement.salary || 0), icon: "fa-duotone fa-regular fa-dollar-sign" },
                        { label: "Fee", value: `${placement.fee_percentage || 0}%`, icon: "fa-duotone fa-regular fa-percent" },
                        { label: "Share", value: formatCurrency(placement.recruiter_share || 0), icon: "fa-duotone fa-regular fa-coins" },
                        { label: "Guarantee", value: placement.guarantee_days != null ? `${placement.guarantee_days}d` : "N/A", icon: "fa-duotone fa-regular fa-shield-check" },
                    ].map((stat, i) => {
                        const colors = [
                            "bg-primary text-primary-content",
                            "bg-secondary text-secondary-content",
                            "bg-accent text-accent-content",
                            "bg-warning text-warning-content",
                        ];
                        return (
                            <div key={stat.label} className="flex items-center gap-2 px-2 py-3 min-w-0 overflow-hidden">
                                <div className={`w-7 h-7 flex items-center justify-center shrink-0 ${colors[i]}`}>
                                    <i className={`${stat.icon} text-xs`} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-sm font-black text-base-content leading-none block truncate">
                                        {stat.value}
                                    </span>
                                    <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none truncate block">
                                        {stat.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Split Partners */}
            <div className="px-5 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    Split Partners
                </p>
                {placement.splits && placement.splits.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {placement.splits.map((split, i) => {
                            const badgeColors: BaselSemanticColor[] = ["primary", "secondary", "accent"];
                            const color = badgeColors[i % badgeColors.length];
                            const name = split.recruiter?.user?.name || split.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                            return (
                                <div key={split.id} className="flex items-center justify-between">
                                    <BaselBadge color={color} size="sm" icon="fa-user">
                                        {name}
                                    </BaselBadge>
                                    <span className="text-sm font-black text-base-content">
                                        {split.split_percentage}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No split partners</p>
                )}
            </div>

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-2 min-w-0">
                    {placement.job?.company?.logo_url ? (
                        <img
                            src={placement.job.company.logo_url}
                            alt={companyName(placement)}
                            className="w-8 h-8 object-contain bg-base-100 border border-base-300 p-0.5"
                        />
                    ) : (
                        <div className="w-8 h-8 flex items-center justify-center bg-base-200 border border-base-300 text-sm font-bold text-base-content/60">
                            {companyInitials(placement)}
                        </div>
                    )}
                    <span className="text-sm font-semibold text-base-content truncate">
                        {companyName(placement)}
                    </span>
                </div>
            </div>
        </article>
    );
}
