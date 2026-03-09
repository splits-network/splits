"use client";

import { useCalls } from "./hooks/use-calls";
import {
    PaginationControls,
    ErrorState,
} from "@/hooks/use-standard-list";
import { CallStatsBar } from "./components/shared/call-stats-bar";
import { ControlsBar } from "./components/shared/controls-bar";
import { CallTable } from "./components/table/call-table";
import { CallGrid } from "./components/grid/call-grid";

export default function CallsPage() {
    const {
        calls,
        loading,
        error,
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
        stats,
        statsLoading,
        tags,
        viewMode,
        setViewMode,
    } = useCalls();

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <div>
            {/* Stats Bar */}
            <CallStatsBar stats={stats} loading={statsLoading} />

            {/* Controls */}
            <ControlsBar
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                filters={filters}
                onFilterChange={setFilter}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                callCount={calls.length}
                totalCount={total}
                loading={loading}
                refresh={refresh}
                tags={tags}
            />

            {/* Content Area */}
            <section className="p-4">
                {loading && calls.length === 0 ? (
                    <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                        <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                        <p className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                            Loading calls...
                        </p>
                    </div>
                ) : calls.length === 0 ? (
                    <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                        <i className="fa-duotone fa-regular fa-video text-5xl text-base-content/15 mb-6 block" />
                        <h3 className="text-2xl font-black tracking-tight mb-2">
                            No calls found
                        </h3>
                        <p className="text-base-content/50 mb-6">
                            Adjust your search or clear filters to see your
                            call history.
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
                            <CallTable calls={calls} />
                        )}
                        {viewMode === "grid" && (
                            <CallGrid calls={calls} />
                        )}
                    </>
                )}
            </section>

            {/* Pagination */}
            <div className="mx-auto px-6 lg:px-12 py-6">
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
        </div>
    );
}
