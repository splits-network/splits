"use client";

import { PageTitle } from "@/components/page-title";
import { FilterProvider, useFilter } from "./contexts/filter-context";
import HeaderFilters from "./components/shared/header-filters";
import Stats from "./components/shared/stats";
import BrowseView from "./components/browse/view";

export default function MessagesNewPage() {
    return (
        <FilterProvider>
            <MessagesNewPageContent />
        </FilterProvider>
    );
}

function MessagesNewPageContent() {
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
        requestCount,
    } = useFilter();

    return (
        <>
            <PageTitle
                title="Messages"
                subtitle="Manage candidate and company conversations"
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
                    requestCount={requestCount}
                />
            </PageTitle>

            <div className="space-y-6">
                {showStats && <Stats />}
                <BrowseView />
            </div>
        </>
    );
}
