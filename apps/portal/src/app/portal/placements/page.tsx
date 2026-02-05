"use client";

import { useMemo } from "react";
import Link from "next/link";
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
import { formatRelativeTime } from "@/lib/utils";
import { PageTitle } from "@/components/page-title";

// ===== TYPES =====

interface Placement {
    id: string;
    job_id: string;
    candidate_id: string;
    company_id: string;
    recruiter_id: string;
    hired_at: string;
    salary: number;
    fee_percentage: number;
    fee_amount: number;
    recruiter_share: number;
    platform_share: number;
    status: string;
    created_at: string;
    updated_at: string;
    candidate?: {
        id: string;
        full_name: string;
        email: string;
    };
    job?: {
        id: string;
        title: string;
        company?: {
            id: string;
            name: string;
        };
    };
}

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
                                    </tr>
                                </thead>
                                <tbody>
                                    {placements.map((placement) => (
                                        <PlacementTableRow
                                            key={placement.id}
                                            placement={placement}
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
        </>
    );
}

// ===== SUB-COMPONENTS =====

interface PlacementCardProps {
    placement: Placement;
}

function PlacementCard({ placement }: PlacementCardProps) {
    const candidateName = placement.candidate?.full_name || "Unknown Candidate";
    const jobTitle = placement.job?.title || "Unknown Role";
    const companyName = placement.job?.company?.name || "Unknown Company";

    return (
        <div className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
            <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                    <div className="badge badge-success badge-lg">
                        ${(placement.recruiter_share || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-base-content/70">
                        {new Date(placement.hired_at).toLocaleDateString()}
                    </div>
                </div>

                <h3 className="card-title text-xl">{candidateName}</h3>

                <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                        <i className="fa-duotone fa-regular fa-briefcase text-base-content/50 mt-1"></i>
                        <div>
                            <div className="font-medium">{jobTitle}</div>
                            <div className="text-base-content/70">
                                {companyName}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-dollar-sign text-base-content/50"></i>
                        <span>
                            Salary: ${(placement.salary || 0).toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-percent text-base-content/50"></i>
                        <span>Fee: {placement.fee_percentage || 0}%</span>
                    </div>
                </div>

                <div className="divider my-2"></div>

                <div className="flex justify-between items-center text-xs">
                    <span className="text-base-content/70">
                        Total Fee: $
                        {(placement.fee_amount || 0).toLocaleString()}
                    </span>
                    <span className="font-semibold text-success">
                        Your Share: $
                        {(placement.recruiter_share || 0).toLocaleString()}
                    </span>
                </div>

                {placement.status && (
                    <div className="mt-2">
                        <span
                            className={`badge ${
                                placement.status === "completed"
                                    ? "badge-success"
                                    : placement.status === "active"
                                      ? "badge-info"
                                      : "badge-ghost"
                            }`}
                        >
                            {placement.status}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

interface PlacementTableRowProps {
    placement: Placement;
}

function PlacementTableRow({ placement }: PlacementTableRowProps) {
    const candidateName = placement.candidate?.full_name || "Unknown Candidate";
    const jobTitle = placement.job?.title || "Unknown Role";
    const companyName = placement.job?.company?.name || "Unknown Company";

    return (
        <tr className="hover">
            <td>{new Date(placement.hired_at).toLocaleDateString()}</td>
            <td className="font-medium">{candidateName}</td>
            <td>{jobTitle}</td>
            <td>{companyName}</td>
            <td className="text-right">
                ${(placement.salary || 0).toLocaleString()}
            </td>
            <td className="text-right">{placement.fee_percentage || 0}%</td>
            <td className="text-right">
                ${(placement.fee_amount || 0).toLocaleString()}
            </td>
            <td className="text-right font-semibold text-success">
                ${(placement.recruiter_share || 0).toLocaleString()}
            </td>
        </tr>
    );
}
