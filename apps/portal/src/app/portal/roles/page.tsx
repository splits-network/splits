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
import type { Job, UnifiedJobFilters } from "./types";
import type { ViewMode } from "./components/shared/accent";
import { isNew } from "./components/shared/helpers";
import { ListsSixAnimator } from "./lists-six-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";
import RoleWizardModal from "./components/modals/role-wizard-modal";

export default function RolesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedJobId, setSelectedJobId] = useState<string | null>(
        () => searchParams.get("roleId"),
    );
    const [showAddModal, setShowAddModal] = useState(false);

    // Sync viewMode + selectedJobId to URL (ref pattern avoids infinite loops)
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        if (selectedJobId) {
            params.set("roleId", selectedJobId);
        } else {
            params.delete("roleId");
        }
        if (viewMode !== "grid") {
            params.set("view", viewMode);
        } else {
            params.delete("view");
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        const currentQuery = searchParamsRef.current.toString();
        const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;

        if (newUrl !== currentUrl) {
            router.replace(newUrl, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedJobId, viewMode, pathname, router]);
    const { isAdmin, isRecruiter, isCompanyUser, manageableCompanyIds } =
        useUserProfile();

    const canCreateRole =
        isAdmin ||
        isCompanyUser ||
        (isRecruiter && manageableCompanyIds.length > 0);

    const {
        data: jobs,
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
    } = useStandardList<Job, UnifiedJobFilters>({
        endpoint: "/jobs",
        defaultFilters: { status: undefined, job_owner_filter: "all" },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
        include: "company",
    });

    const handleSelect = useCallback((job: Job) => {
        setSelectedJobId((prev) => (prev === job.id ? null : job.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const stats = useMemo(
        () => ({
            total: pagination?.total || jobs.length,
            active: jobs.filter((j) => j.status === "active").length,
            newJobs: jobs.filter((j) => isNew(j)).length,
            totalApps: jobs.reduce(
                (sum, j) => sum + (j.application_count ?? 0),
                0,
            ),
        }),
        [jobs, pagination],
    );


    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <>
        <ListsSixAnimator>
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
                        canCreateRole={canCreateRole}
                        onAddRole={() => setShowAddModal(true)}
                    />

                    {/* Listing Count */}
                    <p className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-6">
                        Showing {jobs.length} of {pagination?.total ?? jobs.length} listings
                    </p>

                    {/* Content Area */}
                    <div className="listings-content opacity-0">
                        {loading && jobs.length === 0 ? (
                            <LoadingState message="Loading roles..." />
                        ) : jobs.length === 0 ? (
                            <EmptyState
                                icon="fa-briefcase"
                                title="No Roles Found"
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
                                        jobs={jobs}
                                        onSelect={handleSelect}
                                        selectedId={selectedJobId}
                                        onRefresh={refresh}
                                    />
                                )}
                                {viewMode === "grid" && (
                                    <GridView
                                        jobs={jobs}
                                        onSelect={handleSelect}
                                        selectedId={selectedJobId}
                                        onRefresh={refresh}
                                    />
                                )}
                                {viewMode === "split" && (
                                    <SplitView
                                        jobs={jobs}
                                        onSelect={handleSelect}
                                        selectedId={selectedJobId}
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
        </ListsSixAnimator>

            <ModalPortal>
                {showAddModal && (
                    <RoleWizardModal
                        isOpen={showAddModal}
                        mode="create"
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
