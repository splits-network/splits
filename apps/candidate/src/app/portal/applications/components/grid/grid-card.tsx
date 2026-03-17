"use client";

import type { Application } from "../../types";
import {
    companyName,
    companyInitials,
    salaryDisplay,
    recruiterName,
    appliedAgo,
} from "../shared/helpers";
import { BaselAvatar, BaselLevelIndicator, BaselBadge, getStageDisplay } from "@splits-network/basel-ui";
import { useGamification } from "@splits-network/shared-gamification";
import ActionsToolbar from "../shared/actions-toolbar";
import { MarkdownRenderer } from "@splits-network/shared-ui";

const PIPELINE_STAGES = [
    "draft",
    "ai_review",
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
        stage === "gpt_review" ? "ai_review" :
        stage === "ai_failed" ? "ai_review" :
        stage === "recruiter_request" || stage === "recruiter_proposed" ? "recruiter_review" :
        stage === "screen" ? "submitted" :
        stage === "company_feedback" ? "company_review" :
        stage;
    const idx = PIPELINE_STAGES.indexOf(normalized as typeof PIPELINE_STAGES[number]);
    return { current: idx >= 0 ? idx + 1 : 0, total };
}

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
    const cInitials = companyInitials(name);
    const posted = appliedAgo(app);
    const desc = app.job?.candidate_description || app.job?.description;
    const employmentType = app.job?.employment_type
        ? app.job.employment_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : null;

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-colors",
                isSelected
                    ? "border-l-primary border-primary"
                    : "border-l-primary",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                {/* Avatar + Title block */}
                <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                        <BaselAvatar
                            initials={cInitials}
                            src={app.job?.company?.logo_url || app.job?.firm?.logo_url}
                            alt={name}
                            size="md"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            {name}
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {jobTitle}
                        </h3>
                        <p className={`text-sm truncate mt-0.5 ${location ? "text-base-content/50" : "text-base-content/30"}`}>
                            {location || "Location not specified"}
                        </p>
                    </div>
                </div>

                {/* Recruiter + date */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/40">
                    <span className="flex items-center gap-1.5 truncate">
                        <i className="fa-duotone fa-regular fa-user-tie text-xs" />
                        {recruiter}
                    </span>
                    <span className="text-base-content/20">|</span>
                    <span className="flex items-center gap-1.5 shrink-0">
                        <i className="fa-duotone fa-regular fa-calendar text-xs" />
                        {posted}
                    </span>
                </div>
            </div>

            {/* Inline metadata: salary · location · type */}
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                {companyLevel && (
                    <BaselLevelIndicator level={companyLevel.current_level} title={companyLevel.title} totalXp={companyLevel.total_xp} xpToNextLevel={companyLevel.xp_to_next_level} />
                )}
                {[
                    { icon: "fa-dollar-sign", color: "text-success", value: salary || "TBD", muted: !salary, tooltip: "Salary range" },
                    { icon: "fa-location-dot", color: "text-info", value: location || "Not listed", muted: !location, tooltip: "Location" },
                    { icon: "fa-briefcase", color: "text-secondary", value: employmentType || "Not listed", muted: !employmentType, tooltip: "Employment type" },
                ].map((item, i) => (
                    <span key={i} className={`tooltip tooltip-bottom flex items-center gap-1 ${item.muted ? "text-base-content/30" : "text-base-content/50"}`} data-tip={item.tooltip}>
                        <i className={`fa-duotone fa-regular ${item.icon} ${item.muted ? "text-base-content/20" : item.color} text-xs`} />
                        <span className="truncate">{item.value}</span>
                    </span>
                ))}
            </div>

            {/* About snippet */}
            <div className="px-5 py-3 border-b border-base-300">
                {desc ? (
                    <div className="text-sm text-base-content/60 leading-relaxed line-clamp-2">
                        <MarkdownRenderer content={desc} />
                    </div>
                ) : (
                    <p className="text-sm text-base-content/30">No description provided</p>
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
                            const p = getPipelineProgress(app.stage);
                            if (p.current === 0) return getStageDisplay(app.stage, { acceptedByCandidate: app.accepted_by_candidate }).label;
                            return <>Step {p.current} <span className="text-base-content/30">/ {p.total}</span></>;
                        })()}
                    </span>
                </div>
                <div className="flex gap-1">
                    {(() => {
                        const p = getPipelineProgress(app.stage);
                        return Array.from({ length: p.total }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 ${
                                    i < p.current ? "bg-primary" : "bg-base-300"
                                }`}
                            />
                        ));
                    })()}
                </div>
            </div>

            {/* Badge row: emphasis (soft-outline) + default (soft) */}
            <div className="px-5 py-3 flex-1">
                <div className="flex flex-wrap gap-1.5">
                    {(() => {
                        const s = getStageDisplay(app.stage, { acceptedByCandidate: app.accepted_by_candidate });
                        return (
                            <BaselBadge color={s.color} variant="soft-outline" size="sm">
                                {s.label}
                            </BaselBadge>
                        );
                    })()}
                    {employmentType && (
                        <BaselBadge color="neutral" variant="soft" size="sm" icon="fa-briefcase">
                            {employmentType}
                        </BaselBadge>
                    )}
                    {industry && (
                        <BaselBadge color="neutral" variant="soft" size="sm" icon="fa-building">
                            {industry}
                        </BaselBadge>
                    )}
                </div>
            </div>

            {/* Footer: company + actions */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-base-300">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                        {app.job?.company?.logo_url ? (
                            <img
                                src={app.job.company.logo_url}
                                alt={name}
                                className="w-7 h-7 object-contain bg-base-100 border border-base-300 p-0.5"
                            />
                        ) : (
                            <div className="w-7 h-7 flex items-center justify-center bg-base-200 border border-base-300 text-sm font-bold text-base-content/60">
                                {cInitials}
                            </div>
                        )}
                    </div>
                    <span className={`text-sm truncate ${industry ? "text-base-content/40" : "text-base-content/30"}`}>
                        {industry || "Industry not specified"}
                    </span>
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
