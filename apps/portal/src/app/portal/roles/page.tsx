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
import type { ViewMode } from "./components/shared/status-color";
import { isNew } from "./components/shared/helpers";
import { RolesAnimator } from "./roles-animator";
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
    const contentRef = useRef<HTMLDivElement>(null);

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedJobId, setSelectedJobId] = useState<string | null>(() =>
        searchParams.get("roleId"),
    );
    const [showAddModal, setShowAddModal] = useState(false);

    /* ── URL sync ── */
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
        const currentUrl = currentQuery
            ? `${pathname}?${currentQuery}`
            : pathname;
        if (newUrl !== currentUrl) {
            router.replace(newUrl, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedJobId, viewMode, pathname, router]);

    /* ── User profile ── */
    const { isAdmin, isRecruiter, isCompanyUser, manageableCompanyIds } =
        useUserProfile();
    const canCreateRole =
        isAdmin ||
        isCompanyUser ||
        (isRecruiter && manageableCompanyIds.length > 0);

    /* ── Data ── */
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
        updateItem,
    } = useStandardList<Job, UnifiedJobFilters>({
        endpoint: "/jobs",
        defaultFilters: { status: undefined, job_owner_filter: "assigned" },
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
            <RolesAnimator contentRef={contentRef}>
                <HeaderSection stats={stats} />

                <ControlsBar
                    searchInput={searchInput}
                    onSearchChange={setSearchInput}
                    filters={filters}
                    onFilterChange={setFilter}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    canCreateRole={canCreateRole}
                    onAddRole={() => setShowAddModal(true)}
                    jobCount={jobs.length}
                    totalCount={pagination?.total ?? jobs.length}
                />

                {/* Content Area */}
                <section className="content-area opacity-0">
                    <div ref={contentRef}>
                        {loading && jobs.length === 0 ? (
                            <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                                <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                    Loading your pipeline...
                                </p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-5xl text-base-content/15 mb-6 block" />
                                <h3 className="text-2xl font-black tracking-tight mb-2">
                                    No matching roles
                                </h3>
                                <p className="text-base-content/50 mb-6">
                                    Adjust your search or clear filters to see
                                    available positions.
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
                                        jobs={jobs}
                                        onSelect={handleSelect}
                                        selectedId={selectedJobId}
                                        onRefresh={refresh}
                                    />
                                )}
                                {viewMode === "grid" && (
                                    <GridView
                                        jobs={jobs}
                                        onSelectAction={handleSelect}
                                        selectedId={selectedJobId}
                                        onRefreshAction={refresh}
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
                </section>

                {/* Pagination */}
                <div className="mx-auto px-6 lg:px-12 py-6">
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
            </RolesAnimator>

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
