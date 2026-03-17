"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts/user-profile-context";
import {
    useStandardList,
    PaginationControls,
    EmptyState,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import type { EnrichedMatch } from "@splits-network/shared-types";
import { getMatchScoreLabel } from "@splits-network/shared-types";

interface MatchFilters {
    status?: string;
}

export default function MatchedCandidatesTab({ jobId }: { jobId: string }) {
    const { getToken } = useAuth();
    const { subscription } = useUserProfile();
    const isPartner = subscription?.plan?.tier === "partner";
    const defaultFilters = useMemo<MatchFilters>(
        () => ({ status: "active" }),
        [],
    );

    const {
        data: matches,
        loading,
        error,
        pagination,
        goToPage,
        refresh,
    } = useStandardList<EnrichedMatch, MatchFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const client = createAuthenticatedClient(token);
            const qp = new URLSearchParams();
            qp.set("page", String(params.page));
            qp.set("limit", String(params.limit));
            qp.set("job_id", jobId);
            if (params.filters?.status) qp.set("status", params.filters.status);
            return client.get(`/matches?${qp.toString()}`);
        },
        defaultFilters,
        defaultSortBy: "match_score",
        defaultSortOrder: "desc",
    });

    if (loading)
        return <LoadingState message="Loading matched candidates..." />;
    if (error) return <ErrorState message={error} onRetry={refresh} />;
    if (!matches.length) {
        return (
            <EmptyState
                icon="fa-bullseye"
                title="No matched candidates yet"
                description="Matches appear automatically as candidates with relevant skills and experience enter the network."
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match) => (
                    <CandidateMatchCard
                        key={match.id}
                        match={match}
                        isPartner={isPartner}
                    />
                ))}
            </div>
            <PaginationControls
                page={pagination.page}
                totalPages={pagination.total_pages}
                onPageChange={goToPage}
            />
        </div>
    );
}

function CandidateMatchCard({
    match,
    isPartner,
}: {
    match: EnrichedMatch;
    isPartner: boolean;
}) {
    const candidate = match.candidate;
    const scoreLabel = getMatchScoreLabel(match.match_score);
    const name = candidate?.full_name || "Unnamed candidate";

    return (
        <div className="card bg-base-100 border-2 border-base-200 hover:border-primary/30 transition-colors">
            <div className="card-body p-4 gap-3">
                {/* Header: Avatar + Name + Score */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="avatar avatar-placeholder">
                            <div className="bg-base-300 text-base-content w-10 rounded-full">
                                <span className="text-sm">
                                    {name.charAt(0)}
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-sm">{name}</p>
                        </div>
                    </div>
                    {scoreLabel && (
                        <span
                            className={`badge ${scoreLabel.badgeClass} badge-sm`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${scoreLabel.icon} mr-1`}
                            />
                            {scoreLabel.label}
                        </span>
                    )}
                </div>

                {/* Factor Summary */}
                <div className="flex flex-wrap gap-1.5">
                    <FactorChip
                        pass={match.match_factors.salary_overlap}
                        label="Salary"
                    />
                    <FactorChip
                        pass={match.match_factors.employment_type_match}
                        label="Type"
                    />
                    <FactorChip
                        pass={match.match_factors.location_compatible}
                        label="Location"
                    />
                    <FactorChip
                        pass={match.match_factors.job_level_match}
                        label="Level"
                    />
                </div>

                {/* Skills */}
                {match.match_factors.skills_matched?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {match.match_factors.skills_matched
                            .slice(0, 4)
                            .map((skill) => (
                                <span
                                    key={skill}
                                    className="badge badge-sm badge-success badge-outline"
                                >
                                    {skill}
                                </span>
                            ))}
                        {match.match_factors.skills_matched.length > 4 && (
                            <span className="badge badge-sm badge-ghost">
                                +{match.match_factors.skills_matched.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* True Score Upsell */}
                {!isPartner && match.match_tier === "standard" && (
                    <div className="flex items-center gap-2 p-2 bg-base-200 rounded-lg">
                        <i className="fa-duotone fa-regular fa-lock text-base-content/40" />
                        <span className="text-sm text-base-content/50">
                            True Score available
                        </span>
                        <Link
                            href="/portal/billing"
                            className="link link-primary text-sm ml-auto"
                        >
                            Upgrade Plan
                        </Link>
                    </div>
                )}

                {/* Actions */}
                <div className="card-actions justify-end mt-1">
                    <Link
                        href={`/portal/admin/matches/${match.id}`}
                        className="btn btn-ghost btn-sm"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}

function FactorChip({ pass, label }: { pass: boolean; label: string }) {
    return (
        <span
            className={`badge badge-sm ${pass ? "badge-success badge-outline" : "badge-error badge-outline"}`}
        >
            <i
                className={`fa-duotone fa-regular ${pass ? "fa-check" : "fa-xmark"} mr-1`}
            />
            {label}
        </span>
    );
}
