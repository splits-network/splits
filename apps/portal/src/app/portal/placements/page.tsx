"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    useStandardList,
    PaginationControls,
    ErrorState,
} from "@/hooks/use-standard-list";
import type { Placement, PlacementFilters } from "./types";
import type { ViewMode } from "./components/shared/status-color";
import { PlacementsAnimator } from "./placements-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";

export default function PlacementsBaselPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(
        () => searchParams.get("placementId"),
    );

    /* ── URL sync ── */
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        if (selectedPlacementId) {
            params.set("placementId", selectedPlacementId);
        } else {
            params.delete("placementId");
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
    }, [selectedPlacementId, viewMode, pathname, router]);

    /* ── Data ── */
    const {
        data: placements,
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
    } = useStandardList<Placement, PlacementFilters>({
        endpoint: "/placements",
        include: "candidate,job,company",
        defaultFilters: { status: undefined },
        defaultSortBy: "hired_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: true,
    });

    const handleSelect = useCallback((placement: Placement) => {
        setSelectedPlacementId((prev) =>
            prev === placement.id ? null : placement.id,
        );
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const stats = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const totalEarnings = placements.reduce(
            (sum, p) => sum + (p.recruiter_share || 0),
            0,
        );
        const thisYearPlacements = placements.filter(
            (p) =>
                p.hired_at &&
                new Date(p.hired_at).getFullYear() === currentYear,
        );
        const thisYearEarnings = thisYearPlacements.reduce(
            (sum, p) => sum + (p.recruiter_share || 0),
            0,
        );

        return {
            total: pagination?.total || placements.length,
            totalEarnings,
            thisYearEarnings,
            avgCommission:
                placements.length > 0
                    ? Math.round(totalEarnings / placements.length)
                    : 0,
        };
    }, [placements, pagination]);

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <PlacementsAnimator contentRef={contentRef}>
            <HeaderSection stats={stats} />

            <ControlsBar
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                filters={filters}
                onFilterChange={setFilter}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                placementCount={placements.length}
                totalCount={pagination?.total ?? placements.length}
            />

            {/* Content Area */}
            <section className="content-area opacity-0">
                <div ref={contentRef}>
                    {loading && placements.length === 0 ? (
                        <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                            <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                Loading placements...
                            </p>
                        </div>
                    ) : placements.length === 0 ? (
                        <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                            <i className="fa-duotone fa-regular fa-magnifying-glass text-5xl text-base-content/15 mb-6 block" />
                            <h3 className="text-2xl font-black tracking-tight mb-2">
                                No placements found
                            </h3>
                            <p className="text-base-content/50 mb-6">
                                Adjust your search or clear filters to see
                                placements.
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
                                    placements={placements}
                                    onSelect={handleSelect}
                                    selectedId={selectedPlacementId}
                                    onRefresh={refresh}
                                />
                            )}
                            {viewMode === "grid" && (
                                <GridView
                                    placements={placements}
                                    onSelect={handleSelect}
                                    selectedId={selectedPlacementId}
                                    onRefresh={refresh}
                                />
                            )}
                            {viewMode === "split" && (
                                <SplitView
                                    placements={placements}
                                    onSelect={handleSelect}
                                    selectedId={selectedPlacementId}
                                    onRefresh={refresh}
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
        </PlacementsAnimator>
    );
}
