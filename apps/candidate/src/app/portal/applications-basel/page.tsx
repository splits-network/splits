"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    useStandardList,
    PaginationControls,
    ErrorState,
} from "@/hooks/use-standard-list";
import type { Application, ApplicationFilters } from "./types";
import type { ViewMode } from "./components/shared/status-color";
import { ApplicationsAnimator } from "./applications-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";

const ACTIVE_STAGES = [
    "submitted",
    "screen",
    "interview",
    "company_review",
    "company_feedback",
    "recruiter_review",
];
const PENDING_STAGES = ["draft", "ai_review", "ai_reviewed"];

export default function ApplicationsBaselPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedId, setSelectedId] = useState<string | null>(() =>
        searchParams.get("appId"),
    );

    /* ── URL sync ── */
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());
        if (selectedId) {
            params.set("appId", selectedId);
        } else {
            params.delete("appId");
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
    }, [selectedId, viewMode, pathname, router]);

    /* ── Data ── */
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
        defaultFilters: { stage: undefined },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
        include: "job,recruiter,ai_review",
    });

    const handleSelect = useCallback((app: Application) => {
        setSelectedId((prev) => (prev === app.id ? null : app.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const stats = useMemo(
        () => ({
            total: pagination?.total || applications.length,
            active: applications.filter((a) =>
                ACTIVE_STAGES.includes(a.stage),
            ).length,
            pending: applications.filter((a) =>
                PENDING_STAGES.includes(a.stage),
            ).length,
            proposals: applications.filter(
                (a) => a.stage === "recruiter_proposed",
            ).length,
        }),
        [applications, pagination],
    );

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <ApplicationsAnimator contentRef={contentRef}>
            <HeaderSection stats={stats} />

            <ControlsBar
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                filters={filters}
                onFilterChange={setFilter}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                appCount={applications.length}
                totalCount={pagination?.total ?? applications.length}
            />

            {/* Content Area */}
            <section className="content-area opacity-0">
                <div ref={contentRef}>
                    {loading && applications.length === 0 ? (
                        <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                            <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                Loading your applications...
                            </p>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                            <i className="fa-duotone fa-regular fa-magnifying-glass text-5xl text-base-content/15 mb-6 block" />
                            <h3 className="text-2xl font-black tracking-tight mb-2">
                                No applications found
                            </h3>
                            <p className="text-base-content/50 mb-6">
                                Adjust your search or clear filters to see your
                                applications.
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
                                    applications={applications}
                                    onSelect={handleSelect}
                                    selectedId={selectedId}
                                    onRefresh={refresh}
                                />
                            )}
                            {viewMode === "grid" && (
                                <GridView
                                    applications={applications}
                                    onSelect={handleSelect}
                                    selectedId={selectedId}
                                    onRefresh={refresh}
                                />
                            )}
                            {viewMode === "split" && (
                                <SplitView
                                    applications={applications}
                                    onSelect={handleSelect}
                                    selectedId={selectedId}
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
        </ApplicationsAnimator>
    );
}
