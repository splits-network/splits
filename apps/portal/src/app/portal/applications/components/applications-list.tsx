"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    ViewModeToggle,
    EmptyState,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { DataTable, type TableColumn } from "@/components/ui/tables";
import { useUserProfile } from "@/contexts";
import { useToast } from "@/lib/toast-context";
import { formatDate } from "@/lib/utils";
import { getApplicationStageBadge } from "@/lib/utils/badge-styles";
import { ApplicationCard } from "./application-card";
import { ApplicationTableRow } from "./application-table-row";
import { ApplicationFilters } from "./application-filters";
import ApplicationsStats from "./applications-stats";
import ApplicationsTrendsChart, {
    calculateApplicationTrends,
} from "@/components/charts/applications-trends-chart";
import BulkActionModal from "./bulk-action-modal";
import type { ApplicationStage } from "@splits-network/shared-types";
import Link from "next/link";

// ===== TYPES =====

interface Application {
    id: string;
    job_id: string;
    candidate_id: string;
    recruiter_id?: string;
    stage: ApplicationStage;
    accepted_by_company: boolean;
    accepted_at?: string;
    ai_reviewed: boolean;
    created_at: string;
    updated_at: string;
    candidate: {
        id: string;
        full_name: string;
        email: string;
        linkedin_url?: string;
        _masked?: boolean;
    };
    recruiter?: {
        id: string;
        name: string;
        email: string;
    };
    job: {
        id: string;
        title: string;
        company_id?: string;
        company?: {
            id: string;
            name: string;
        };
    };
    ai_review?: {
        fit_score: number;
        recommendation: "strong_fit" | "good_fit" | "fair_fit" | "poor_fit";
    };
}
interface ApplicationFiltersType {
    stage?: string;
    ai_score_filter?: string;
}

// ===== TABLE COLUMNS =====

const applicationColumns: TableColumn[] = [
    { key: "candidate", label: "Candidate", sortable: true },
    { key: "job", label: "Job", sortable: true },
    { key: "company", label: "Company", sortable: false },
    { key: "ai_score", label: "AI Score", sortable: true },
    { key: "stage", label: "Stage", sortable: true },
    { key: "created_at", label: "Submitted", sortable: true },
    { key: "actions", label: "Actions", align: "right" },
];

// ===== COMPONENT =====

