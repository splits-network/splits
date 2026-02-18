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
import { useUserProfile } from "@/contexts";
import type { RecruiterWithUser, MarketplaceFilters } from "./types";
import type { ViewMode } from "./components/shared/accent";
import { RecruitersAnimator } from "./recruiters-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";
import { CompanyProvider, useCompanyContext } from "./contexts/company-context";

export default function RecruitersMemphisPage() {
    return (
        <CompanyProvider>
            <RecruitersContent />
        </CompanyProvider>
    );
}

function RecruitersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedRecruiterId, setSelectedRecruiterId] = useState<string | null>(() =>
        searchParams.get("recruiterId"),
    );
    const [showInviteFromHeader, setShowInviteFromHeader] = useState(false);

    // Sync viewMode + selectedRecruiterId to URL (ref pattern avoids infinite loops)
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        if (selectedRecruiterId) {
            params.set("recruiterId", selectedRecruiterId);
        } else {
            params.delete("recruiterId");
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
    }, [selectedRecruiterId, viewMode, pathname, router]);

    const { isAdmin, isCompanyUser } = useUserProfile();
    const { canInvite } = useCompanyContext();

    const {
        data: recruiters,
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
    } = useStandardList<RecruiterWithUser, MarketplaceFilters>({
        endpoint: "/recruiters",
        defaultFilters: { status: "active", marketplace_enabled: true },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
        include: "user,reputation",
    });

    const handleSelect = useCallback((recruiter: RecruiterWithUser) => {
        setSelectedRecruiterId((prev) => (prev === recruiter.id ? null : recruiter.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const stats = useMemo(
        () => ({
            total: pagination?.total || recruiters.length,
            active: recruiters.filter((r) => r.marketplace_profile?.status === "active" || !r.marketplace_profile?.status).length,
            avgPlacements:
                recruiters.length > 0
                    ? Math.round(
                          recruiters.reduce(
                              (sum, r) => sum + (r.total_placements || 0),
                              0,
                          ) / recruiters.length,
                      )
                    : 0,
            topRated: recruiters.filter(
                (r) =>
                    r.reputation_score !== undefined &&
                    r.reputation_score !== null &&
                    r.reputation_score >= 80,
            ).length,
        }),
        [recruiters, pagination],
    );

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <RecruitersAnimator>
            <HeaderSection stats={stats} />

            <section className="min-h-screen bg-cream">
                <div className="py-8 px-4 lg:px-8">
                    <ControlsBar
                        searchInput={searchInput}
                        onSearchChange={setSearchInput}
                        filters={filters}
                        onFilterChange={setFilter}
                        viewMode={viewMode}
                        onViewModeChange={handleViewModeChange}
                        canInvite={canInvite}
                        onInvite={() => setShowInviteFromHeader(true)}
                    />

                    {/* Listing Count */}
                    <p className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-6">
                        Showing {recruiters.length} of{" "}
                        {pagination?.total ?? recruiters.length} recruiters
                    </p>

                    {/* Content Area */}
                    <div className="listings-content opacity-0">
                        {loading && recruiters.length === 0 ? (
                            <LoadingState message="Loading recruiters..." />
                        ) : recruiters.length === 0 ? (
                            <EmptyState
                                icon="fa-users"
                                title="No Recruiters Found"
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
                                        recruiters={recruiters}
                                        onSelect={handleSelect}
                                        selectedId={selectedRecruiterId}
                                        onRefresh={refresh}
                                    />
                                )}
                                {viewMode === "grid" && (
                                    <GridView
                                        recruiters={recruiters}
                                        onSelectAction={handleSelect}
                                        selectedId={selectedRecruiterId}
                                        onRefreshAction={refresh}
                                    />
                                )}
                                {viewMode === "split" && (
                                    <SplitView
                                        recruiters={recruiters}
                                        onSelect={handleSelect}
                                        selectedId={selectedRecruiterId}
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
        </RecruitersAnimator>
    );
}
