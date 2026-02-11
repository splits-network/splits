"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewMode, type ViewMode } from "@/hooks/use-view-mode";
import { LoadingState } from "@splits-network/shared-ui";
import { FilterProvider, useFilter } from "./contexts/filter-context";
import HeaderFilters from "./components/shared/header-filters";
import Stats from "./components/shared/stats";
import BrowseView from "./components/browse/view";
import TableView from "./components/table/view";
import GridView from "./components/grid/view";

export default function ApplicationsNewPage() {
    return (
        <FilterProvider>
            <ApplicationsNewPageContent />
        </FilterProvider>
    );
}

function ApplicationsNewPageContent() {
    const { viewMode, setViewMode, isLoaded } = useViewMode(
        "applicationsNewViewMode",
    );
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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

    const handleViewChange = useCallback(
        (newView: ViewMode) => {
            // Preserve search parameters when changing views
            const params = new URLSearchParams(searchParams);
            const url = params.toString()
                ? `${pathname}?${params.toString()}`
                : pathname;
            router.replace(url);
            setViewMode(newView);
        },
        [router, pathname, searchParams, setViewMode],
    );

    if (!isLoaded) {
        return <LoadingState message="Loading applications..." />;
    }

    return (
        <>
            <PageTitle
                title="Applications"
                subtitle="Track and manage candidate applications"
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
