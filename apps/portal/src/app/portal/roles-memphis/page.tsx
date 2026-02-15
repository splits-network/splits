"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
    useStandardList,
    PaginationControls,
    LoadingState,
    EmptyState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { SearchInput } from "@splits-network/memphis-ui";
import type { Job, UnifiedJobFilters } from "../roles/types";
import type { ViewMode } from "./components/accent";
import { isNew } from "./components/helpers";
import { ListsSixAnimator } from "./lists-six-animator";
import { HeaderSection } from "./components/header-section";
import { ViewModeToggle } from "./components/view-mode-toggle";
import { TableView } from "./components/table-view";
import { GridView } from "./components/grid-view";
import { SplitView } from "./components/split-view";

export default function RolesMemphisPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    const {
        data: jobs,
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
    } = useStandardList<Job, UnifiedJobFilters>({
        endpoint: "/jobs",
        defaultFilters: { status: undefined, job_owner_filter: "all" },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
        include: "company",
    });

    const handleSelect = useCallback((job: Job) => {
        setSelectedJobId((prev) => (prev === job.id ? null : job.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
        setSelectedJobId(null);
    }, []);

    const stats = useMemo(
        () => ({
            total: pagination?.total || jobs.length,
            active: jobs.filter((j) => j.status === "active").length,
            newJobs: jobs.filter((j) => isNew(j)).length,
            totalApps: jobs.reduce(
                (sum, j) => sum + (j.application_count ?? 0),
                0,
            ),
        }),
        [jobs, pagination],
    );

    // Count active filters
    const activeFilterCount = [
        filters.status,
        filters.employment_type,
        filters.commute_type,
        filters.job_level,
        filters.is_remote,
    ].filter(Boolean).length;

    // Close filter panel on outside click
    useEffect(() => {
        if (!filtersOpen) return;
        const handler = (e: MouseEvent) => {
            if (
                filterRef.current &&
                !filterRef.current.contains(e.target as Node)
            ) {
                setFiltersOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [filtersOpen]);

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <ListsSixAnimator>
            <HeaderSection stats={stats} />

            <section className="min-h-screen bg-cream">
                <div className="py-8 px-4 lg:px-8">
                    {/* Controls Bar */}
                    <div className="controls-bar mb-6 opacity-0">
                        {/* Search */}
                        <div className="flex-1">
                            <SearchInput
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Search roles, companies, locations..."
                            />
                        </div>

                        {/* Filters Toggle */}
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setFiltersOpen((o) => !o)}
                                className="btn btn-sm btn-dark btn-outline"
                                title="Filters"
                            >
                                <i className="fa-duotone fa-filter" />
                                <span className="hidden sm:inline">Filters</span>
                                {activeFilterCount > 0 && (
                                    <span className="badge badge-sm badge-coral">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>

                            {/* Filter Panel */}
                            {filtersOpen && (
                                <div className="absolute right-0 top-full mt-2 card bg-white p-4 space-y-4 z-50" style={{ minWidth: '288px' }}>
                                    <div className="flex justify-between items-center pb-2 border-b-4 border-dark">
                                        <span className="font-bold text-sm uppercase tracking-wider text-dark">Filters</span>
                                        <button
                                            onClick={clearFilters}
                                            className="text-xs font-bold uppercase tracking-wider text-dark/60 hover:text-coral"
                                        >
                                            Reset
                                        </button>
                                    </div>

                                    {/* Status Filter */}
                                    <fieldset>
                                        <legend className="text-xs font-bold uppercase tracking-wider text-dark mb-1">Status</legend>
                                        <select
                                            className="select w-full"
                                            value={filters.status || ""}
                                            onChange={(e) => setFilter("status", e.target.value || undefined)}
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="active">Active</option>
                                            <option value="paused">Paused</option>
                                            <option value="filled">Filled</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </fieldset>

                                    {/* Employment Type Filter */}
                                    <fieldset>
                                        <legend className="text-xs font-bold uppercase tracking-wider text-dark mb-1">Employment Type</legend>
                                        <select
                                            className="select w-full"
                                            value={filters.employment_type || ""}
                                            onChange={(e) => setFilter("employment_type", e.target.value || undefined)}
                                        >
                                            <option value="">All Types</option>
                                            <option value="full_time">Full Time</option>
                                            <option value="contract">Contract</option>
                                            <option value="temporary">Temporary</option>
                                        </select>
                                    </fieldset>

                                    {/* Commute Type Filter */}
                                    <fieldset>
                                        <legend className="text-xs font-bold uppercase tracking-wider text-dark mb-1">Commute Type</legend>
                                        <select
                                            className="select w-full"
                                            value={filters.commute_type || ""}
                                            onChange={(e) => setFilter("commute_type", e.target.value || undefined)}
                                        >
                                            <option value="">All Commute Types</option>
                                            <option value="remote">Remote</option>
                                            <option value="hybrid_1">Hybrid (1 day)</option>
                                            <option value="hybrid_2">Hybrid (2 days)</option>
                                            <option value="hybrid_3">Hybrid (3 days)</option>
                                            <option value="hybrid_4">Hybrid (4 days)</option>
                                            <option value="in_office">In Office</option>
                                        </select>
                                    </fieldset>

                                    {/* Job Level Filter */}
                                    <fieldset>
                                        <legend className="text-xs font-bold uppercase tracking-wider text-dark mb-1">Job Level</legend>
                                        <select
                                            className="select w-full"
                                            value={filters.job_level || ""}
                                            onChange={(e) => setFilter("job_level", e.target.value || undefined)}
                                        >
                                            <option value="">All Levels</option>
                                            <option value="entry">Entry Level</option>
                                            <option value="mid">Mid Level</option>
                                            <option value="senior">Senior</option>
                                            <option value="lead">Lead</option>
                                            <option value="manager">Manager</option>
                                            <option value="director">Director</option>
                                            <option value="vp">VP</option>
                                            <option value="c_suite">C-Suite</option>
                                        </select>
                                    </fieldset>

                                    {/* Remote Only Toggle */}
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            checked={!!filters.is_remote}
                                            onChange={(e) => setFilter("is_remote", e.target.checked || undefined)}
                                        />
                                        <span className="text-sm font-bold text-dark">Remote Only</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* View Mode Toggle */}
                        <ViewModeToggle
                            viewMode={viewMode}
                            onViewModeChange={handleViewModeChange}
                        />
                    </div>

                    {/* Content Area */}
                    <div className="listings-content opacity-0">
                        {loading && jobs.length === 0 ? (
                            <LoadingState message="Loading roles..." />
                        ) : jobs.length === 0 ? (
                            <EmptyState
                                icon="fa-briefcase"
                                title="No Roles Found"
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
                                        jobs={jobs}
                                        onSelect={handleSelect}
                                        selectedId={selectedJobId}
                                        onRefresh={refresh}
                                    />
                                )}
                                {viewMode === "grid" && (
                                    <GridView
                                        jobs={jobs}
                                        onSelect={handleSelect}
                                        selectedId={selectedJobId}
                                        onRefresh={refresh}
                                    />
                                )}
                                {viewMode === "split" && (
                                    <SplitView
                                        jobs={jobs}
                                        onSelect={handleSelect}
                                        selectedId={selectedJobId}
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
        </ListsSixAnimator>
    );
}