export default function ApplicationsList() {
    const { getToken } = useAuth();
    const toast = useToast();
    const {
        profile,
        isLoading: profileLoading,
        isAdmin,
        isRecruiter,
        isCompanyUser,
    } = useUserProfile();
    const canSubmitCandidate =
        isAdmin ||
        isRecruiter ||
        profile?.roles?.includes("company_admin") ||
        profile?.roles?.includes("hiring_manager");

    // Company resolution for company users
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [companyResolved, setCompanyResolved] = useState(!isCompanyUser);

    // Bulk action state
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [showBulkActionModal, setShowBulkActionModal] = useState(false);
    const [bulkAction, setBulkAction] = useState<"stage" | "reject" | null>(
        null,
    );
    const [bulkLoading, setBulkLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Time period state for trends
    const [trendPeriod, setTrendPeriod] = useState(6);

    // Resolve companyId from organization
    const resolveCompanyFromOrg = useCallback(
        async (orgId: string) => {
            try {
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const response: any = await client.get("/companies", {
                    params: { identity_organization_id: orgId, limit: 1 },
                });
                const companies = response.data || response;
                if (Array.isArray(companies) && companies.length > 0) {
                    setCompanyId(companies[0].id);
                }
            } catch (err) {
                console.error(
                    "Failed to resolve company for organization:",
                    err,
                );
            } finally {
                setCompanyResolved(true);
            }
        },
        [getToken],
    );

    useEffect(() => {
        if (!isCompanyUser) {
            setCompanyResolved(true);
            return;
        }
        if (companyId) return;

        const orgId = profile?.organization_ids?.[0];
        if (orgId) {
            resolveCompanyFromOrg(orgId);
        } else {
            setCompanyResolved(true);
        }
    }, [
        isCompanyUser,
        companyId,
        profile?.organization_ids,
        resolveCompanyFromOrg,
    ]);

    // Memoize defaultFilters to prevent unnecessary re-renders
    const defaultFilters = useMemo<ApplicationFiltersType>(() => ({}), []);

    // Use the standard list hook with server-side pagination/filtering
    const {
        data: applications,
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
        viewMode,
        setViewMode,
        refresh,
    } = useStandardList<Application, ApplicationFiltersType>({
        endpoint: "/applications",
        include: "candidate,job,company,ai_review",
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: true,
        viewModeKey: "applicationsViewMode",
        //additionalParams: companyId ? { company_id: companyId } : undefined,
    });

    // Calculate stat trends
    const statTrends = useMemo(
        () => calculateApplicationTrends(applications, trendPeriod),
        [applications, trendPeriod],
    );

    // Selection handlers
    const toggleItemSelection = useCallback((id: string) => {
        setSelectedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const toggleSelectAll = useCallback((ids: string[]) => {
        setSelectedItems((prev) => {
            if (prev.size === ids.length) {
                return new Set();
            }
            return new Set(ids);
        });
    }, []);

    const clearSelections = useCallback(() => {
        setSelectedItems(new Set());
    }, []);

    // Filter handlers
    const handleStageFilterChange = (value: string) => {
        setFilter("stage", value || undefined);
    };

    const handleAIScoreFilterChange = (value: string) => {
        setFilter("ai_score_filter", value || undefined);
    };

    // Accept application handler
    const handleAcceptApplication = async (applicationId: string) => {
        try {
            setAcceptingId(applicationId);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${applicationId}`, {
                accepted_by_company: true,
            });
            await refresh();
            toast.success("Application accepted successfully");
        } catch (err: any) {
            console.error("Failed to accept application:", err);
            toast.error(
                "Failed to accept application: " +
                    (err.message || "Unknown error"),
            );
        } finally {
            setAcceptingId(null);
        }
    };

    // Bulk action handlers
    const handleBulkAction = (action: "stage" | "reject") => {
        setBulkAction(action);
        setShowBulkActionModal(true);
    };

    const handleCloseBulkModal = () => {
        setShowBulkActionModal(false);
        setBulkAction(null);
    };

    const handleBulkConfirm = async (data: {
        newStage?: ApplicationStage;
        reason?: string;
        notes?: string;
    }) => {
        setBulkLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const idsArray = Array.from(selectedItems);

            if (bulkAction === "stage" && data.newStage) {
                await Promise.all(
                    idsArray.map((id) =>
                        client.patch(`/applications/${id}`, {
                            stage: data.newStage,
                            notes: data.notes,
                        }),
                    ),
                );
            } else if (bulkAction === "reject") {
                await Promise.all(
                    idsArray.map((id) =>
                        client.patch(`/applications/${id}`, {
                            stage: "rejected",
                            notes: data.reason || data.notes,
                        }),
                    ),
                );
            }

            await refresh();
            clearSelections();
            handleCloseBulkModal();
            toast.success(
                `Successfully updated ${idsArray.length} application(s)`,
            );
        } catch (err: any) {
            console.error("Bulk action failed:", err);
            toast.error(
                "Bulk action failed: " + (err.message || "Unknown error"),
            );
        } finally {
            setBulkLoading(false);
        }
    };

    // Wait for profile and company resolution
    if (profileLoading || !companyResolved) {
        return <LoadingState message="Loading your profile..." />;
    }

    // Handle error state
    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
                <div className="text-sm breadcrumbs">
                    <ul>
                        <li>
                            <a href="/portal/dashboard">Dashboard</a>
                        </li>
                        <li>Applications</li>
                    </ul>
                </div>
            </div>
            <div className="col-span-12 md:col-span-8 xl:col-span-8 2xl:col-span-10 space-y-6">
                {/* Stats and Trends Card */}
                <div className="card bg-base-200">
                    <ApplicationsStats
                        applications={applications}
                        total={total}
                        isAdmin={isAdmin}
                        isRecruiter={isRecruiter}
                        isCompanyUser={isCompanyUser}
                    />
                    <div className="p-4 pt-0">
                        <ApplicationsTrendsChart
                            applications={applications}
                            loading={loading && applications.length === 0}
                            trendPeriod={trendPeriod}
                            onTrendPeriodChange={setTrendPeriod}
                        />
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="col-span-12 md:col-span-4 xl:col-span-4 2xl:col-span-2">
                {/* Filters and View Toggle */}
                <div className="card bg-base-200 shadow">
                    <div className="card-body p-4 space-y-4">
                        <h3 className="card-title">
                            <i className="fa-duotone fa-regular fa-filter mr-2" />
                            Options
                        </h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            {canSubmitCandidate && (
                                <Link
                                    href="/portal/roles"
                                    className="btn btn-primary btn-block gap-2"
                                >
                                    <i className="fa-duotone fa-regular fa-user-plus"></i>
                                    Submit Candidate
                                </Link>
                            )}
                            {/* Filters */}
                            <ApplicationFilters
                                searchQuery={searchInput}
                                stageFilter={filters.stage || ""}
                                aiScoreFilter={filters.ai_score_filter || ""}
                                viewMode={viewMode}
                                onSearchChange={setSearchInput}
                                onStageFilterChange={handleStageFilterChange}
                                onAIScoreFilterChange={
                                    handleAIScoreFilterChange
                                }
                                onViewModeChange={setViewMode}
                            />

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
            <div className="col-span-12 gap-4">
                {/* Loading State */}
                {loading && applications.length === 0 && <LoadingState />}

                {/* Bulk Selection Bar */}
                {selectedItems.size > 0 && isRecruiter && (
                    <div className="alert shadow">
                        <div className="flex-1">
                            <i className="fa-duotone fa-regular fa-check-square text-xl"></i>
                            <div>
                                <h3 className="font-bold">
                                    {selectedItems.size} application
                                    {selectedItems.size !== 1 ? "s" : ""}{" "}
                                    selected
                                </h3>
                                <div className="text-xs">
                                    Choose an action to apply to all selected
                                    applications
                                </div>
                            </div>
                        </div>
                        <div className="flex-none flex gap-2">
                            {isAdmin && (
                                <button
                                    onClick={() => handleBulkAction("stage")}
                                    className="btn btn-sm btn-primary gap-2"
                                >
                                    <i className="fa-duotone fa-regular fa-list-check"></i>
                                    Update Stage
                                </button>
                            )}
                            <button
                                onClick={() => handleBulkAction("reject")}
                                className="btn btn-sm btn-error gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-ban"></i>
                                Reject
                            </button>
                            <button
                                onClick={clearSelections}
                                className="btn btn-sm btn-ghost"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Grid View */}
                {!loading && viewMode === "grid" && applications.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {applications.map((application) => (
                            <ApplicationCard
                                key={application.id}
                                application={{
                                    ...application,
                                }}
                                canAccept={
                                    isCompanyUser &&
                                    !application.accepted_by_company
                                }
                                isAccepting={acceptingId === application.id}
                                onAccept={() =>
                                    handleAcceptApplication(application.id)
                                }
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}

                {/* Table View */}
                {!loading &&
                    viewMode === "table" &&
                    applications.length > 0 && (
                        <DataTable
                            columns={applicationColumns}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                            showExpandColumn={true}
                            isEmpty={applications.length === 0}
                            loading={loading}
                        >
                            {applications.map((application) => (
                                <ApplicationTableRow
                                    key={application.id}
                                    application={application}
                                    isSelected={selectedItems.has(
                                        application.id,
                                    )}
                                    onToggleSelect={() =>
                                        toggleItemSelection(application.id)
                                    }
                                    canAccept={
                                        isCompanyUser &&
                                        !application.accepted_by_company
                                    }
                                    isAccepting={acceptingId === application.id}
                                    onAccept={() =>
                                        handleAcceptApplication(application.id)
                                    }
                                    getStageColor={getApplicationStageBadge}
                                    formatDate={formatDate}
                                    isRecruiter={isRecruiter}
                                    isCompanyUser={isCompanyUser}
                                />
                            ))}
                        </DataTable>
                    )}

                {/* Empty State */}
                {!loading && applications.length === 0 && (
                    <EmptyState
                        icon="fa-briefcase"
                        title="No Applications Found"
                        description={
                            searchInput || filters.stage
                                ? "Try adjusting your search or filters"
                                : "No applications have been created yet"
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

            {/* Bulk Action Modal */}
            {showBulkActionModal && bulkAction && (
                <BulkActionModal
                    action={bulkAction}
                    selectedCount={selectedItems.size}
                    onClose={handleCloseBulkModal}
                    onConfirm={handleBulkConfirm}
                    loading={bulkLoading}
                />
            )}
        </div>
    );
}
