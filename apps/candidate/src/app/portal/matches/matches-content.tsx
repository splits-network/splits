"use client";

import { useCallback, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { EnrichedMatch } from "@splits-network/shared-types";
import {
    useStandardList,
    PaginationControls,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import type { FetchParams, FetchResponse } from "@/hooks/use-standard-list";
import CandidateMatchCard from "./components/candidate-match-card";
import MatchesEmptyState from "./components/matches-empty-state";
import MatchesAnimator from "./matches-animator";

interface MatchFilters {
    status: string;
    min_score_tier?: string;
}

const TIER_MIN_SCORES: Record<string, number> = {
    excellent: 85,
    strong: 70,
    good: 55,
};

export default function MatchesContent() {
    const { getToken } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dismissingId, setDismissingId] = useState<string | null>(null);

    const fetchMatches = useCallback(
        async (
            params: FetchParams<MatchFilters>,
        ): Promise<FetchResponse<EnrichedMatch>> => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);

            const queryParams: Record<string, any> = {
                page: params.page,
                limit: params.limit,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
                status: params.filters?.status || "active",
            };

            const tier = params.filters?.min_score_tier;
            if (tier && TIER_MIN_SCORES[tier]) {
                queryParams.min_score = TIER_MIN_SCORES[tier];
            }

            return client.get("/matches", { params: queryParams });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const {
        data: matches,
        loading,
        error,
        page,
        totalPages,
        total,
        limit,
        goToPage,
        setLimit,
        filters,
        setFilter,
        refresh,
    } = useStandardList<EnrichedMatch, MatchFilters>({
        fetchFn: fetchMatches,
        defaultFilters: { status: "active", min_score_tier: "" },
        defaultSortBy: "match_score",
        defaultSortOrder: "desc",
        defaultLimit: 12,
        syncToUrl: true,
    });

    const handleTierChange = useCallback(
        (tier: string) => {
            setFilter("min_score_tier", tier);
        },
        [setFilter],
    );

    const handleDismiss = useCallback(
        async (id: string) => {
            try {
                setDismissingId(id);
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                await client.patch(`/matches/${id}/dismiss`);
                await refresh();
            } catch (err) {
                console.error("[Matches] Failed to dismiss:", err);
            } finally {
                setDismissingId(null);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return (
        <div ref={containerRef} className="space-y-0">
            <MatchesAnimator containerRef={containerRef} loading={loading} />

            {/* Hero section */}
            <section className="matches-hero bg-base-200 py-12 opacity-0">
                <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                        Matched For You
                    </p>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-base-content mb-2">
                        Roles that fit your profile
                    </h1>
                    <p className="text-base text-base-content/60 max-w-xl">
                        These opportunities are selected based on your skills, experience,
                        and preferences. New matches appear as roles are posted.
                    </p>

                    {/* Filter bar */}
                    <div className="flex items-center gap-4 mt-6">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Match quality
                            </legend>
                            <select
                                className="select select-sm w-44"
                                value={filters.min_score_tier || ""}
                                onChange={(e) =>
                                    handleTierChange(e.target.value)
                                }
                            >
                                <option value="">All matches</option>
                                <option value="excellent">
                                    Excellent (85+)
                                </option>
                                <option value="strong">Strong (70+)</option>
                                <option value="good">Promising (55+)</option>
                            </select>
                        </fieldset>
                        {!loading && (
                            <p className="text-sm text-base-content/40 self-end pb-1">
                                {total} match{total !== 1 ? "es" : ""} found
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 bg-base-100">
                <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                    {loading ? (
                        <LoadingState message="Finding your matches..." />
                    ) : error ? (
                        <ErrorState message={error} onRetry={refresh} />
                    ) : matches.length === 0 ? (
                        <MatchesEmptyState />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {matches.map((match) => (
                                    <CandidateMatchCard
                                        key={match.id}
                                        match={match}
                                        onDismiss={handleDismiss}
                                        dismissing={
                                            dismissingId === match.id
                                        }
                                    />
                                ))}
                            </div>

                            <PaginationControls
                                page={page}
                                totalPages={totalPages}
                                total={total}
                                limit={limit}
                                onPageChange={goToPage}
                                onLimitChange={setLimit}
                                loading={loading}
                                limitOptions={[12, 24, 48]}
                            />
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
