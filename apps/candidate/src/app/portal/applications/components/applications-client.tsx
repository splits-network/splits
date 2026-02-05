"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useMemo, useCallback } from "react";
import {
    useStandardList,
    LoadingState,
    SearchInput,
    ViewModeToggle,
    PaginationControls,
    EmptyState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import ApplicationCard from "./application-card";
import { getStatusColor, formatStage } from "@/lib/application-utils";
import { DataTable, type TableColumn } from "@/components/ui/tables";
import { StatCardGrid, StatCard } from "@/components/ui";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ApplicationTableRow } from "./application-table-row";
import { getApplicationStageBadge } from "@/lib/utils/badge-styles";

// ===== TYPES =====

interface Application {
    id: string;
    stage: string;
    accepted_by_company: boolean;
    created_at: string;
    updated_at: string;
    ai_reviewed?: boolean;
    job_id: string;
    recruiter_notes?: string;
    candidate: {
        full_name: string;
        email: string;
        _masked?: boolean;
    };
    job?: {
        title: string;
        candidate_description?: string;
        status?: string;
        location: string;
        company?: {
            name?: string;
            industry?: string;
            headquarters_location?: string;
            logo_url?: string;
        };
        recruiter?: {
            user?: {
                name?: string;
                email?: string;
            };
        };
    };
    company?: {
        name: string;
    };
    recruiter?: {
        user?: {
            name: string;
            email?: string;
        };
    };
    ai_review?: {
        fit_score: number;
        recommendation: "strong_fit" | "good_fit" | "fair_fit" | "poor_fit";
    };
}

interface ApplicationFilters {
    stage?: string;
}

// ===== TABLE COLUMNS =====

const applicationColumns: TableColumn[] = [
    { key: "position", label: "Position", sortable: true },
    { key: "company", label: "Company", sortable: true },
    { key: "location", label: "Location" },
    { key: "stage", label: "Status", sortable: true },
    { key: "recruiter", label: "Recruiter" },
    { key: "created_at", label: "Applied", sortable: true },
    { key: "actions", label: "Actions", align: "right" },
];

// ===== CLIENT COMPONENT =====

