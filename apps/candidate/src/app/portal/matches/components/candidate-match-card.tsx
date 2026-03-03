"use client";

import Link from "next/link";
import type { EnrichedMatch } from "@splits-network/shared-types";
import { getMatchScoreLabel } from "@splits-network/shared-types";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import MatchExplainer from "./match-explainer";
import { BaselBadge } from "@splits-network/basel-ui";

interface CandidateMatchCardProps {
    match: EnrichedMatch;
    onDismiss: (id: string) => void;
    dismissing?: boolean;
}

function formatSalary(min: number | null, max: number | null): string {
    if (!min && !max) return "Salary not listed";
    const fmt = (n: number) =>
        n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
}

function formatEmploymentType(type: string): string {
    return type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CandidateMatchCard({
    match,
    onDismiss,
    dismissing,
}: CandidateMatchCardProps) {
    const { getLevel } = useGamification();
    const job = match.job;
    const company = job?.companies;
    const scoreLabel = getMatchScoreLabel(match.match_score);
    const companyName = company?.name || "Company not listed";
    const companyLevel = company?.id ? getLevel(company.id) : undefined;
    const initials = companyName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const scoreColor =
        match.match_score >= 85
            ? "text-success"
            : match.match_score >= 70
              ? "text-warning"
              : "text-error";

    const factors = match.match_factors;

    return (
        <article className="match-card flex flex-col bg-base-100 border border-base-300 border-l-4 border-l-primary transition-all shadow-sm hover:shadow-md opacity-0">
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-5 pt-5 pb-4">
                {/* Kicker row: score label + status badge */}
                <div className="flex items-center justify-between mb-3 min-w-0">
                    {scoreLabel ? (
                        <span
                            className={`badge ${scoreLabel.badgeClass} gap-1 text-sm`}
                        >
                            <i className={`fa-duotone fa-regular ${scoreLabel.icon}`} />
                            {scoreLabel.label}
                        </span>
                    ) : (
                        <span className="badge badge-ghost badge-sm">Below Threshold</span>
                    )}
                </div>

                {/* Company avatar + match score */}
                <div className="flex items-end gap-3">
                    <div className="relative shrink-0">
                        {company?.logo_url ? (
                            <img
                                src={company.logo_url}
                                alt={companyName}
                                className="w-14 h-14 object-contain bg-base-100 border border-base-300 p-1"
                            />
                        ) : (
                            <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
                                {initials}
                            </div>
                        )}
                        {companyLevel && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={companyLevel} size="sm" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 overflow-hidden">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Match
                        </p>
                        <p className={`text-4xl font-black tracking-tight leading-none truncate ${scoreColor}`}>
                            {match.match_score}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Role Details */}
            <div className="px-5 py-4 border-b border-base-300 min-w-0 overflow-hidden">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    Role
                </p>
                <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors truncate">
                    {job?.title || "Open position"}
                </h3>
                <p className="text-sm text-base-content/60 mt-1 truncate">
                    <span className="font-semibold">{companyName}</span>
                </p>
                {job?.location && (
                    <p className="text-sm text-base-content/40 mt-1.5 flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-location-dot text-xs shrink-0" />
                        <span className="truncate">{job.location}</span>
                    </p>
                )}
            </div>

            {/* AI Summary */}
            {factors.ai_summary && (
                <div className="px-5 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
                        Why You Match
                    </p>
                    <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        {factors.ai_summary}
                    </p>
                </div>
            )}

            {/* Salary + Tags */}
            <div className="px-5 py-4 border-b border-base-300 min-w-0 overflow-hidden">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    Compensation
                </p>
                <p className="text-base font-black tracking-tight text-primary truncate">
                    {formatSalary(job?.salary_min ?? null, job?.salary_max ?? null)}
                </p>
                {(job?.employment_type || job?.job_level) && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.employment_type && (
                            <BaselBadge variant="outline" size="sm">
                                {formatEmploymentType(job.employment_type)}
                            </BaselBadge>
                        )}
                        {job.job_level && (
                            <BaselBadge variant="outline" size="sm">
                                {job.job_level}
                            </BaselBadge>
                        )}
                    </div>
                )}
            </div>

            {/* Why this match? - DaisyUI collapse */}
            <div className="px-5 py-4 border-b border-base-300">
                <div className="collapse collapse-arrow bg-base-200/50">
                    <input type="checkbox" />
                    <div className="collapse-title text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 min-h-0 py-2 px-3">
                        <i className="fa-duotone fa-regular fa-lightbulb mr-1" />
                        Why This Match
                    </div>
                    <div className="collapse-content px-3">
                        <MatchExplainer factors={match.match_factors} />
                    </div>
                </div>
            </div>

            {/* Skills Preview */}
            {(factors.skills_matched.length > 0 || factors.skills_missing.length > 0) && (
                <div className="px-5 py-4 border-b border-base-300">
                    {factors.skills_matched.length > 0 && (
                        <div className={factors.skills_missing.length > 0 ? "mb-3" : ""}>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                                Matching Skills
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {factors.skills_matched.slice(0, 5).map((skill) => (
                                    <BaselBadge key={skill} color="success" variant="soft" size="sm">
                                        {skill}
                                    </BaselBadge>
                                ))}
                                {factors.skills_matched.length > 5 && (
                                    <span className="px-2 py-0.5 text-xs font-bold text-base-content/40">
                                        +{factors.skills_matched.length - 5}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    {factors.skills_missing.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                                Missing
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {factors.skills_missing.slice(0, 3).map((skill) => (
                                    <BaselBadge key={skill} variant="outline" size="sm" className="opacity-40">
                                        {skill}
                                    </BaselBadge>
                                ))}
                                {factors.skills_missing.length > 3 && (
                                    <span className="px-2 py-0.5 text-xs font-bold text-base-content/40">
                                        +{factors.skills_missing.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Footer: actions */}
            <div className="mt-auto px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                        {company?.logo_url ? (
                            <img
                                src={company.logo_url}
                                alt={companyName}
                                className="w-9 h-9 object-contain bg-base-200 border border-base-300 p-1"
                            />
                        ) : (
                            <div className="w-9 h-9 flex items-center justify-center bg-base-200 border border-base-300 text-sm font-bold text-base-content/60">
                                {initials}
                            </div>
                        )}
                        {companyLevel && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={companyLevel} size="sm" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1" />
                    <button
                        className="btn btn-ghost btn-sm rounded-none text-base-content/50"
                        onClick={() => onDismiss(match.id)}
                        disabled={dismissing}
                        title="Not interested"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                    <Link
                        href={`/jobs/${match.job_id}`}
                        className="btn btn-primary btn-sm rounded-none"
                    >
                        View Role
                    </Link>
                </div>
            </div>
        </article>
    );
}
