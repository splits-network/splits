"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    useStandardList,
    PaginationControls,
    LoadingState,
    EmptyState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { ApplicationsAnimator } from "./applications-animator";
import type { Application, ApplicationFilters, ViewMode } from "./types";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";
import UniversalSubmitCandidateWizard from "@/app/portal/applications/components/wizards/universal-submit-candidate-wizard";

export default function ApplicationsBaselPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [showSubmitWizard, setShowSubmitWizard] = useState(false);

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedApplicationId, setSelectedApplicationId] = useState<
        string | null
    >(() => searchParams.get("applicationId"));

    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(
            searchParamsRef.current.toString(),
        );

        if (selectedApplicationId) {
            params.set("applicationId", selectedApplicationId);
        } else {
            params.delete("applicationId");
        }

        if (viewMode !== "grid") {
            params.set("view", viewMode);
        } else {
            params.delete("view");
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        const currentQuery = searchParamsRef.current.toString();
        const currentUrl = currentQuery
            ? `${pathname}?${currentQuery}`
            : pathname;

        if (newUrl !== currentUrl) {
            router.replace(newUrl, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedApplicationId, viewMode, pathname, router]);

    const {
        data: applications,
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
    } = useStandardList<Application, ApplicationFilters>({
        endpoint: "/applications",
        include: "candidate,job,company,ai_review",
        defaultFilters: {
            stage: undefined,
            ai_score_filter: undefined,
            scope: undefined,
        },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
    });

    const handleSelect = useCallback((application: Application) => {
        setSelectedApplicationId((prev) =>
            prev === application.id ? null : application.id,
        );
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const stats = useMemo(
        () => ({
            total: pagination?.total || applications.length,
            submitted: applications.filter((a) => a.stage === "submitted")
                .length,
            interview: applications.filter((a) => a.stage === "interview")
                .length,
            offer: applications.filter((a) => a.stage === "offer").length,
        }),
        [applications, pagination],
    );

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <ApplicationsAnimator>
            <HeaderSection stats={stats} />

            <ControlsBar
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                filters={filters}
                onFilterChange={setFilter}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                loading={loading}
                refresh={refresh}
                onSubmitCandidate={() => setShowSubmitWizard(true)}
            />

            {/* Results count */}
            <div className="container mx-auto px-6 lg:px-12 pt-6">
                <p className="text-sm uppercase tracking-wider text-base-content/40 font-bold">
                    {applications.length} of{" "}
                    {pagination?.total ?? applications.length} applications
                </p>
            </div>

            {/* Content area */}
            <section className="content-area opacity-0">
                <div className="container mx-auto px-6 lg:px-12 py-6">
                    {loading && applications.length === 0 ? (
                        <LoadingState message="Loading pipeline..." />
                    ) : applications.length === 0 ? (
                        <div className="py-28 text-center">
                            <i className="fa-duotone fa-regular fa-magnifying-glass text-5xl text-base-content/15 mb-6 block"></i>
                            <h3 className="text-2xl font-black tracking-tight mb-2">
                                No matching applications
                            </h3>
                            <p className="text-base-content/50 mb-6">
                                Adjust your filters or clear the search to see results.
                            </p>
                            <button
                                onClick={() => {
                                    clearSearch();
                                    clearFilters();
                                }}
                                className="btn btn-primary btn-sm"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            {viewMode === "table" && (
                                <TableView
                                    applications={applications}
                                    onSelect={handleSelect}
                                    selectedId={selectedApplicationId}
                                    onRefresh={refresh}
                                />
                            )}
                            {viewMode === "grid" && (
                                <GridView
                                    applications={applications}
                                    onSelect={handleSelect}
                                    selectedId={selectedApplicationId}
                                    onRefresh={refresh}
                                />
                            )}
                            {viewMode === "split" && (
                                <SplitView
                                    applications={applications}
                                    onSelect={handleSelect}
                                    selectedId={selectedApplicationId}
                                    onRefresh={refresh}
                                />
                            )}
                        </>
                    )}
                </div>

                <div className="container mx-auto px-6 lg:px-12 pb-8">
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

            {/* Submit Candidate Wizard (reuse original) */}
            <UniversalSubmitCandidateWizard
                isOpen={showSubmitWizard}
                onClose={() => setShowSubmitWizard(false)}
                onSuccess={() => {
                    setShowSubmitWizard(false);
                    refresh();
                }}
            />
        </ApplicationsAnimator>
    );
}
