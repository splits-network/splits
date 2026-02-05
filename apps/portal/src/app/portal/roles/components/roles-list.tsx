"use client";

import { useMemo, useState } from "react";
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { StatCard, StatCardGrid } from "@/components/ui/cards";
import { DataTable, type TableColumn } from "@/components/ui/tables";
import { useUserProfile } from "@/contexts";
import { RoleCard, type Job } from "./role-card";
import { RoleTableRow } from "./role-table-row";
import {
    RolesTrendsChart,
    TIME_PERIODS,
    calculateStatTrends,
} from "../../../../components/charts/roles-trends-chart";
import RoleWizardModal from "./role-wizard-modal";
import Link from "next/link";
import { ViewMode } from "@/hooks/use-view-mode";

// ===== TYPES =====

interface JobFilters {
    status?: string;
    job_owner_filter?: "all" | "assigned";
}

interface RolesListProps {
    view: Exclude<ViewMode, "browse">; // Only grid or table
}

// ===== TABLE COLUMNS =====

const roleColumns: TableColumn[] = [
    { key: "title", label: "Role", sortable: true },
    // { key: 'location', label: 'Location', sortable: true },
    { key: "salary_max", label: "Salary", sortable: true },
    { key: "fee_percentage", label: "Fee", sortable: true },
    { key: "commission", label: "Commission" },
    { key: "status", label: "Status", sortable: true },
    { key: "created_at", label: "Posted", sortable: true },
    { key: "actions", label: "Actions", align: "right" },
];

// ===== COMPONENT =====

