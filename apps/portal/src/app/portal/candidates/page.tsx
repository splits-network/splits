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

export default function CandidatesPage() {
    return (
        <FilterProvider>
            <CandidatesPageContent />
        </FilterProvider>
    );
}

function CandidatesPageContent() {
    const { viewMode, setViewMode, isLoaded } = useViewMode(
        "candidatesNewViewMode",
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
        scope,
        setScope,
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
        return <LoadingState message="Loading candidates..." />;
    }

    return (
        <>
            <PageTitle
                title="Candidates"
                subtitle="Manage your candidate pipeline"
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
                    scope={scope}
                    setScope={setScope}
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
