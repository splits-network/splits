"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Grid from "./components/grid/view";
import List from "./components/table/view";
import BrowseRolesView from "./components/browse/browse-view";
import { HeaderFilters } from "./components/header-filters";
import { PageTitle } from "@/components/page-title";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewMode, ViewMode } from "@/hooks/use-view-mode";
import { LoadingState } from "@splits-network/shared-ui";
import {
    RolesFilterProvider,
    useRolesFilter,
} from "./contexts/roles-filter-context";

function RolesPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { viewMode, setViewMode, isLoaded } = useViewMode("rolesViewMode");

    // Get filter state from context to pass to header filters
    const {
        profileLoading,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        loading,
        canCreateRole,
        showJobAssignmentFilter,
        refresh,
        showStats,
        setShowStats,
    } = useRolesFilter();

    // Preserve search parameters when changing views
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

    // Prevent hydration mismatch by not rendering until loaded
    if (!isLoaded || profileLoading) {
        return <LoadingState message="Loading roles..." />;
    }

    return (
        <>
            <PageTitle
                title="Roles"
                subtitle={"Browse and manage job opportunities"}
            >
                <HeaderFilters
                    viewMode={viewMode}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    clearSearch={clearSearch}
                    filters={filters}
                    setFilter={setFilter}
                    loading={loading}
                    canCreateRole={canCreateRole}
                    showJobAssignmentFilter={showJobAssignmentFilter}
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
                {viewMode === "browse" ? (
                    <BrowseRolesView />
                ) : viewMode === "table" ? (
                    <List view={viewMode} />
                ) : (
                    <Grid view={viewMode} />
                )}
            </div>
        </>
    );
}

export default function RolesPage() {
    return (
        <RolesFilterProvider>
            <RolesPageContent />
        </RolesFilterProvider>
    );
}
