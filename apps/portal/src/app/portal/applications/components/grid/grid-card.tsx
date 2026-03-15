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
import { getStageDisplayWithExpired, getAIScoreBadgeColor } from "../shared/status-color";
import ActionsToolbar from "@/app/portal/applications/components/shared/actions-toolbar";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import { BaselBadge } from "@splits-network/basel-ui";

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
    if (stage === "rejected" || stage === "withdrawn" || stage === "expired") {
        return { current: 0, total };
    }
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

/** Maps stage semantic color to pipeline bar bg class */
const STAGE_BAR_COLORS: Record<string, string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
    info: "bg-info",
    neutral: "bg-base-content/30",
};

/** Semantic color class for AI score display */
const SCORE_COLORS: Record<string, string> = {
    success: "text-success",
    primary: "text-primary",
    warning: "text-warning",
    error: "text-error",
    neutral: "text-base-content/40",
};

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
    const scoreColor = getAIScoreBadgeColor(score);
    const stage = getStageDisplayWithExpired(application.stage, (application as any).expired_at);
    const headline = candidateHeadline(application);
    const location = jobLocation(application);
    const salary = jobSalaryRange(application);
    const employmentType = jobEmploymentType(application);
    const recruiter = recruiterName(application);
    const cInitials = companyInitials(company);
    const submittedDate = submittedDateLabel(application);

    // Inline metadata fragments with semantic icons
    const metaItems: { icon: string; color: string; value: string }[] = [];
    if (salary) metaItems.push({ icon: "fa-dollar-sign", color: "text-success", value: salary });
    if (location) metaItems.push({ icon: "fa-location-dot", color: "text-info", value: location });
    if (employmentType) metaItems.push({ icon: "fa-briefcase", color: "text-secondary", value: employmentType });

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border transition-colors",
                isSelected
                    ? "border-primary"
                    : "border-base-300 hover:border-base-content/20",
            ].join(" ")}
        >
            {/* Header */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                {/* Status bar: Stage + New badge + time ago */}
                <div className="flex items-center gap-2 mb-3">
                    <BaselBadge color={stage.color} variant="soft" size="sm" icon={stage.icon}>
                        {stage.label}
                    </BaselBadge>
                    {isNew(application) && (
                        <BaselBadge color="warning" variant="soft" size="sm" icon="fa-sparkles">
                            New
                        </BaselBadge>
                    )}
                    <span className="text-sm text-base-content/40 ml-auto shrink-0">
                        {addedAgo(application)}
                    </span>
                </div>

                {/* Editorial block: Kicker → Display heading → Subtitle */}
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center text-sm font-black tracking-tight select-none shrink-0 mt-0.5">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            {role}
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                        {headline && (
                            <p className="text-sm text-base-content/50 truncate mt-0.5">
                                {headline}
                            </p>
                        )}
                    </div>
                    {score !== null && (
                        <div className="text-right shrink-0 pl-2 pt-0.5">
                            <span className={`text-xl font-black leading-none ${SCORE_COLORS[scoreColor] || "text-base-content"}`}>
                                {score}%
                            </span>
                            <span className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 block mt-0.5">
                                AI Fit
                            </span>
                        </div>
                    )}
                </div>

                {/* Byline: Recruiter + date */}
                {(recruiter || submittedDate) && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-base-content/40">
                        {recruiter && (
                            <span className="truncate">
                                <i className="fa-duotone fa-regular fa-user-tie mr-1 text-primary/60" />
                                {recruiter}
                            </span>
                        )}
                        {recruiter && submittedDate && (
                            <span className="text-base-content/20">&middot;</span>
                        )}
                        {submittedDate && (
                            <span className="shrink-0">{submittedDate}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Pipeline Progress */}
            <div className="px-5 py-3 border-b border-base-300">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30">
                        Pipeline
                    </span>
                    <span className="text-sm font-bold text-base-content/60">
                        {(() => {
                            const p = getPipelineProgress(application.stage);
                            if (p.current === 0) return stage.label;
                            return <>{p.current} <span className="text-base-content/30">/ {p.total}</span></>;
                        })()}
                    </span>
                </div>
                <div className="flex gap-1">
                    {(() => {
                        const p = getPipelineProgress(application.stage);
                        const barColor = STAGE_BAR_COLORS[stage.color] || "bg-primary";
                        return Array.from({ length: p.total }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 ${
                                    i < p.current ? barColor : "bg-base-300"
                                }`}
                            />
                        ));
                    })()}
                </div>
            </div>

            {/* Inline metadata: salary · location · type */}
            {metaItems.length > 0 && (
                <div className="px-5 py-2.5 border-b border-base-300 text-sm text-base-content/50 flex items-center gap-3 overflow-hidden">
                    {metaItems.map((item, i) => (
                        <span key={i} className="flex items-center gap-1 shrink-0">
                            <i className={`fa-duotone fa-regular ${item.icon} ${item.color} text-xs`} />
                            <span className="truncate">{item.value}</span>
                        </span>
                    ))}
                </div>
            )}

            {/* Footer: company + actions */}
            <div className="mt-auto flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                        {application.job?.company?.logo_url ? (
                            <img
                                src={application.job.company.logo_url}
                                alt={company}
                                className="w-7 h-7 object-contain bg-base-100 border border-base-300 p-0.5"
                            />
                        ) : (
                            <div className="w-7 h-7 flex items-center justify-center bg-base-200 border border-base-300 text-sm font-bold text-base-content/60">
                                {cInitials}
                            </div>
                        )}
                        {companyLevel && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={companyLevel} size="sm" />
                            </div>
                        )}
                    </div>
                    <span className="text-sm font-semibold text-base-content truncate">
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
