"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewMode, type ViewMode } from "@/hooks/use-view-mode";
import { LoadingState } from "@/components/standard-lists/loading-state";
import type { PaginationResponse } from "@splits-network/shared-types";
import type { Job } from "../types";
import { FilterProvider, useFilter } from "../contexts/filter-context";
import HeaderFilters from "./shared/header-filters";
import Stats from "./shared/stats";
import BrowseView from "./browse/view";
import TableView from "./table/view";
import GridView from "./grid/view";

interface JobsContentProps {
    initialData?: Job[];
    initialPagination?: PaginationResponse;
}

export default function JobsContent({
    initialData,
    initialPagination,
}: JobsContentProps) {
    return (
        <FilterProvider
            initialData={initialData}
            initialPagination={initialPagination}
        >
            <JobsPageContent />
        </FilterProvider>
    );
}

function JobsPageContent() {
    const { viewMode, setViewMode, isLoaded } = useViewMode(
        "publicJobsViewMode",
    );
    const router = useRouter();
    const pathname = usePathname();

    const {
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        loading,
        refresh,
        showStats,
        setShowStats,
    } = useFilter();

    // Clear URL params when switching views to prevent stale selection
    const handleViewChange = useCallback(
        (newView: ViewMode) => {
            router.replace(pathname);
            setViewMode(newView);
        },
        [router, pathname, setViewMode],
    );

    if (!isLoaded) {
        return <LoadingState message="Loading jobs..." />;
    }

    return (
        <>
            <PageTitle
                title="Browse Jobs"
                subtitle="Search thousands of open roles and apply with one click"
            >
                <HeaderFilters
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    clearSearch={clearSearch}
                    filters={filters}
                    setFilter={setFilter}
                    loading={loading}
                    refresh={refresh}
                    showStats={showStats}
                    setShowStats={setShowStats}
                />
                <ViewToggle
                    viewMode={viewMode}
                    onViewChange={handleViewChange}
                />
            </PageTitle>

            <div className="space-y-6">
                {showStats && <Stats />}

                {viewMode === "browse" && <BrowseView />}
                {viewMode === "table" && <TableView />}
                {viewMode === "grid" && <GridView />}
            </div>
        </>
    );
}
