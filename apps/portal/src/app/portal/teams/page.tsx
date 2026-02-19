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
import { ModalPortal } from "@splits-network/shared-ui";
import type { Team, TeamFilters } from "./types";
import type { ViewMode } from "./components/shared/status-color";
import { TeamsAnimator } from "./teams-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";
import CreateTeamModal from "./components/modals/create-team-modal";

export default function TeamsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(() =>
        searchParams.get("teamId"),
    );
    const [showAddModal, setShowAddModal] = useState(false);

    /* -- URL sync -- */
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());
        if (selectedTeamId) {
            params.set("teamId", selectedTeamId);
        } else {
            params.delete("teamId");
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
    }, [selectedTeamId, viewMode, pathname, router]);

    /* -- User profile -- */
    const { isAdmin, isRecruiter } = useUserProfile();
    const canCreateTeam = isAdmin || isRecruiter;

    /* -- Data -- */
    const {
        data: teams,
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
    } = useStandardList<Team, TeamFilters>({
        endpoint: "/teams",
        defaultFilters: { status: undefined },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
    });

    const handleSelect = useCallback((team: Team) => {
        setSelectedTeamId((prev) => (prev === team.id ? null : team.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const stats = useMemo(
        () => ({
            total: pagination?.total || teams.length,
            active: teams.filter((t) => t.status === "active").length,
            totalMembers: teams.reduce(
                (sum, t) => sum + t.active_member_count,
                0,
            ),
            totalRevenue: teams.reduce((sum, t) => sum + t.total_revenue, 0),
        }),
        [teams, pagination],
    );

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <>
            <TeamsAnimator contentRef={contentRef}>
                <HeaderSection stats={stats} />

                <ControlsBar
                    searchInput={searchInput}
                    onSearchChange={setSearchInput}
                    filters={filters}
                    onFilterChange={setFilter}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    canCreateTeam={canCreateTeam}
                    onAddTeam={() => setShowAddModal(true)}
                    teamCount={teams.length}
                    totalCount={pagination?.total ?? teams.length}
                />

                {/* Content Area */}
                <section className="content-area opacity-0">
                    <div ref={contentRef}>
                        {loading && teams.length === 0 ? (
                            <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                                <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                    Loading your teams...
                                </p>
                            </div>
                        ) : teams.length === 0 ? (
                            <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-5xl text-base-content/15 mb-6 block" />
                                <h3 className="text-2xl font-black tracking-tight mb-2">
                                    No matching teams
                                </h3>
                                <p className="text-base-content/50 mb-6">
                                    Adjust your search or clear filters to see
                                    available teams.
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
                                        teams={teams}
                                        onSelect={handleSelect}
                                        selectedId={selectedTeamId}
                                        onRefresh={refresh}
                                    />
                                )}
                                {viewMode === "grid" && (
                                    <GridView
                                        teams={teams}
                                        onSelectAction={handleSelect}
                                        selectedId={selectedTeamId}
                                        onRefreshAction={refresh}
                                    />
                                )}
                                {viewMode === "split" && (
                                    <SplitView
                                        teams={teams}
                                        onSelect={handleSelect}
                                        selectedId={selectedTeamId}
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
            </TeamsAnimator>

            <ModalPortal>
                {showAddModal && (
                    <CreateTeamModal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => {
                            setShowAddModal(false);
                            refresh();
                        }}
                    />
                )}
            </ModalPortal>
        </>
    );
}
