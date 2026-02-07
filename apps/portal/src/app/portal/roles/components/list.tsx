"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    PaginationControls,
    EmptyState,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { StatCard, StatCardGrid } from "@/components/ui/cards";
import { DataTable, type TableColumn } from "@/components/ui/tables";
import { RoleCard } from "./card";
import { TableRow } from "./table-row";
import {
    RolesTrendsChart,
    TIME_PERIODS,
    calculateStatTrends,
} from "../../../../components/charts/roles-trends-chart";
import RoleWizardModal from "./modals/role-wizard-modal";
import DetailSidebar from "./detail-sidebar";
import PipelineSidebar from "./pipeline-sidebar";
import { ViewMode } from "@/hooks/use-view-mode";
import { useRolesFilter } from "../contexts/roles-filter-context";

// ===== TYPES =====

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

export default function List({ view }: RolesListProps) {
    const searchParams = useSearchParams();

    // Get filter state from context
    const {
        data: jobs,
        loading,
        error,
        total,
        sortBy,
        sortOrder,
        handleSort,
        page,
        limit,
        totalPages,
        goToPage,
        setLimit,
        refresh,
        userRole,
        canManageRole,
        showStats,
    } = useRolesFilter();

    // Time period state for trends (shared with chart)
    const [trendPeriod, setTrendPeriod] = useState(6);

    // Modal state for editing role (add role is handled at page level now)
    const [editingJobId, setEditingJobId] = useState<string | null>(null);

    // Sidebar state for viewing role details - check URL param for initial selection
    const urlJobId = searchParams.get("jobId");
    const [sidebarRoleId, setSidebarRoleId] = useState<string | null>(urlJobId);

    // Sync sidebar state with URL param changes
    useEffect(() => {
        if (urlJobId) {
            setSidebarRoleId(urlJobId);
        }
    }, [urlJobId]);

    // Pipeline sidebar state for viewing applications
    const [pipelineRoleId, setPipelineRoleId] = useState<string | null>(null);
    const [pipelineRoleTitle, setPipelineRoleTitle] = useState<string>("");

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

    // Handler for opening role detail sidebar
    const handleViewDetails = (jobId: string) => {
        setSidebarRoleId(jobId);
    };

    // Handler for closing sidebar
    const handleCloseSidebar = () => {
        setSidebarRoleId(null);
    };

    // Handler for opening pipeline sidebar
    const handleViewPipeline = (jobId: string) => {
        const job = jobs.find((j) => j.id === jobId);
        setPipelineRoleId(jobId);
        setPipelineRoleTitle(job?.title || "");
    };

    // Handler for closing pipeline sidebar
    const handleClosePipeline = () => {
        setPipelineRoleId(null);
        setPipelineRoleTitle("");
    };

    // Handle error state
    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <>
            <div className="space-y-6">
                {/* Stats and Chart Section */}
                {showStats && (
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
                )}

                {/* Content Section */}
                <div className="space-y-4">
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
                                    onViewDetails={handleViewDetails}
                                    onViewPipeline={handleViewPipeline}
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
                                <TableRow
                                    key={job.id}
                                    job={job}
                                    allJobs={jobs}
                                    canManageRole={canManageRole}
                                    onEditRole={handleEditRole}
                                    onViewDetails={handleViewDetails}
                                    onViewPipeline={handleViewPipeline}
                                />
                            ))}
                        </DataTable>
                    )}

                    {/* Empty State */}
                    {!loading && jobs.length === 0 && (
                        <EmptyState
                            icon="fa-briefcase"
                            title="No Roles Found"
                            description="Try adjusting your search or filters"
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

                {/* Role Detail Sidebar */}
                <DetailSidebar
                    roleId={sidebarRoleId}
                    onClose={handleCloseSidebar}
                    onViewPipeline={handleViewPipeline}
                />

                {/* Pipeline Sidebar */}
                <PipelineSidebar
                    roleId={pipelineRoleId}
                    roleTitle={pipelineRoleTitle}
                    onClose={handleClosePipeline}
                />
            </div>
        </>
    );
}
