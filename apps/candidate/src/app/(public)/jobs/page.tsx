"use client";

import { useState, useRef, useMemo, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useStandardList } from "@/hooks/use-standard-list";
import { PaginationControls } from "@/components/standard-lists/pagination-controls";
import { LoadingState } from "@/components/standard-lists/loading-state";
import { ErrorState } from "@/components/standard-lists/error-state";
import { BaselEmptyState } from "@splits-network/basel-ui";
import type { Job, JobFilters } from "./types";
import type { ViewMode } from "./components/shared/status-color";
import { JobsAnimator } from "./jobs-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { GridView } from "./components/grid/grid-view";
import { TableView } from "./components/table/table-view";
import { SplitView } from "./components/split/split-view";

function JobsPageInner() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const contentRef = useRef<HTMLDivElement>(null);

    /* -- View mode (3-way: grid | table | split) -- */

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const param = searchParams.get("view");
        if (param === "table" || param === "split") return param;
        return "grid";
    });

    /* -- Selection -- */

    const [selectedJobId, setSelectedJobId] = useState<string | null>(
        () => searchParams.get("jobId") || null,
    );

    /* -- URL sync -- */

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (selectedJobId) {
            params.set("jobId", selectedJobId);
        } else {
            params.delete("jobId");
        }

        if (viewMode !== "grid") {
            params.set("view", viewMode);
        } else {
            params.delete("view");
        }

        const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
        router.replace(newUrl, { scroll: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedJobId, viewMode, pathname]);

    /* -- Data fetching -- */

    const {
        data: jobs,
        loading,
        error,
        pagination,
        searchInput,
        setSearchInput,
        filters,
        setFilter,
        page,
        limit,
        totalPages,
        total,
        goToPage,
        setLimit,
        refresh,
    } = useStandardList<Job, JobFilters>({
        endpoint: "/jobs",
        defaultFilters: { employment_type: undefined },
        defaultSortBy: "updated_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
        autoFetch: true,
        requireAuth: false,
        include: "company",
    });

    /* -- Stats -- */

    const stats = useMemo(() => {
        const now = Date.now();
        const sevenDays = 7 * 86400000;
        let activeCount = 0;
        let newCount = 0;
        let remoteCount = 0;

        for (const job of jobs) {
            if (job.status === "active") activeCount++;
            if (job.created_at) {
                const d =
                    typeof job.created_at === "string"
                        ? new Date(job.created_at)
                        : job.created_at;
                if (now - d.getTime() <= sevenDays) newCount++;
            }
            if (
                job.commute_types?.includes("remote") ||
                job.location?.toLowerCase().includes("remote")
            ) {
                remoteCount++;
            }
        }

        return { total, activeCount, newCount, remoteCount };
    }, [jobs, total]);

    /* -- Handlers -- */

    const handleSelect = useCallback(
        (job: Job) => {
            setSelectedJobId((prev) =>
                prev === job.id ? null : job.id,
            );
        },
        [],
    );

    const handleViewModeChange = useCallback(
        (mode: ViewMode) => {
            if (mode === viewMode) return;
            setViewMode(mode);
            setSelectedJobId(null);
        },
        [viewMode],
    );

    const handleFilterChange = useCallback(
        (key: keyof JobFilters, value: string | undefined) => {
            setFilter(key, value as any);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    /* -- Render -- */

    return (
        <JobsAnimator contentRef={contentRef}>
            {/* Hero */}
            <HeaderSection
                total={stats.total}
                activeCount={stats.activeCount}
                newCount={stats.newCount}
                remoteCount={stats.remoteCount}
            />

            {/* Controls */}
            <ControlsBar
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                filters={filters}
                onFilterChange={handleFilterChange}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                resultCount={jobs.length}
                totalCount={total}
            />

            {/* Content */}
            <section className="content-area opacity-0">
                <div className="container mx-auto px-6 lg:px-12 py-8">
                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState message={error} onRetry={refresh} />
                    ) : jobs.length === 0 ? (
                        <BaselEmptyState
                            icon="fa-duotone fa-regular fa-briefcase"
                            title="No jobs found"
                            subtitle={
                                searchInput || filters.employment_type
                                    ? "Try adjusting your search or filters"
                                    : "Check back soon for new opportunities"
                            }
                            actions={
                                searchInput || filters.employment_type
                                    ? [
                                          {
                                              label: "Clear Filters",
                                              onClick: () => {
                                                  setSearchInput("");
                                                  setFilter(
                                                      "employment_type",
                                                      undefined as any,
                                                  );
                                              },
                                              style: "btn-primary",
                                          },
                                      ]
                                    : []
                            }
                        />
                    ) : (
                        <div ref={contentRef}>
                            {viewMode === "grid" && (
                                <GridView
                                    jobs={jobs}
                                    selectedId={selectedJobId}
                                    onSelect={handleSelect}
                                />
                            )}
                            {viewMode === "table" && (
                                <TableView
                                    jobs={jobs}
                                    selectedId={selectedJobId}
                                    onSelect={handleSelect}
                                />
                            )}
                            {viewMode === "split" && (
                                <SplitView
                                    jobs={jobs}
                                    selectedId={selectedJobId}
                                    onSelect={handleSelect}
                                />
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && jobs.length > 0 && (
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
        </JobsAnimator>
    );
}

export default function JobsBaselPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-base-100 flex items-center justify-center">
                    <div className="text-center">
                        <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                            Loading opportunities...
                        </span>
                    </div>
                </div>
            }
        >
            <JobsPageInner />
        </Suspense>
    );
}
