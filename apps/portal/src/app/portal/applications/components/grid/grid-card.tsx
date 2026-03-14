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
import { getStageDisplayWithExpired } from "../shared/status-color";
import ActionsToolbar from "@/app/portal/applications/components/shared/actions-toolbar";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import { BaselBadge } from "@splits-network/basel-ui";
import { MarkdownRenderer } from "@splits-network/shared-ui";

const iconStyles = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-warning text-warning-content",
];

const PIPELINE_STAGES = [
    "draft",
    "ai_review",
    "gpt_review",
    "recruiter_review",
    "submitted",
    "company_review",
    "interview",
    "offer",
    "hired",
] as const;

function getPipelineProgress(stage: string): { current: number; total: number } {
    const total = PIPELINE_STAGES.length;
    // Terminal stages
    if (stage === "rejected" || stage === "withdrawn" || stage === "expired") {
        return { current: 0, total };
    }
    // Map aliases to canonical stages
    const normalized =
        stage === "ai_reviewed" ? "ai_review" :
        stage === "gpt_review" ? "gpt_review" :
        stage === "ai_failed" ? "ai_review" :
        stage === "recruiter_request" || stage === "recruiter_proposed" ? "recruiter_review" :
        stage === "screen" ? "submitted" :
        stage === "company_feedback" ? "company_review" :
        stage;
    const idx = PIPELINE_STAGES.indexOf(normalized as typeof PIPELINE_STAGES[number]);
    return { current: idx >= 0 ? idx + 1 : 0, total };
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
    const desc = application.job?.recruiter_description || application.job?.description;

    const stats = [
        {
            label: "AI Fit",
            value: score !== null ? `${score}%` : "N/A",
            icon: "fa-duotone fa-regular fa-bullseye",
        },
        {
            label: "Salary",
            value: salary || "TBD",
            icon: "fa-duotone fa-regular fa-dollar-sign",
        },
        {
            label: "Location",
            value: location || "N/A",
            icon: "fa-duotone fa-regular fa-location-dot",
        },
        {
            label: "Type",
            value: employmentType || "N/A",
            icon: "fa-duotone fa-regular fa-briefcase",
        },
    ];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-shadow hover:shadow-md",
                isSelected
                    ? "border-l-primary border-primary"
                    : "border-l-primary",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-5 pb-4">
                {/* Kicker row: company + status badges */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 truncate mr-2">
                        {company}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap ml-auto">
                        <BaselBadge color={stage.color} variant="soft" size="sm" icon={stage.icon}>
                            {stage.label}
                        </BaselBadge>
                        {isNew(application) && (
                            <BaselBadge color="warning" variant="soft" size="sm" icon="fa-sparkles">
                                New
                            </BaselBadge>
                        )}
                    </div>
                </div>

                {/* Avatar + Name block */}
                <div className="flex items-end gap-3">
                    <div className="relative shrink-0">
                        <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
                            {initials}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5 truncate">
                            {role}
                        </p>
                        <h3 className="text-xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                        {headline && (
                            <p className="text-sm text-base-content/50 truncate mt-0.5">
                                {headline}
                            </p>
                        )}
                    </div>
                </div>

                {/* Recruiter + submitted date */}
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

            {/* About snippet */}
            <div className="px-6 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
                    About
                </p>
                {desc ? (
                    <div className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        <MarkdownRenderer content={desc} />
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No description added yet</p>
                )}
            </div>

            {/* Pipeline Progress */}
            <div className="px-6 py-4 border-b border-base-300">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30">
                        Pipeline Progress
                    </p>
                    <span className="text-sm font-bold text-base-content/60">
                        {(() => {
                            const p = getPipelineProgress(application.stage);
                            if (p.current === 0) return stage.label;
                            return <>Step {p.current} <span className="text-base-content/30">/ {p.total}</span></>;
                        })()}
                    </span>
                </div>
                <div className="flex gap-1.5">
                    {(() => {
                        const p = getPipelineProgress(application.stage);
                        return Array.from({ length: p.total }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 flex-1 ${
                                    i < p.current ? "bg-primary" : "bg-base-300"
                                }`}
                            />
                        ));
                    })()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="border-b border-base-300">
                <div className="grid grid-cols-2 divide-x divide-y divide-base-300">
                    {stats.map((stat, i) => (
                        <div
                            key={stat.label}
                            className="flex items-center gap-2 px-2 py-3 min-w-0 overflow-hidden"
                        >
                            <div
                                className={`w-7 h-7 flex items-center justify-center shrink-0 ${iconStyles[i % iconStyles.length]}`}
                            >
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
                    ))}
                </div>
            </div>

            {/* Details */}
            <div className="px-6 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    Details
                </p>
                {employmentType ? (
                    <div className="flex flex-wrap gap-1.5">
                        <BaselBadge color="primary" size="sm" icon="fa-briefcase">
                            {employmentType}
                        </BaselBadge>
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No details available</p>
                )}
            </div>

            {/* Footer: company avatar + actions */}
            <div className="mt-auto flex items-center justify-between gap-3 px-6 py-4">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                        {application.job?.company?.logo_url ? (
                            <img
                                src={application.job.company.logo_url}
                                alt={company}
                                className="w-8 h-8 object-contain bg-base-100 border border-base-300 p-0.5"
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
                    <div className="min-w-0">
                        <span className="text-sm font-semibold text-base-content truncate block">
                            {company}
                        </span>
                    </div>
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
