"use client";

import { BaselBadge, type BaselSemanticColor } from "@splits-network/basel-ui";
import type { PlacementCardData } from "./data";

const GUARANTEE_COLORS: Record<PlacementCardData["status"], BaselSemanticColor> = {
    Active: "success",
    Completed: "primary",
    "Guarantee Period": "warning",
};

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function PlacementCardEditorial({
    placement,
}: {
    placement: PlacementCardData;
}) {
    const guaranteeColor = GUARANTEE_COLORS[placement.status];

    return (
        <article className="bg-base-100 border border-base-300 border-l-4 border-l-primary w-full max-w-md">
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-6 pb-5">
                {/* Kicker row: industry + status */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40">
                        {placement.industry}
                    </p>
                    <BaselBadge color={guaranteeColor} size="sm">
                        {placement.status}
                    </BaselBadge>
                </div>

                {/* Overlapping avatars + Name block */}
                <div className="flex items-end gap-4">
                    <div className="relative shrink-0 w-16 h-16">
                        {/* Candidate avatar (left, on top) */}
                        <div className="absolute top-0 left-0 w-12 h-12 bg-primary text-primary-content flex items-center justify-center text-sm font-black tracking-tight select-none z-10 border-2 border-base-300">
                            {placement.candidateInitials}
                        </div>
                        {/* Company avatar (offset right, behind) */}
                        <div className="absolute bottom-0 right-0 w-12 h-12 bg-secondary text-secondary-content flex items-center justify-center text-sm font-black tracking-tight select-none border-2 border-base-300">
                            {placement.companyInitials}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Placement
                        </p>
                        <h2 className="text-3xl font-black tracking-tight leading-none text-base-content truncate">
                            {placement.candidateName}
                        </h2>
                        <p className="text-sm font-semibold text-base-content/50 mt-1">
                            {placement.roleTitle}
                        </p>
                    </div>
                </div>
            </div>

            {/* Placement Details */}
            <div className="px-6 py-5 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                    Placement Details
                </p>
                <div className="flex items-center gap-4 text-sm text-base-content/60">
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-calendar-check text-xs text-primary" />
                        {formatDate(placement.startDate)}
                    </span>
                    <span className="text-base-content/20">|</span>
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-briefcase text-xs text-primary" />
                        {placement.placementType}
                    </span>
                    <span className="text-base-content/20">|</span>
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-building text-xs text-primary" />
                        {placement.company}
                    </span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="border-b border-base-300">
                <div className="grid grid-cols-3 divide-x divide-base-300">
                    {/* Salary */}
                    <div className="flex items-center gap-2 px-2 py-4 min-w-0 overflow-hidden">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-primary text-primary-content">
                            <i className="fa-duotone fa-regular fa-dollar-sign text-xs" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-sm font-black text-base-content leading-none block truncate">
                                {placement.salary}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none">
                                Salary
                            </span>
                        </div>
                    </div>

                    {/* Fee Earned */}
                    <div className="flex items-center gap-2 px-2 py-4 min-w-0 overflow-hidden">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-secondary text-secondary-content">
                            <i className="fa-duotone fa-regular fa-receipt text-xs" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-sm font-black text-base-content leading-none block truncate">
                                {placement.fee}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none">
                                Fee
                            </span>
                        </div>
                    </div>

                    {/* Time to Fill */}
                    <div className="flex items-center gap-2 px-2 py-4 min-w-0 overflow-hidden">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-accent text-accent-content">
                            <i className="fa-duotone fa-regular fa-clock text-xs" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-sm font-black text-base-content leading-none block truncate">
                                {placement.timeToFill}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none">
                                Fill Time
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Partners */}
            <div className="px-6 py-5 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                    Split Partners
                </p>
                <div className="flex flex-col gap-2">
                    {placement.splitPartners.map((partner, i) => {
                        const badgeColors: BaselSemanticColor[] = [
                            "primary",
                            "secondary",
                            "accent",
                        ];
                        const style = badgeColors[i % badgeColors.length];
                        return (
                            <div
                                key={partner.name}
                                className="flex items-center justify-between"
                            >
                                <BaselBadge color={style} icon="fa-user">
                                    {partner.name}
                                </BaselBadge>
                                <span className="text-sm font-black text-base-content">
                                    {partner.percentage}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom: Recruiter credit + guarantee status */}
            <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                            Lead Recruiter
                        </p>
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-base-content/60">
                            <i className="fa-duotone fa-regular fa-user-tie text-xs" />
                            {placement.recruiterName}
                        </span>
                    </div>
                    <BaselBadge color={guaranteeColor} icon="fa-shield-check">
                        {placement.status}
                    </BaselBadge>
                </div>
            </div>
        </article>
    );
}
