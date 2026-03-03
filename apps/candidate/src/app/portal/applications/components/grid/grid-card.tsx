"use client";

import type { Application } from "../../types";
import { stageColorName } from "../shared/status-color";
import {
    companyName,
    companyInitials,
    salaryDisplay,
    formatStage,
    recruiterName,
    appliedAgo,
} from "../shared/helpers";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import ActionsToolbar from "../shared/actions-toolbar";
import { BaselBadge } from "@splits-network/basel-ui";

export function GridCard({
    app,
    isSelected,
    onSelect,
    onRefresh,
}: {
    app: Application;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const name = companyName(app);
    const salary = salaryDisplay(app);
    const recruiter = recruiterName(app);
    const { getLevel } = useGamification();
    const companyLevel = app.job?.company?.id ? getLevel(app.job.company.id) : undefined;
    const jobTitle = app.job?.title || "Untitled Position";
    const location = app.job?.location || null;
    const industry = app.job?.company?.industry || null;

    // Build initials from company name
    const cInitials = companyInitials(name);

    // Build initials from job title for the avatar
    const titleInitials = jobTitle
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-all w-full",
                isSelected ? "border-l-primary" : "border-l-base-300 hover:border-l-primary/50",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-5 pt-5 pb-4">
                {/* Kicker row: company + status badge */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 truncate mr-2">
                        {name}
                    </p>
                    <BaselBadge color={stageColorName(app.stage)} variant="soft" size="sm">
                        {formatStage(app.stage)}
                    </BaselBadge>
                </div>

                {/* Avatar + Title block */}
                <div className="flex items-end gap-3">
                    <div className="relative shrink-0">
                        {app.job?.company?.logo_url ? (
                            <img
                                src={app.job.company.logo_url}
                                alt={name}
                                className="w-14 h-14 object-contain bg-base-200 border border-base-300 p-1"
                            />
                        ) : (
                            <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
                                {titleInitials}
                            </div>
                        )}
                        {companyLevel && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={companyLevel} size="sm" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5 truncate">
                            {name}
                        </p>
                        <h3 className="text-2xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {jobTitle}
                        </h3>
                    </div>
                </div>

                {/* Recruiter + date row */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/40">
                    <span className="flex items-center gap-1.5 truncate">
                        <i className="fa-duotone fa-regular fa-user-tie text-xs" />
                        {recruiter}
                    </span>
                    <span className="text-base-content/20">|</span>
                    <span className="text-sm uppercase tracking-wider text-base-content/40 shrink-0">
                        {appliedAgo(app)}
                    </span>
                </div>
            </div>

            {/* About snippet — candidate-facing description */}
            {(app.job?.candidate_description || app.job?.description) && (
                <div className="px-5 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
                        About
                    </p>
                    <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        {app.job.candidate_description || app.job.description}
                    </p>
                </div>
            )}

            {/* Stats Row */}
            <div className="border-b border-base-300">
                <div className="grid grid-cols-3 divide-x divide-base-300">
                    {/* Salary */}
                    <div className="flex flex-col items-center justify-center px-1.5 py-3.5 gap-1 text-center min-w-0 overflow-hidden">
                        <i className="fa-duotone fa-regular fa-money-bill text-sm text-primary" />
                        <span className="text-base font-black text-base-content leading-none truncate w-full">
                            {salary || "Competitive"}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none">
                            Salary
                        </span>
                    </div>

                    {/* Location */}
                    <div className="flex flex-col items-center justify-center px-1.5 py-3.5 gap-1 text-center min-w-0 overflow-hidden">
                        <i className="fa-duotone fa-regular fa-location-dot text-sm text-primary" />
                        <span className="text-base font-black text-base-content leading-none truncate w-full">
                            {location || "--"}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none">
                            Location
                        </span>
                    </div>

                    {/* Industry */}
                    <div className="flex flex-col items-center justify-center px-1.5 py-3.5 gap-1 text-center min-w-0 overflow-hidden">
                        <i className="fa-duotone fa-regular fa-building text-sm text-primary" />
                        <span className="text-base font-black text-base-content leading-none truncate w-full">
                            {industry || "--"}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none">
                            Industry
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer: company badge left, actions right */}
            <div className="mt-auto px-5 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                        {app.job?.company?.logo_url ? (
                            <img
                                src={app.job.company.logo_url}
                                alt={name}
                                className="w-8 h-8 object-contain bg-base-200 border border-base-300 p-0.5"
                            />
                        ) : (
                            <div className="w-8 h-8 flex items-center justify-center bg-base-200 border border-base-300 text-sm font-bold text-base-content/60">
                                {cInitials}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <span className="text-sm font-semibold text-base-content truncate block">
                            {name}
                        </span>
                        {industry && (
                            <span className="text-xs text-base-content/40 truncate block">
                                {industry}
                            </span>
                        )}
                    </div>
                </div>

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <ActionsToolbar
                        item={app}
                        variant="icon-only"
                        size="sm"
                        onStageChange={onRefresh}
                    />
                </div>
            </div>
        </article>
    );
}
