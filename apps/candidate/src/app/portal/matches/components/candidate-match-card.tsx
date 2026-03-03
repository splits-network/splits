"use client";

import Link from "next/link";
import type { EnrichedMatch } from "@splits-network/shared-types";
import { getMatchScoreLabel } from "@splits-network/shared-types";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import MatchExplainer from "./match-explainer";

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

    return (
        <div className="match-card flex flex-col bg-base-100 border-2 border-base-200 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30 opacity-0">
            {/* Score badge */}
            {scoreLabel && (
                <div className="mb-4">
                    <span
                        className={`badge ${scoreLabel.badgeClass} gap-1 text-sm`}
                    >
                        <i
                            className={`fa-duotone fa-regular ${scoreLabel.icon}`}
                        />
                        {scoreLabel.label}
                    </span>
                </div>
            )}

            {/* Job title */}
            <h3 className="text-lg font-black tracking-tight leading-tight mb-1">
                {job?.title || "Open position"}
            </h3>

            {/* Company */}
            <div className="text-sm font-semibold text-base-content/60 mb-2">
                {companyName}
            </div>

            {/* Location */}
            {job?.location && (
                <div className="flex items-center gap-1 text-sm text-base-content/50 mb-3">
                    <i className="fa-duotone fa-regular fa-location-dot" />
                    {job.location}
                </div>
            )}

            {/* Salary */}
            <div className="text-base font-black tracking-tight text-primary mb-3">
                {formatSalary(job?.salary_min ?? null, job?.salary_max ?? null)}
            </div>

            {/* Tags */}
            {(job?.employment_type || job?.job_level) && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {job.employment_type && (
                        <span className="text-sm uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1">
                            {formatEmploymentType(job.employment_type)}
                        </span>
                    )}
                    {job.job_level && (
                        <span className="text-sm uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1">
                            {job.job_level}
                        </span>
                    )}
                </div>
            )}

            {/* Why this match? - DaisyUI collapse */}
            <div className="collapse collapse-arrow bg-base-200/50 mb-4">
                <input type="checkbox" />
                <div className="collapse-title text-sm font-semibold text-base-content/70 min-h-0 py-2 px-3">
                    <i className="fa-duotone fa-regular fa-lightbulb mr-1" />
                    Why this match?
                </div>
                <div className="collapse-content px-3">
                    <MatchExplainer factors={match.match_factors} />
                </div>
            </div>

            {/* Footer: company logo + actions */}
            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-base-200">
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
    );
}
