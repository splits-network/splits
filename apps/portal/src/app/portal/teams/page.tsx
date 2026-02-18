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
import { ModalPortal } from "@splits-network/shared-ui";
import type { Team, TeamFilters } from "./types";
import type { ViewMode } from "./components/shared/accent";
import { TeamsAnimator } from "./teams-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";
import { CreateTeamModal } from "./components/modals/create-team-modal";

export default function TeamsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(() =>
        searchParams.get("teamId"),
    );
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Sync viewMode + selectedTeamId to URL
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
            <TeamsAnimator>
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
                            onAddTeam={() => setShowCreateModal(true)}
                        />

                        {/* Listing Count */}
                        <p className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-6">
                            Showing {teams.length} of{" "}
                            {pagination?.total ?? teams.length} teams
                        </p>

                        {/* Content Area */}
                        <div className="listings-content opacity-0">
                            {loading && teams.length === 0 ? (
                                <LoadingState message="Loading teams..." />
                            ) : teams.length === 0 ? (
                                <EmptyState
                                    icon="fa-users"
                                    title="No Teams Found"
                                    description="Create a team to collaborate with other recruiters and manage split distributions."
                                    action={{
                                        label: "Create Your First Team",
                                        onClick: () => setShowCreateModal(true),
                                    }}
                                />
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
            </TeamsAnimator>

            <ModalPortal>
                {showCreateModal && (
                    <CreateTeamModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            refresh();
                        }}
                    />
                )}
            </ModalPortal>
        </>
    );
}
