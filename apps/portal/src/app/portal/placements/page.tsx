"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    PaginationControls,
    LoadingState,
    EmptyState,
    ErrorState,
} from "@/hooks/use-standard-list";
import type { ViewMode } from "./components/shared/accent";
import { PlacementsAnimator } from "./placements-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";
import { FilterProvider, useFilter } from "./contexts/filter-context";

export default function PlacementsPage() {
    return (
        <FilterProvider>
            <PlacementsPageContent />
        </FilterProvider>
    );
}

function PlacementsPageContent() {
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
        goToPage,
        total,
        totalPages,
        refresh,
    } = useFilter();

    const handleSelect = useCallback((placement: any) => {
        setSelectedPlacementId((prev) => (prev === placement.id ? null : placement.id));
    }, []);

    const handleViewModeChange = useCallback(
        (mode: ViewMode) => {
            setViewMode(mode);
            // Update URL
            const params = new URLSearchParams(searchParams);
            if (mode !== "grid") {
                params.set("view", mode);
            } else {
                params.delete("view");
            }
            if (selectedPlacementId) {
                params.set("placementId", selectedPlacementId);
            } else {
                params.delete("placementId");
            }
            const queryString = params.toString();
            const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
            router.replace(newUrl, { scroll: false });
        },
        [pathname, router, searchParams, selectedPlacementId],
    );

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
                                        />
                                    )}
                                    {viewMode === "grid" && (
                                        <GridView
                                            placements={placements}
                                            onSelect={handleSelect}
                                            selectedId={selectedPlacementId}
                                        />
                                    )}
                                    {viewMode === "split" && (
                                        <SplitView
                                            placements={placements}
                                            onSelect={handleSelect}
                                            selectedId={selectedPlacementId}
                                        />
                                    )}
                                </>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <PaginationControls
                                page={page}
                                totalPages={totalPages}
                                total={total}
                                onPageChange={goToPage}
                                loading={loading}
                            />
                        )}
                    </div>
                </section>
            </PlacementsAnimator>
        </>
    );
}
