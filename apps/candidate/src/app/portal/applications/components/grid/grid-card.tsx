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

    const stats = [
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
        {
            label: "Industry",
            value: industry || "N/A",
            icon: "fa-duotone fa-regular fa-building",
        },
    ];

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
            <div className="bg-base-300 border-b border-base-300 px-6 pt-5 pb-4">
                {/* Kicker row: company + stage badge */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 truncate mr-2">
                        {name}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap ml-auto">
                        <BaselBadge color={stageColorName(app.stage)} variant="soft" size="sm">
                            {formatStage(app.stage)}
                        </BaselBadge>
                    </div>
                </div>

                {/* Avatar + Title block */}
                <div className="flex items-end gap-3">
                    <div className="relative shrink-0">
                        {(app.job?.company?.logo_url || app.job?.firm?.logo_url) ? (
                            <img
                                src={app.job?.company?.logo_url || app.job?.firm?.logo_url || ""}
                                alt={name}
                                className="w-14 h-14 object-contain bg-base-100 border border-base-300 p-1"
                            />
                        ) : (
                            <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
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
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5 truncate">
                            {name}
                        </p>
                        <h3 className="text-xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {jobTitle}
                        </h3>
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
                            const p = getPipelineProgress(app.stage);
                            if (p.current === 0) return formatStage(app.stage);
                            return <>Step {p.current} <span className="text-base-content/30">/ {p.total}</span></>;
                        })()}
                    </span>
                </div>
                <div className="flex gap-1.5">
                    {(() => {
                        const p = getPipelineProgress(app.stage);
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
                {employmentType || industry ? (
                    <div className="flex flex-wrap gap-1.5">
                        {employmentType && (
                            <BaselBadge color="primary" size="sm" icon="fa-briefcase">
                                {employmentType}
                            </BaselBadge>
                        )}
                        {industry && (
                            <BaselBadge color="secondary" size="sm" icon="fa-building">
                                {industry}
                            </BaselBadge>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No details available</p>
                )}
            </div>

            {/* Footer: company + actions */}
            <div className="mt-auto flex items-center justify-between gap-3 px-6 py-4">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                        {app.job?.company?.logo_url ? (
                            <img
                                src={app.job.company.logo_url}
                                alt={name}
                                className="w-8 h-8 object-contain bg-base-100 border border-base-300 p-0.5"
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
                            <span className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 truncate block">
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
