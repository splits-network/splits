"use client";

import Link from "next/link";
import type { EnrichedMatch } from "@splits-network/shared-types";
import { getMatchScoreLabel } from "@splits-network/shared-types";

interface MatchPreviewWidgetProps {
    matches: EnrichedMatch[];
    loading: boolean;
}

function MatchPreviewCard({ match }: { match: EnrichedMatch }) {
    const job = match.job;
    const company = job?.companies;
    const scoreLabel = getMatchScoreLabel(match.match_score);
    const companyName = company?.name || "Company not listed";

    return (
        <Link
            href={`/jobs/${match.job_id}`}
            className="group flex flex-col bg-base-100 border-2 border-base-200 p-5 transition-all hover:border-primary/30 hover:shadow-sm min-w-[260px] shrink-0"
        >
            {/* Score badge */}
            {scoreLabel && (
                <span
                    className={`badge ${scoreLabel.badgeClass} gap-1 text-sm mb-3 self-start`}
                >
                    <i className={`fa-duotone fa-regular ${scoreLabel.icon}`} />
                    {scoreLabel.label}
                </span>
            )}

            {/* Job title */}
            <h4 className="text-base font-bold tracking-tight leading-tight group-hover:text-primary transition-colors mb-1 line-clamp-2">
                {job?.title || "Open position"}
            </h4>

            {/* Company */}
            <p className="text-sm text-base-content/60 mb-2">{companyName}</p>

            {/* Location */}
            {job?.location && (
                <div className="flex items-center gap-1 text-sm text-base-content/40">
                    <i className="fa-duotone fa-regular fa-location-dot" />
                    {job.location}
                </div>
            )}
        </Link>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-base-100 border-2 border-base-200 p-5"
                >
                    <div className="h-5 w-24 bg-base-content/10 animate-pulse mb-3" />
                    <div className="h-4 w-full bg-base-content/10 animate-pulse mb-2" />
                    <div className="h-3 w-20 bg-base-content/5 animate-pulse mb-2" />
                    <div className="h-3 w-28 bg-base-content/5 animate-pulse" />
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-8">
            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <i className="fa-duotone fa-regular fa-radar text-xl text-primary/30" />
            </div>
            <p className="text-sm font-semibold text-base-content/60">
                Matches are being generated
            </p>
            <p className="text-sm text-base-content/40 mt-1">
                Complete your profile to surface the best opportunities
            </p>
        </div>
    );
}

export default function MatchPreviewWidget({
    matches,
    loading,
}: MatchPreviewWidgetProps) {
    return (
        <section className="py-12 bg-base-200 match-preview opacity-0">
            <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                            Recommended For You
                        </p>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-base-content">
                            Your top matches
                        </h2>
                    </div>
                    <Link
                        href="/portal/matches"
                        className="btn btn-ghost btn-sm rounded-none text-primary"
                    >
                        View All
                        <i className="fa-duotone fa-regular fa-arrow-right" />
                    </Link>
                </div>

                {loading ? (
                    <LoadingSkeleton />
                ) : matches.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {matches.map((match) => (
                            <MatchPreviewCard key={match.id} match={match} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
