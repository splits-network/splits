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
import { ListsSixAnimator } from "./lists-six-animator";
import type { Application, ApplicationFilters } from "./types";
import type { ViewMode } from "./components/shared/accent";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";

export default function ApplicationsMemphisPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
        () => searchParams.get("applicationId"),
    );

    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        if (selectedApplicationId) {
            params.set("applicationId", selectedApplicationId);
        } else {
            params.delete("applicationId");
        }

        if (viewMode !== "grid") {
            params.set("view", viewMode);
        } else {
            params.delete("view");
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        const currentQuery = searchParamsRef.current.toString();
        const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;

        if (newUrl !== currentUrl) {
            router.replace(newUrl, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedApplicationId, viewMode, pathname, router]);

    const {
        data: applications,
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
    } = useStandardList<Application, ApplicationFilters>({
        endpoint: "/applications",
        include: "candidate,job,company,ai_review",
        defaultFilters: { stage: undefined, ai_score_filter: undefined, scope: undefined },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
    });

    const handleSelect = useCallback((application: Application) => {
        setSelectedApplicationId((prev) => (prev === application.id ? null : application.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const stats = useMemo(
        () => ({
            total: pagination?.total || applications.length,
            submitted: applications.filter((a) => a.stage === "submitted").length,
            interview: applications.filter((a) => a.stage === "interview").length,
            offer: applications.filter((a) => a.stage === "offer").length,
        }),
        [applications, pagination],
    );

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <ListsSixAnimator>
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
                        loading={loading}
                        refresh={refresh}
                    />

                    <p className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-6 mt-4">
                        Showing {applications.length} of {pagination?.total ?? applications.length} applications
                    </p>

                    <div className="listings-content opacity-0">
                        {loading && applications.length === 0 ? (
                            <LoadingState message="Loading applications..." />
                        ) : applications.length === 0 ? (
                            <EmptyState
                                icon="fa-file-lines"
                                title="No Applications Found"
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
                                        applications={applications}
                                        onSelect={handleSelect}
                                        selectedId={selectedApplicationId}
                                        onRefresh={refresh}
                                    />
                                )}
                                {viewMode === "grid" && (
                                    <GridView
                                        applications={applications}
                                        onSelect={handleSelect}
                                        selectedId={selectedApplicationId}
                                        onRefresh={refresh}
                                    />
                                )}
                                {viewMode === "split" && (
                                    <SplitView
                                        applications={applications}
                                        onSelect={handleSelect}
                                        selectedId={selectedApplicationId}
                                        onRefresh={refresh}
                                    />
                                )}
                            </>
                        )}
                    </div>

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
        </ListsSixAnimator>
    );
}
