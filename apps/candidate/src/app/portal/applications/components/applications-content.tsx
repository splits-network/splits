"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewMode, type ViewMode } from "@/hooks/use-view-mode";
import { LoadingState } from "@/components/standard-lists/loading-state";
import { useToast } from "@/lib/toast-context";
import { FilterProvider, useFilter } from "../contexts/filter-context";
import HeaderFilters from "./shared/header-filters";
import Stats from "./shared/stats";
import BrowseView from "./browse/view";
import TableView from "./table/view";
import GridView from "./grid/view";

export default function ApplicationsContent() {
    return (
        <FilterProvider>
            <ApplicationsPageContent />
        </FilterProvider>
    );
}

function ApplicationsPageContent() {
    const { viewMode, setViewMode, isLoaded } = useViewMode(
        "applicationsNewViewMode",
    );
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { success, info } = useToast();
    const toastShownRef = useRef(false);

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

    // Handle success/draft query params from redirects
    useEffect(() => {
        if (toastShownRef.current) return;

        const successParam = searchParams.get("success");
        const draftParam = searchParams.get("draft");

        if (successParam === "true") {
            success(
                "Application submitted successfully! You'll receive an email once it has been reviewed.",
            );
            toastShownRef.current = true;
            router.replace(pathname);
        }
        if (draftParam === "true") {
            info(
                "Application saved as draft! You can edit and submit it anytime.",
            );
            toastShownRef.current = true;
            router.replace(pathname);
        }
    }, [searchParams, success, info, router, pathname]);

    // Clear URL params when switching views to prevent stale selection
    const handleViewChange = useCallback(
        (newView: ViewMode) => {
            router.replace(pathname);
            setViewMode(newView);
        },
        [router, pathname, setViewMode],
    );

    if (!isLoaded) {
        return <LoadingState message="Loading applications..." />;
    }

    return (
        <>
            <PageTitle
                title="Applications"
                subtitle="Track and manage your job applications"
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
