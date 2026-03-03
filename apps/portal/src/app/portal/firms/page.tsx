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
import { useGamification } from "@splits-network/shared-gamification";
import type { Firm, FirmFilters } from "./types";
import type { BaselViewMode as ViewMode } from "@splits-network/basel-ui";
import { FirmsAnimator } from "./firms-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";
import { FirmProfileWizard } from "./components/modals/firm-profile-wizard";

export default function FirmsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedFirmId, setSelectedFirmId] = useState<string | null>(() =>
        searchParams.get("firmId"),
    );
    const [showAddModal, setShowAddModal] = useState(false);

    /* -- URL sync -- */
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());
        if (selectedFirmId) {
            params.set("firmId", selectedFirmId);
        } else {
            params.delete("firmId");
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
    }, [selectedFirmId, viewMode, pathname, router]);

    /* -- User profile -- */
    const { isAdmin, isRecruiter, planTier } = useUserProfile();
    const isPartner = planTier === "partner";
    const canCreateFirm = isAdmin || (isRecruiter && isPartner);

    /* -- Data -- */
    const {
        data: firms,
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
    } = useStandardList<Firm, FirmFilters>({
        endpoint: "/firms",
        defaultFilters: { status: undefined },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
    });

    const { registerEntities } = useGamification();

    useEffect(() => {
        const firmIds = firms.map((f) => f.id);
        if (firmIds.length > 0) {
            registerEntities("firm", [...new Set(firmIds)]);
        }
    }, [firms, registerEntities]);

    const handleSelect = useCallback((firm: Firm) => {
        setSelectedFirmId((prev) => (prev === firm.id ? null : firm.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const stats = useMemo(
        () => ({
            total: pagination?.total || firms.length,
            active: firms.filter((t) => t.status === "active").length,
            totalMembers: firms.reduce(
                (sum, t) => sum + (t.active_member_count || 0),
                0,
            ),
            totalRevenue: firms.reduce(
                (sum, t) => sum + (t.total_revenue || 0),
                0,
            ),
        }),
        [firms, pagination],
    );

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <>
            <FirmsAnimator contentRef={contentRef}>
                <HeaderSection stats={stats} />

                <ControlsBar
                    searchInput={searchInput}
                    onSearchChange={setSearchInput}
                    filters={filters}
                    onFilterChange={setFilter}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    canCreateFirm={canCreateFirm}
                    showUpgradeHint={isRecruiter && !isPartner}
                    onAddFirm={() => setShowAddModal(true)}
                    firmCount={firms.length}
                    totalCount={pagination?.total ?? firms.length}
                    loading={loading}
                    refresh={refresh}
                />

                {/* Content Area */}
                <section className="content-area opacity-0 p-4">
                    <div ref={contentRef}>
                        {loading && firms.length === 0 ? (
                            <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                                <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                                <p className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                                    Loading your firms...
                                </p>
                            </div>
                        ) : firms.length === 0 ? (
                            <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-5xl text-base-content/15 mb-6 block" />
                                <h3 className="text-2xl font-black tracking-tight mb-2">
                                    No matching firms
                                </h3>
                                <p className="text-base-content/50 mb-6">
                                    Adjust your search or clear filters to see
                                    available firms.
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
                                    <TableView
                                        firms={firms}
                                        onSelect={handleSelect}
                                        selectedId={selectedFirmId}
                                        onRefresh={refresh}
                                    />
                                )}
                                {viewMode === "grid" && (
                                    <GridView
                                        firms={firms}
                                        onSelectAction={handleSelect}
                                        selectedId={selectedFirmId}
                                        onRefreshAction={refresh}
                                    />
                                )}
                                {viewMode === "split" && (
                                    <SplitView
                                        firms={firms}
                                        onSelect={handleSelect}
                                        selectedId={selectedFirmId}
                                        onRefresh={refresh}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </section>

                {/* Pagination */}
                <div className="container mx-auto px-6 lg:px-12 py-6">
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
            </FirmsAnimator>

            <FirmProfileWizard
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    setShowAddModal(false);
                    refresh();
                }}
            />
        </>
    );
}