export default function RolesList({ view }: RolesListProps) {
    const {
        profile,
        isAdmin,
        isRecruiter,
        isLoading: profileLoading,
    } = useUserProfile();

    // Derive user role from context
    const userRole = isAdmin
        ? "platform_admin"
        : profile?.roles?.includes("company_admin")
          ? "company_admin"
          : profile?.roles?.includes("hiring_manager")
            ? "hiring_manager"
            : isRecruiter
              ? "recruiter"
              : profile?.roles?.[0] || null;

    // Check if user can manage roles
    const canManageRole = isAdmin || profile?.roles?.includes("company_admin");

    // Memoize defaultFilters to prevent unnecessary re-renders
    const defaultFilters = useMemo<JobFilters>(
        () => ({
            status: undefined,
            job_owner_filter: "all",
        }),
        [],
    );

    // Use the standard list hook with server-side pagination/filtering
    const {
        data: jobs,
        pagination,
        loading,
        error,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        sortBy,
        sortOrder,
        handleSort,
        page,
        limit,
        totalPages,
        total,
        goToPage,
        setLimit,
        refresh,
    } = useStandardList<Job, JobFilters>({
        endpoint: "/jobs",
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: true,
    });

    // Time period state for trends (shared with chart)
    const [trendPeriod, setTrendPeriod] = useState(6);

    // Modal state for adding new role
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingJobId, setEditingJobId] = useState<string | null>(null);

    // Calculate stat trends based on selected time period
    const statTrends = useMemo(
        () => calculateStatTrends(jobs, trendPeriod),
        [jobs, trendPeriod],
    );

    // Handler for opening edit modal
    const handleEditRole = (jobId: string) => {
        setEditingJobId(jobId);
    };

    // Handler for closing edit modal
    const handleCloseEditModal = () => {
        setEditingJobId(null);
    };

    // Wait for profile to load
    if (profileLoading) {
        return <LoadingState message="Loading your profile..." />;
    }

    // Handle error state
    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-8 xl:col-span-10">
                    <div className="card bg-base-200">
                        <StatCardGrid className="m-2 shadow-lg">
                            <StatCard
                                title="Total Roles"
                                value={total}
                                icon="fa-briefcase"
                                color="primary"
                                trend={statTrends.total}
                                trendLabel={
                                    TIME_PERIODS.find(
                                        (p) => p.value === trendPeriod,
                                    )?.label
                                }
                            />
                            <StatCard
                                title="Active"
                                value={
                                    jobs.filter((j) => j.status === "active")
                                        .length
                                }
                                icon="fa-circle-check"
                                color="success"
                                trend={statTrends.active}
                                trendLabel={
                                    TIME_PERIODS.find(
                                        (p) => p.value === trendPeriod,
                                    )?.label
                                }
                            />
                            <StatCard
                                title="Paused"
                                value={
                                    jobs.filter((j) => j.status === "paused")
                                        .length
                                }
                                icon="fa-pause"
                                color="warning"
                                trend={statTrends.paused}
                                trendLabel={
                                    TIME_PERIODS.find(
                                        (p) => p.value === trendPeriod,
                                    )?.label
                                }
                            />
                            <StatCard
                                title="Filled"
                                value={
                                    jobs.filter((j) => j.status === "filled")
                                        .length
                                }
                                icon="fa-check-double"
                                color="info"
                                trend={statTrends.filled}
                                trendLabel={
                                    TIME_PERIODS.find(
                                        (p) => p.value === trendPeriod,
                                    )?.label
                                }
                            />
                        </StatCardGrid>
                        <div className="p-4 pt-0">
                            <RolesTrendsChart
                                jobs={jobs}
                                loading={loading && jobs.length === 0}
                                trendPeriod={trendPeriod}
                                onTrendPeriodChange={setTrendPeriod}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-span-12 md:col-span-4 xl:col-span-2 space-y-6">
                    {/* Filters and View Toggle */}
                    <div className="card bg-base-200 shadow">
                        <div className="card-body p-4 space-y-4">
                            <h3 className="card-title">
                                <i className="fa-duotone fa-regular fa-filter mr-2" />
                                Options
                            </h3>
                            {profile?.is_platform_admin ||
                                ((profile?.roles?.includes("company_admin") ||
                                    profile?.roles?.includes(
                                        "hiring_manager",
                                    ) ||
                                    (profile?.roles?.includes("recruiter") &&
                                        profile?.organization_ids?.length >
                                            0)) && (
                                    <>
                                        <button
                                            className="btn btn-primary w-full"
                                            onClick={() =>
                                                setShowAddModal(true)
                                            }
                                        >
                                            <i className="fa-duotone fa-regular fa-plus"></i>
                                            Add Role
                                        </button>
                                    </>
                                ))}
                            <div className="flex flex-wrap gap-4 items-center">
                                {/* Status Filter */}
                                <fieldset className="fieldset w-full">
                                    <legend className="fieldset-legend">
                                        Status Filter
                                    </legend>
                                    <select
                                        name="status-selector"
                                        className="select w-full"
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
                                        <option value="all">
                                            All Statuses
                                        </option>
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="filled">Filled</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </fieldset>

                                {/* Ownership Filter (for recruiters and company users) */}
                                {(userRole === "recruiter" ||
                                    userRole === "company_admin" ||
                                    userRole === "hiring_manager") && (
                                    <fieldset className="fieldset w-full">
                                        <legend className="fieldset-legend">
                                            Job Assignment
                                        </legend>
                                        <select
                                            name="job-owner-filter"
                                            className="select w-full"
                                            value={
                                                filters.job_owner_filter ||
                                                "all"
                                            }
                                            onChange={(e) =>
                                                setFilter(
                                                    "job_owner_filter",
                                                    e.target.value as
                                                        | "all"
                                                        | "assigned",
                                                )
                                            }
                                        >
                                            <option value="all">
                                                {userRole === "recruiter"
                                                    ? "All Jobs"
                                                    : "All Organization Jobs"}
                                            </option>
                                            <option value="assigned">
                                                My Assigned Jobs
                                            </option>
                                        </select>
                                    </fieldset>
                                )}

                                {/* Search */}
                                <SearchInput
                                    value={searchInput}
                                    onChange={setSearchInput}
                                    onClear={clearSearch}
                                    placeholder="Search roles..."
                                    loading={loading}
                                    className="flex-1 min-w-[200px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 gap-4">
                    {/* Loading State */}
                    {loading && jobs.length === 0 && <LoadingState />}

                    {/* Grid View */}
                    {!loading && view === "grid" && jobs.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {jobs.map((job) => (
                                <RoleCard
                                    key={job.id}
                                    job={job}
                                    allJobs={jobs}
                                    userRole={userRole}
                                    canManageRole={canManageRole}
                                    onEditRole={handleEditRole}
                                />
                            ))}
                        </div>
                    )}

                    {/* Table View */}
                    {!loading && view === "table" && jobs.length > 0 && (
                        <DataTable
                            columns={roleColumns}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                            showExpandColumn={true}
                            isEmpty={jobs.length === 0}
                            loading={loading}
                        >
                            {jobs.map((job) => (
                                <RoleTableRow
                                    key={job.id}
                                    job={job}
                                    allJobs={jobs}
                                    canManageRole={canManageRole}
                                    onEditRole={handleEditRole}
                                />
                            ))}
                        </DataTable>
                    )}

                    {/* Empty State */}
                    {!loading && jobs.length === 0 && (
                        <EmptyState
                            icon="fa-briefcase"
                            title="No Roles Found"
                            description={
                                searchInput
                                    ? "Try adjusting your search or filters"
                                    : "No roles have been created yet"
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

                {/* Add Role Modal */}
                {showAddModal && (
                    <RoleWizardModal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => {
                            setShowAddModal(false);
                            refresh(); // Refresh the list
                        }}
                    />
                )}

                {/* Edit Role Modal */}
                {editingJobId && (
                    <RoleWizardModal
                        isOpen={true}
                        jobId={editingJobId}
                        mode="edit"
                        onClose={handleCloseEditModal}
                        onSuccess={() => {
                            handleCloseEditModal();
                            refresh(); // Refresh the list
                        }}
                    />
                )}
            </div>
        </>
    );
}
