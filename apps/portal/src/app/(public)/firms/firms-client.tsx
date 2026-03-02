"use client";

import { useMemo, useRef, Suspense } from "react";
import { useStandardList } from "@/hooks/use-standard-list";
import { PaginationControls, LoadingState, ErrorState } from "@/components/standard-lists";
import { BaselEmptyState } from "@splits-network/basel-ui";
import type { PublicFirm, PublicFirmFilters } from "./types";
import { FirmsAnimator } from "./firms-animator";
import { HeaderSection } from "./components/header-section";
import { ControlsBar } from "./components/controls-bar";
import { GridView } from "./components/grid/grid-view";

function FirmsClientInner() {
    const contentRef = useRef<HTMLDivElement>(null);

    const {
        data: firms,
        loading,
        error,
        pagination,
        searchInput,
        setSearchInput,
        page,
        limit,
        totalPages,
        total,
        goToPage,
        setLimit,
        refresh,
    } = useStandardList<PublicFirm, PublicFirmFilters>({
        endpoint: "/public/firms",
        requireAuth: false,
        defaultLimit: 24,
        defaultSortBy: "name",
        defaultSortOrder: "asc",
        syncToUrl: true,
    });

    const stats = useMemo(() => ({
        total: pagination?.total || firms.length,
        seekingSplit: firms.filter((f) => f.seeking_split_partners).length,
        acceptsSubmissions: firms.filter((f) => f.accepts_candidate_submissions).length,
    }), [firms, pagination]);

    return (
        <FirmsAnimator contentRef={contentRef}>
            <HeaderSection
                total={stats.total}
                seekingSplit={stats.seekingSplit}
                acceptsSubmissions={stats.acceptsSubmissions}
            />

            <ControlsBar
                resultCount={firms.length}
                totalCount={total}
                loading={loading}
                refresh={refresh}
            />

            <section className="content-area" style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.4s ease' }}>
                <div className="container mx-auto px-6 lg:px-12 py-8">
                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState message={error} onRetry={refresh} />
                    ) : firms.length === 0 ? (
                        <BaselEmptyState
                            icon="fa-duotone fa-regular fa-building-columns"
                            title="No firms found"
                            subtitle={
                                searchInput
                                    ? "Try adjusting your search"
                                    : "Check back soon for new firms"
                            }
                            actions={
                                searchInput
                                    ? [{ label: "Clear Search", onClick: () => setSearchInput(""), style: "btn-primary" }]
                                    : []
                            }
                        />
                    ) : (
                        <div ref={contentRef}>
                            <GridView firms={firms} />
                        </div>
                    )}

                    {!loading && firms.length > 0 && totalPages > 1 && (
                        <PaginationControls
                            page={page}
                            totalPages={totalPages}
                            total={total}
                            limit={limit}
                            onPageChange={goToPage}
                            onLimitChange={setLimit}
                            loading={loading}
                        />
                    )}
                </div>
            </section>
        </FirmsAnimator>
    );
}

export default function FirmsClient() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-base-100 flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg text-primary" />
                </div>
            }
        >
            <FirmsClientInner />
        </Suspense>
    );
}
