"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
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

export default function CompaniesPage() {
    return (
        <FilterProvider>
            <CompaniesPageContent />
        </FilterProvider>
    );
}

function CompaniesPageContent() {
    const { viewMode, setViewMode, isLoaded } =
        useViewMode("companiesViewMode");
    const router = useRouter();
    const pathname = usePathname();

    const {
        activeTab,
        setActiveTab,
        showStats,
        setShowStats,
        marketplaceContext,
        myCompaniesContext,
    } = useFilter();

    const activeContext =
        activeTab === "marketplace" ? marketplaceContext : myCompaniesContext;

    const handleViewChange = useCallback(
        (newView: ViewMode) => {
            router.replace(pathname);
            setViewMode(newView);
        },
        [router, pathname, setViewMode],
    );

    if (!isLoaded) {
        return <LoadingState message="Loading companies..." />;
    }

    return (
        <>
            <PageTitle
                title="Companies"
                subtitle="Browse marketplace companies and manage your relationships"
            >
                <HeaderFilters
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchInput={activeContext.searchInput}
                    setSearchInput={activeContext.setSearchInput}
                    clearSearch={activeContext.clearSearch}
                    filters={activeContext.filters}
                    setFilter={activeContext.setFilter}
                    loading={activeContext.loading}
                    refresh={activeContext.refresh}
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
