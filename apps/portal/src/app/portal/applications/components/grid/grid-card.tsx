"use client";

import type { Application } from "../../types";
import {
    candidateName,
    candidateInitials,
    roleTitle,
    companyName,
    companyInitials,
    aiScore,
    isNew,
    addedAgo,
    candidateHeadline,
    jobLocation,
    jobSalaryRange,
    jobEmploymentType,
    recruiterName,
    submittedDateLabel,
} from "../shared/helpers";
import {
    getStageDisplayWithExpired,
} from "../shared/status-color";
import ActionsToolbar from "@/app/portal/applications/components/shared/actions-toolbar";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import { BaselBadge } from "@splits-network/basel-ui";

function matchScoreColor(score: number | null): string {
    if (score == null) return "text-base-content/40";
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-error";
}

export function GridCard({
    application,
    isSelected,
    onSelect,
    onRefresh,
}: {
    application: Application;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { getLevel } = useGamification();
    const companyLevel = application.job?.company?.id ? getLevel(application.job.company.id) : undefined;
    const name = candidateName(application);
    const initials = candidateInitials(name);
    const role = roleTitle(application);
    const company = companyName(application);
    const score = aiScore(application);
    const stage = getStageDisplayWithExpired(application.stage, (application as any).expired_at);
    const headline = candidateHeadline(application);
    const location = jobLocation(application);
    const salary = jobSalaryRange(application);
    const employmentType = jobEmploymentType(application);
    const recruiter = recruiterName(application);
    const cInitials = companyInitials(company);
    const submittedDate = submittedDateLabel(application);

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
                {/* Kicker row: company + status badge + NEW indicator */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 truncate mr-2">
                        {company}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {isNew(application) && (
                            <BaselBadge color="warning" variant="soft" size="sm">New</BaselBadge>
                        )}
                        <BaselBadge color={stage.color} variant="soft" size="sm" icon={stage.icon}>
                            {stage.label}
                        </BaselBadge>
                    </div>
                </div>

                {/* Avatar + Name block */}
                <div className="flex items-end gap-3">
                    <div className="relative shrink-0">
                        <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
                            {initials}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5 truncate">
                            {role}
                        </p>
                        <h3 className="text-2xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                        {headline && (
                            <p className="text-sm text-base-content/50 truncate mt-0.5">
                                {headline}
                            </p>
                        )}
                    </div>
                </div>

                {/* Submitted by + date row */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/40">
                    {recruiter && (
                        <span className="flex items-center gap-1.5 truncate">
                            <i className="fa-duotone fa-regular fa-user-tie text-xs" />
                            {recruiter}
                        </span>
                    )}
                    {recruiter && submittedDate && (
                        <span className="text-base-content/20">|</span>
                    )}
                    {submittedDate && (
                        <span className="flex items-center gap-1.5 shrink-0">
                            <i className="fa-duotone fa-regular fa-calendar text-xs" />
                            {submittedDate}
                        </span>
                    )}
                    <span className="text-sm uppercase tracking-wider text-base-content/40 ml-auto shrink-0">
                        {addedAgo(application)}
                    </span>
                </div>
            </div>

            {/* About snippet — recruiter description of the role */}
            {(application.job?.recruiter_description || application.job?.description) && (
                <div className="px-5 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
                        About
                    </p>
                    <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        {application.job.recruiter_description || application.job.description}
                    </p>
                </div>
            )}

            {/* Stats Row */}
            <div className="border-b border-base-300">
                <div className="grid grid-cols-3 divide-x divide-base-300">
                    {/* AI Fit Score */}
                    <div className="flex flex-col items-center justify-center px-1.5 py-3.5 gap-1 text-center min-w-0 overflow-hidden">
                        <i className={`fa-duotone fa-regular fa-bullseye text-sm ${matchScoreColor(score)}`} />
                        <span className={`text-base font-black leading-none truncate w-full ${matchScoreColor(score)}`}>
                            {score !== null ? `${score}%` : "--"}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none">
                            AI Fit
                        </span>
                    </div>

                    {/* Salary / Compensation */}
                    <div className="flex flex-col items-center justify-center px-1.5 py-3.5 gap-1 text-center min-w-0 overflow-hidden">
                        <i className="fa-duotone fa-regular fa-money-bill text-sm text-primary" />
                        <span className="text-base font-black text-base-content leading-none truncate w-full">
                            {salary || "--"}
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
                </div>
            </div>

            {/* Detail Badges */}
            {employmentType && (
                <div className="px-5 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                        Details
                    </p>
                    <BaselBadge variant="outline" size="sm">{employmentType}</BaselBadge>
                </div>
            )}

            {/* Footer: company avatar left, actions right */}
            <div className="mt-auto px-5 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                        {application.job?.company?.logo_url ? (
                            <img
                                src={application.job.company.logo_url}
                                alt={company}
                                className="w-8 h-8 object-contain bg-base-200 border border-base-300 p-0.5"
                            />
                        ) : (
                            <div className="w-8 h-8 flex items-center justify-center bg-base-200 border border-base-300 text-sm font-bold text-base-content/60">
                                {cInitials}
                            </div>
                        )}
                        {companyLevel && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={companyLevel} size="sm" />
                            </div>
                        )}
                    </div>
                    <span className="text-xs font-semibold text-base-content/60 truncate">
                        {company}
                    </span>
                </div>

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <ActionsToolbar
                        application={application}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            viewDetails: false,
                            advanceStage: true,
                            reject: true,
                            requestPrescreen: true,
                        }}
                    />
                </div>
            </div>
        </article>
    );
}