export default function ApplicationsClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { getToken } = useAuth();
    const { success, info } = useToast();
    const toastShownRef = useRef(false);

    // Memoize fetchApplications to prevent infinite re-renders in useStandardList
    const fetchApplications = useCallback(
        async (params: Record<string, any>) => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const response = await client.get("/applications", {
                params: { ...params, include: "job,recruiter,ai_review" },
            });

            return {
                data: (response.data || []) as Application[],
                pagination: response.pagination || {
                    total: 0,
                    page: 1,
                    limit: 25,
                    total_pages: 0,
                },
            };
        },
        [getToken],
    );

    // Memoize defaultFilters to prevent infinite re-renders in useStandardList
    const defaultFilters = useMemo<ApplicationFilters>(() => ({}), []);

    const {
        data: applications,
        loading,
        error,
        pagination,
        filters,
        searchInput,
        setSearchInput,
        clearSearch,
        sortBy,
        sortOrder,
        viewMode,
        setFilter,
        goToPage,
        handleSort,
        setViewMode,
        setLimit,
        refetch,
    } = useStandardList<Application, ApplicationFilters>({
        fetchFn: fetchApplications,
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        storageKey: "candidateApplicationsViewMode",
    });

    // Handle success/draft query params from redirects (only once)
    useEffect(() => {
        if (toastShownRef.current) return;

        const successParam = searchParams.get("success");
        const draftParam = searchParams.get("draft");

        if (successParam === "true") {
            success(
                "Application submitted successfully! You'll receive an email once it has been reviewed.",
            );
            toastShownRef.current = true;
            // Clean up URL
            router.replace("/portal/applications");
        }
        if (draftParam === "true") {
            info(
                "Application saved as draft! You can edit and submit it anytime.",
            );
            toastShownRef.current = true;
            // Clean up URL
            router.replace("/portal/applications");
        }
    }, [searchParams, success, info, router]);

    // Split applications into active and archived
    const activeApps = applications.filter(
        (app) =>
            !["rejected", "withdrawn"].includes(app.stage) &&
            app.job?.status !== "closed" &&
            app.job?.status !== "filled",
    );
    const archivedApps = applications.filter(
        (app) =>
            ["rejected", "withdrawn"].includes(app.stage) ||
            app.job?.status === "closed" ||
            app.job?.status === "filled",
    );

    // Stats calculations
    const stats = {
        total: applications.length,
        active: activeApps.length,
        interviewing: applications.filter((a) => a.stage === "interviewing")
            .length,
        offers: applications.filter((a) => a.stage === "offer").length,
    };

    // Sort icon helper for table headers
    const getSortIcon = (field: string) => {
        if (sortBy !== field) return "fa-sort";
        return sortOrder === "asc" ? "fa-sort-up" : "fa-sort-down";
    };

    if (loading && applications.length === 0) {
        return <LoadingState message="Loading applications..." />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={refetch} />;
    }

    return (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="w-full md:flex-1 md:mr-4 space-y-6">
                <div className="card bg-base-200">
                    {/* Stats */}
                    <StatCardGrid className="m-2 shadow-lg">
                        <StatCard
                            title="Total Applications"
                            icon="fa-file-lines"
                            value={stats.total}
                        />
                        <StatCard
                            title="Active"
                            color="secondary"
                            icon="fa-circle-check"
                            value={stats.active}
                        />
                        <StatCard
                            title="Interviewing"
                            icon="fa-comments"
                            color="info"
                            value={stats.interviewing}
                        />
                        <StatCard
                            title="Offers"
                            icon="fa-trophy"
                            color="success"
                            value={stats.offers}
                        />
                    </StatCardGrid>
                    <div className="p-4 pt-0">{/* Chart */}</div>
                </div>

                {/* Loading overlay for subsequent fetches */}
                {loading && applications.length > 0 && <LoadingState />}
                {/* Loading overlay for subsequent fetches */}
                {loading && applications.length > 0 && <LoadingState />}

                {/* Grid View - Active Applications */}
                {viewMode === "grid" && activeApps.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">
                            Active Applications
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {activeApps.map((app) => (
                                <ApplicationCard
                                    key={app.id}
                                    application={app}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Table View - Active Applications */}
                {viewMode === "table" && activeApps.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">
                            Active Applications
                        </h2>
                        <DataTable
                            columns={applicationColumns}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                            isEmpty={activeApps.length === 0}
                            loading={loading}
                        >
                            {activeApps.map((application) => (
                                <ApplicationTableRow
                                    key={application.id}
                                    application={application}
                                    getStageColor={getApplicationStageBadge}
                                    formatDate={formatDate}
                                />
                            ))}
                        </DataTable>
                    </div>
                )}

                {/* Grid View - Archived Applications */}
                {viewMode === "grid" && archivedApps.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">
                            Archived Applications
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {archivedApps.map((app) => (
                                <ApplicationCard
                                    key={app.id}
                                    application={app}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Table View - Archived Applications */}
                {viewMode === "table" && archivedApps.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">
                            Archived Applications
                        </h2>
                        <div className="opacity-70">
                            <DataTable
                                columns={applicationColumns.filter(
                                    (col) =>
                                        !["recruiter", "actions"].includes(
                                            col.key,
                                        ),
                                )}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                onSort={handleSort}
                                isEmpty={archivedApps.length === 0}
                                loading={loading}
                            >
                                {archivedApps.map((app) => (
                                    <tr key={app.id} className="hover">
                                        <td>
                                            <span className="font-semibold">
                                                {app.job?.title ||
                                                    "Unknown Position"}
                                            </span>
                                        </td>
                                        <td>
                                            {app.job?.company?.name ||
                                                "Unknown Company"}
                                        </td>
                                        <td>
                                            {app.job?.location && (
                                                <span className="text-sm">
                                                    <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                                                    {app.job.location}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge badge-sm ${getStatusColor(app.stage)}`}
                                            >
                                                {formatStage(app.stage)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm">
                                                {formatDate(app.created_at)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </DataTable>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && applications.length === 0 && (
                    <EmptyState
                        icon="fa-inbox"
                        title="No Applications Yet"
                        description="Start applying to jobs to track your applications here"
                        action={
                            <Link
                                href="/public/jobs"
                                className="btn btn-primary"
                            >
                                <i className="fa-duotone fa-regular fa-search"></i>
                                Browse Jobs
                            </Link>
                        }
                    />
                )}

                {/* Pagination Controls */}
                <PaginationControls
                    page={pagination.page}
                    totalPages={pagination.total_pages}
                    total={pagination.total}
                    limit={pagination.limit}
                    onPageChange={goToPage}
                    onLimitChange={setLimit}
                    loading={loading}
                />
            </div>
            <div className="w-full md:w-64 lg:w-72 xl:w-80 shrink-0 mt-6 md:mt-0 space-y-6">
                {/* Filters and View Toggle */}
                <div className="card bg-base-200 shadow">
                    <div className="card-body p-4">
                        <h3 className="card-title">
                            Filters & View
                            <span className="text-base-content/30">•••</span>
                        </h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Status Filter */}
                            <fieldset className="fieldset w-full">
                                <legend className="fieldset-legend">
                                    Application Stage
                                </legend>
                                <select
                                    name="stage-filter"
                                    className="select w-full"
                                    value={filters.stage || "all"}
                                    onChange={(e) =>
                                        setFilter(
                                            "stage",
                                            e.target.value === "all"
                                                ? undefined
                                                : e.target.value,
                                        )
                                    }
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="draft">Draft</option>
                                    <option value="recruiter_proposed">
                                        Recruiter Proposed
                                    </option>
                                    <option value="recruiter_request">
                                        Recruiter Request
                                    </option>
                                    <option value="ai_review">AI Review</option>
                                    <option value="screen">
                                        Recruiter Review
                                    </option>
                                    <option value="submitted">Submitted</option>
                                    <option value="interviewing">
                                        Interviewing
                                    </option>
                                    <option value="offer">Offer</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="withdrawn">Withdrawn</option>
                                </select>
                            </fieldset>

                            {/* Search */}
                            <SearchInput
                                value={searchInput}
                                onChange={setSearchInput}
                                onClear={clearSearch}
                                placeholder="Search applications..."
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
            </div>
        </div>
    );
}
