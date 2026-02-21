"use client";

import type { Application } from "../../types";
import {
    candidateName,
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
} from "../shared/helpers";
import { getStageDisplay, getAIScoreBadge, getAIScoreColor } from "../shared/status-color";
import ActionsToolbar from "@/app/portal/applications/components/shared/actions-toolbar";

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
    const name = candidateName(application);
    const role = roleTitle(application);
    const company = companyName(application);
    const score = aiScore(application);
    const stage = getStageDisplay(application.stage);
    const scoreBadge = getAIScoreBadge(score);
    const scoreColor = getAIScoreColor(score);
    const headline = candidateHeadline(application);
    const location = jobLocation(application);
    const salary = jobSalaryRange(application);
    const employmentType = jobEmploymentType(application);
    const recruiter = recruiterName(application);
    const cInitials = companyInitials(company);

    return (
        <div
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected ? "border-primary border-l-4" : "border-base-200",
            ].join(" ")}
        >
            {/* Top row: stage badge + NEW indicator + timestamp */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${stage.badge}`}
                >
                    <i className={`fa-duotone fa-regular ${stage.icon} mr-1`} />
                    {stage.label}
                </span>

                {isNew(application) && (
                    <span className="text-[10px] uppercase tracking-wider bg-warning/15 text-warning px-2 py-1">
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </span>
                )}

                {/* Timestamp pushed right */}
                <span className="text-[10px] uppercase tracking-wider text-base-content/40 ml-auto">
                    {addedAgo(application)}
                </span>
            </div>

            {/* Candidate identity + AI score */}
            <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {name}
                    </h3>
                    {headline && (
                        <p className="text-sm text-base-content/50 truncate mt-0.5">
                            {headline}
                        </p>
                    )}
                </div>

                {/* AI Score circle */}
                {score !== null && (
                    <div
                        className={`shrink-0 w-11 h-11 flex flex-col items-center justify-center border-2 ${scoreBadge}`}
                        title={`AI Fit Score: ${score}%`}
                    >
                        <span className={`text-sm font-black leading-none ${scoreColor}`}>
                            {score}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider opacity-60 leading-none">
                            fit
                        </span>
                    </div>
                )}
            </div>

            {/* Role applied for */}
            <div className="text-sm font-semibold text-base-content/70 mb-1">
                <i className="fa-duotone fa-regular fa-briefcase mr-1.5 text-base-content/40" />
                {role}
            </div>

            {/* Company + location */}
            <div className="flex items-center gap-1.5 text-sm text-base-content/50 mb-2">
                <i className="fa-duotone fa-regular fa-building mr-0.5" />
                <span>{company}</span>
                {location && (
                    <>
                        <span className="text-base-content/30">·</span>
                        <i className="fa-duotone fa-regular fa-location-dot" />
                        <span className="truncate">{location}</span>
                    </>
                )}
            </div>

            {/* Salary + employment type */}
            {(salary || employmentType) && (
                <div className="flex items-center gap-2 mb-3">
                    {salary && (
                        <span className="text-sm font-bold tracking-tight text-primary">
                            {salary}
                        </span>
                    )}
                    {salary && employmentType && (
                        <span className="text-base-content/30">·</span>
                    )}
                    {employmentType && (
                        <span className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-0.5">
                            {employmentType}
                        </span>
                    )}
                </div>
            )}

            {/* Recruiter attribution */}
            {recruiter && (
                <div className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                    <i className="fa-duotone fa-regular fa-user-tie mr-1" />
                    {recruiter}
                </div>
            )}

            {/* Footer: company avatar left, actions right */}
            <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-base-200">
                <div className="flex items-center gap-2 min-w-0">
                    {application.job?.company?.logo_url ? (
                        <img
                            src={application.job.company.logo_url}
                            alt={company}
                            className="w-8 h-8 shrink-0 object-contain bg-base-200 border border-base-300 p-0.5"
                        />
                    ) : (
                        <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-base-200 border border-base-300 text-[10px] font-bold text-base-content/60">
                            {cInitials}
                        </div>
                    )}
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
        </div>
    );
}
