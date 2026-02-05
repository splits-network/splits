"use client";

import { useMemo, useState } from "react";
import {
    useStandardList,
    PaginationControls,
    ViewModeToggle,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { StatCard, StatCardGrid } from "@/components/ui/cards";
import { PageTitle } from "@/components/page-title";

// Import new components
import PlacementCard from "./components/placement-card";
import PlacementTableRow from "./components/placement-table-row";
import PlacementDetailSidebar from "./components/placement-detail-sidebar";
import { Placement } from "./components/placement-actions-toolbar";

// ===== TYPES =====

interface PlacementFilters {
    status?: string;
}

// ===== COMPONENT =====

export default function PlacementsPage() {
    // Memoize defaultFilters to prevent infinite re-renders in useStandardList
    const defaultFilters = useMemo<PlacementFilters>(
        () => ({ status: undefined }),
        [],
    );

    // Sidebar state
    const [sidebarPlacementId, setSidebarPlacementId] = useState<string | null>(null);

    const {
        data: placements,
        loading,
        error,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        sortBy,
        handleSort,
        getSortIcon,
        page,
        limit,
        totalPages,
        total,
        goToPage,
        setLimit,
        viewMode,
        setViewMode,
        refresh,
    } = useStandardList<Placement, PlacementFilters>({
        endpoint: "/placements",
        defaultFilters,
        defaultSortBy: "hired_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: true,
        viewModeKey: "placementsViewMode",
    });

    // Sidebar handlers
    const handleViewDetails = (placementId: string) => {
        setSidebarPlacementId(placementId);
    };

    const handleCloseSidebar = () => {
        setSidebarPlacementId(null);
    };

    // Calculate earnings statistics from loaded data (page-level stats)
    const pageEarnings = placements.reduce(
        (sum, p) => sum + (p.recruiter_share || 0),
        0,
    );
    const thisYearPlacements = placements.filter(
        (p) => new Date(p.hired_at).getFullYear() === new Date().getFullYear(),
    );
    const thisYearEarnings = thisYearPlacements.reduce(
        (sum, p) => sum + (p.recruiter_share || 0),
        0,
    );

    // Handle error state
    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <>
            <PageTitle
                title="Placements"
                subtitle="Track your successful placements and earnings"
            />
            <div className="space-y-6">
                {/* Earnings Stats */}
                <StatCardGrid>
                    <StatCard
                        title="Total Placements"
                        value={total}
                        icon="fa-trophy"
                        color="primary"
                        description="All time"
                    />
                    <StatCard
                        title="Page Earnings"
                        value={`$${pageEarnings.toLocaleString()}`}
                        icon="fa-sack-dollar"
                        color="success"
                        description={`From ${placements.length} shown`}
                    />
                    <StatCard
                        title={`This Year (shown)`}
                        value={`$${thisYearEarnings.toLocaleString()}`}
                        icon="fa-calendar-days"
                        color="secondary"
                        description={`${thisYearPlacements.length} placements in ${new Date().getFullYear()}`}
                    />
                    <StatCard
                        title="Avg. Commission"
                        value={`$${
                            placements.length > 0
                                ? Math.round(
                                      pageEarnings / placements.length,
                                  ).toLocaleString()
                                : "0"
                        }`}
                        icon="fa-dollar-sign"
                        color="info"
                        description="Per placement"
                    />
                </StatCardGrid>

                {/* Filters and View Toggle */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-4">
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Status Filter */}
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Status Filter
                                </legend>
                                <select
                                    className="select w-full max-w-xs"
                                    value={filters.status || "all"}
                                    onChange={(e) =>
                                        setFilter(
                                            "status",
                                            e.target.value === "all"
                                                ? undefined
                                                : e.target.value,
                                        )
                                    }
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </fieldset>

                            {/* Search */}
                            <SearchInput
                                value={searchInput}
                                onChange={setSearchInput}
                                onClear={clearSearch}
                                placeholder="Search placements..."
                                loading={loading}
                                className="flex-1 min-w-[200px]"
                            />

                            {/* View Toggle */}
                            <ViewModeToggle
                                viewMode={viewMode}
                                onViewModeChange={setViewMode}
                            />
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && placements.length === 0 && <LoadingState />}

                {/* Grid View */}
                {viewMode === "grid" && placements.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {placements.map((placement) => (
                            <PlacementCard
                                key={placement.id}
                                placement={placement}
                                onViewDetails={handleViewDetails}
                                onRefresh={refresh}
                            />
                        ))}
                    </div>
                )}

                {/* Table View */}
                {viewMode === "table" && placements.length > 0 && (
                    <div className="card bg-base-100 shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="w-10"></th>
                                        <th
                                            className="cursor-pointer hover:bg-base-200"
                                            onClick={() =>
                                                handleSort("hired_at")
                                            }
                                        >
                                            Date
                                            <i
                                                className={`fa-duotone fa-regular ${getSortIcon("hired_at")} ml-2 text-xs`}
                                            ></i>
                                        </th>
                                        <th>Candidate</th>
                                        <th>Role</th>
                                        <th>Company</th>
                                        <th
                                            className="text-right cursor-pointer hover:bg-base-200"
                                            onClick={() => handleSort("salary")}
                                        >
                                            Salary
                                            <i
                                                className={`fa-duotone fa-regular ${getSortIcon("salary")} ml-2 text-xs`}
                                            ></i>
                                        </th>
                                        <th className="text-right">Fee %</th>
                                        <th className="text-right">
                                            Total Fee
                                        </th>
                                        <th
                                            className="text-right cursor-pointer hover:bg-base-200"
                                            onClick={() =>
                                                handleSort("recruiter_share")
                                            }
                                        >
                                            Your Share
                                            <i
                                                className={`fa-duotone fa-regular ${getSortIcon("recruiter_share")} ml-2 text-xs`}
                                            ></i>
                                        </th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {placements.map((placement) => (
                                        <PlacementTableRow
                                            key={placement.id}
                                            placement={placement}
                                            onViewDetails={handleViewDetails}
                                            onRefresh={refresh}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && placements.length === 0 && (
                    <EmptyState
                        icon="fa-trophy"
                        title="No Placements Yet"
                        description={
                            searchInput
                                ? "Try adjusting your search criteria"
                                : "Your successful placements will appear here"
                        }
                    />
                )}

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

            {/* Detail Sidebar */}
            <PlacementDetailSidebar
                placementId={sidebarPlacementId}
                onClose={handleCloseSidebar}
            />
        </>
    );
}
