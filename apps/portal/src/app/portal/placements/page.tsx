"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    useStandardList,
    PaginationControls,
    LoadingState,
    EmptyState,
    ErrorState,
} from "@/hooks/use-standard-list";
import type { Placement, PlacementFilters } from "./types";
import type { ViewMode } from "./components/shared/accent";
import { PlacementsAnimator } from "./placements-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";

export default function PlacementsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(
        () => searchParams.get("placementId"),
    );

    // Sync viewMode + selectedPlacementId to URL (ref pattern avoids infinite loops)
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
        setSelectedPlacementId((prev) => (prev === placement.id ? null : placement.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const stats = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const totalEarnings = placements.reduce((sum, p) => sum + (p.recruiter_share || 0), 0);
        const thisYearPlacements = placements.filter(
            (p) => p.hired_at && new Date(p.hired_at).getFullYear() === currentYear,
        );
        const thisYearEarnings = thisYearPlacements.reduce((sum, p) => sum + (p.recruiter_share || 0), 0);

        return {
            total: pagination?.total || placements.length,
            totalEarnings,
            thisYearEarnings,
            avgCommission: placements.length > 0 ? Math.round(totalEarnings / placements.length) : 0,
        };
    }, [placements, pagination]);

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <>
            <PlacementsAnimator>
                <HeaderSection stats={stats} />

                <section className="min-h-screen bg-cream">
                    <div className="py-8 px-4 lg:px-8">
                        <ControlsBar
                            searchInput={searchInput}
                            onSearchChange={setSearchInput}
                            filters={filters}
                            onFilterChange={setFilter}
                            viewMode={viewMode}
                            onViewModeChange={handleViewModeChange}
                        />

                        {/* Listing Count */}
                        <p className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-6">
                            Showing {placements.length} of {pagination?.total ?? placements.length} placements
                        </p>

                        {/* Content Area */}
                        <div className="listings-content opacity-0">
                            {loading && placements.length === 0 ? (
                                <LoadingState message="Loading placements..." />
                            ) : placements.length === 0 ? (
                                <EmptyState
                                    icon="fa-handshake"
                                    title="No Placements Found"
                                    description="Try adjusting your search or filters"
                                    action={{
                                        label: "Reset Filters",
                                        onClick: () => {
                                            clearSearch();
                                            clearFilters();
                                        },
                                    }}
                                />
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

                        {/* Pagination */}
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
                </section>
            </PlacementsAnimator>
        </>
    );
}
