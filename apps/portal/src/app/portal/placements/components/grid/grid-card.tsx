"use client";

import type { Placement } from "../../types";
import { statusColorName, statusBorder } from "../shared/status-color";
import { BaselBadge, BaselAvatar } from "@splits-network/basel-ui";
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
    const hasShare = !!placement.recruiter_share;

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-colors",
                isSelected
                    ? "border-primary border-l-primary bg-primary/5"
                    : `${statusBorder(state)} hover:border-base-content/20`,
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                {/* Overlapping avatars + Name block */}
                <div className="flex items-start gap-3">
                    <div className="relative shrink-0 w-14 h-14 mt-0.5">
                        <div className="absolute top-0 left-0 z-10">
                            <BaselAvatar
                                initials={candidateInitials(placement)}
                                alt={candidateName(placement)}
                                size="sm"
                            />
                        </div>
                        <div className="absolute bottom-0 right-0">
                            <BaselAvatar
                                initials={companyInitials(placement)}
                                src={placement.job?.company?.logo_url}
                                alt={companyName(placement)}
                                size="sm"
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            {companyName(placement)}
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {candidateName(placement)}
                        </h3>
                        <p className={`text-sm truncate mt-0.5 ${jobTitle(placement) !== "Unknown Job" ? "text-base-content/50" : "text-base-content/30"}`}>
                            {jobTitle(placement) !== "Unknown Job" ? jobTitle(placement) : "No title specified"}
                        </p>
                    </div>
                </div>

                {/* Inline context: hire date · guarantee */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/50">
                    <span className="tooltip tooltip-bottom flex items-center gap-1.5 truncate" data-tip="Hire date">
                        <i className={`fa-duotone fa-regular fa-calendar-check text-sm ${placement.hired_at ? "text-secondary" : "text-base-content/20"}`} />
                        {formatDate(placement.hired_at)}
                    </span>
                    {placement.guarantee_days != null && (
                        <>
                            <span className="text-base-content/20">|</span>
                            <span className="tooltip tooltip-bottom flex items-center gap-1.5 shrink-0" data-tip="Guarantee period">
                                <i className="fa-duotone fa-regular fa-shield-check text-sm text-accent" />
                                {placement.guarantee_days}d
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Financial summary — hero share number */}
            <div className="px-5 py-4 border-b border-base-300">
                <div className="flex items-baseline justify-between gap-3">
                    <div className="tooltip tooltip-bottom" data-tip="Your commission share">
                        <span className={`text-xl font-black tracking-tight ${hasShare ? "text-primary" : "text-base-content/30"}`}>
                            {hasShare ? formatCurrency(placement.recruiter_share!) : "\u2014"}
                        </span>
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/30 ml-2">
                            share
                        </span>
                    </div>
                </div>
                <p className="text-sm text-base-content/40 mt-1">
                    {placement.salary ? formatCurrency(placement.salary) : "\u2014"} salary
                    {placement.fee_percentage ? ` \u00b7 ${placement.fee_percentage}% fee` : ""}
                    {placement.splits && placement.splits.length > 0 ? ` \u00b7 ${placement.splits.length} split${placement.splits.length > 1 ? "s" : ""}` : ""}
                </p>
            </div>

            {/* Badge row: emphasis (soft-outline) + default (soft) */}
            <div className="px-5 py-3 flex-1">
                <div className="flex flex-wrap gap-1.5">
                    <BaselBadge color={statusColorName(state)} variant="soft-outline" size="sm">
                        {formatStatus(state)}
                    </BaselBadge>
                    {isNew(placement) && (
                        <BaselBadge color="warning" variant="soft-outline" size="sm" icon="fa-sparkles">
                            New
                        </BaselBadge>
                    )}
                    {placement.splits && placement.splits.length > 0 && (
                        <BaselBadge color="neutral" variant="soft" size="sm" icon="fa-arrows-split-up-and-left">
                            {placement.splits.length} Split{placement.splits.length > 1 ? "s" : ""}
                        </BaselBadge>
                    )}
                </div>
            </div>

            {/* Footer: view link */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-base-300">
                <button
                    onClick={onSelect}
                    className="text-sm font-semibold text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
                >
                    View Details
                    <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                </button>
            </div>
        </article>
    );
}
