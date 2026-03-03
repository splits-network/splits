"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    useStandardList,
    PaginationControls,
    ErrorState,
} from "@/hooks/use-standard-list";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts/user-profile-context";
import type { BaselViewMode as ViewMode } from "@splits-network/basel-ui";
import type { EnrichedMatch, MatchFilters } from "./types";
import { isNewMatch } from "./types";
import { MatchesAnimator } from "./matches-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";
import { useGamification } from "@splits-network/shared-gamification";

export default function MatchesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);
    const { getToken } = useAuth();
    const { planTier } = useUserProfile();
    const isPartner = planTier === "partner";

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(() =>
        searchParams.get("matchId"),
    );
    const [dismissing, setDismissing] = useState(false);

    /* ── URL sync ── */
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        if (selectedMatchId) {
            params.set("matchId", selectedMatchId);
        } else {
            params.delete("matchId");
        }
        if (viewMode !== "grid") {
            params.set("view", viewMode);
        } else {
            params.delete("view");
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        const currentQuery = searchParamsRef.current.toString();
        const currentUrl = currentQuery
            ? `${pathname}?${currentQuery}`
            : pathname;

        if (newUrl !== currentUrl) {
            router.replace(newUrl, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMatchId, viewMode, pathname, router]);

    /* ── Data ── */
    const {
        data: matches,
        loading,
        error,
        pagination,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        clearFilters,
        page,
        limit,
        goToPage,
        setLimit,
        total,
        totalPages,
        refresh,
        updateItem,
    } = useStandardList<EnrichedMatch, MatchFilters>({
        endpoint: "/matches",
        include: "candidate,job,company",
        defaultFilters: { status: "active" },
        defaultSortBy: "match_score",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: true,
    });

    const { registerEntities } = useGamification();

    useEffect(() => {
        const candidateIds = matches.map((m) => m.candidate_id).filter(Boolean);
        const companyIds = matches
            .map((m) => m.job?.companies?.id)
            .filter((id): id is string => !!id);
        if (candidateIds.length > 0) {
            registerEntities("candidate", [...new Set(candidateIds)]);
        }
        if (companyIds.length > 0) {
            registerEntities("company", [...new Set(companyIds)]);
        }
    }, [matches, registerEntities]);

    const handleSelect = useCallback((match: EnrichedMatch) => {
        setSelectedMatchId((prev) => (prev === match.id ? null : match.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const handleDismiss = useCallback(
        async (id: string) => {
            setDismissing(true);
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                await client.patch(`/matches/${id}/dismiss`);
                updateItem(id, {
                    status: "dismissed",
                } as Partial<EnrichedMatch>);
            } catch (err) {
                console.error("Failed to dismiss match:", err);
            } finally {
                setDismissing(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [updateItem],
    );

    const stats = useMemo(() => {
        const newThisWeek = matches.filter((m) => isNewMatch(m)).length;
        const excellentCount = matches.filter(
            (m) => m.match_score >= 85,
        ).length;
        const avgScore =
            matches.length > 0
                ? Math.round(
                      matches.reduce((sum, m) => sum + m.match_score, 0) /
                          matches.length,
                  )
                : 0;

        return {
            total: pagination?.total || matches.length,
            newThisWeek,
            excellentCount,
            avgScore,
        };
    }, [matches, pagination]);

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <MatchesAnimator contentRef={contentRef}>
            <HeaderSection stats={stats} />

            <ControlsBar
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                filters={filters}
                onFilterChange={setFilter}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                matchCount={matches.length}
                totalCount={pagination?.total ?? matches.length}
                loading={loading}
                refresh={refresh}
            />

            {/* Content Area */}
            <section className="content-area opacity-0 p-4">
                <div ref={contentRef}>
                    {loading && matches.length === 0 ? (
                        <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                            <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                            <p className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                                Loading matches...
                            </p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                            <i className="fa-duotone fa-regular fa-magnifying-glass text-5xl text-base-content/15 mb-6 block" />
                            <h3 className="text-2xl font-black tracking-tight mb-2">
                                No matches found
                            </h3>
                            <p className="text-base-content/50 mb-6">
                                Adjust your search or clear filters to see
                                matches.
                            </p>
                            <button
                                onClick={() => {
                                    clearSearch();
                                    clearFilters();
                                }}
                                className="btn btn-outline btn-sm"
                                style={{ borderRadius: 0 }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            {viewMode === "table" && (
                                <TableView
                                    matches={matches}
                                    onSelect={handleSelect}
                                    selectedId={selectedMatchId}
                                    isPartner={isPartner}
                                    onDismiss={handleDismiss}
                                    dismissing={dismissing}
                                />
                            )}
                            {viewMode === "grid" && (
                                <GridView
                                    matches={matches}
                                    onSelect={handleSelect}
                                    selectedId={selectedMatchId}
                                    isPartner={isPartner}
                                    onDismiss={handleDismiss}
                                    dismissing={dismissing}
                                />
                            )}
                            {viewMode === "split" && (
                                <SplitView
                                    matches={matches}
                                    onSelect={handleSelect}
                                    selectedId={selectedMatchId}
                                    isPartner={isPartner}
                                    onDismiss={handleDismiss}
                                    dismissing={dismissing}
                                />
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Pagination */}
            <div className="container mx-auto px-6 lg:px-12 py-6">
                <PaginationControls
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    limit={limit}
                    onPageChange={goToPage}
                    onLimitChange={setLimit}
                    loading={loading}
                />
            </div>
        </MatchesAnimator>
    );
}
