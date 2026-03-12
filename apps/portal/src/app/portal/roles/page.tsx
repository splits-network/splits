"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    useStandardList,
    PaginationControls,
    LoadingState,
    EmptyState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { useUserProfile } from "@/contexts";
import { useGamification } from "@splits-network/shared-gamification";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ModalPortal } from "@splits-network/shared-ui";
import type { Job, UnifiedJobFilters } from "./types";
import type { BaselViewMode as ViewMode } from "@splits-network/basel-ui";
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
    const {
        isAdmin,
        isRecruiter,
        isCompanyUser,
        getCompanyIdsWithPermission,
    } = useUserProfile();
    const { getToken } = useAuth();
    const [isFirmMember, setIsFirmMember] = useState(false);

    useEffect(() => {
        if (!isRecruiter) return;
        let cancelled = false;
        async function checkFirm() {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: any[] }>("/firms/my-firms");
                if (!cancelled && res.data?.length > 0) setIsFirmMember(true);
            } catch { /* not a firm member */ }
        }
        checkFirm();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRecruiter]);

    const canCreateRole =
        isAdmin ||
        isCompanyUser ||
        (isRecruiter &&
            getCompanyIdsWithPermission("can_create_jobs").length > 0) ||
        (isRecruiter && isFirmMember);

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
        sortBy,
        sortOrder,
        setSortBy,
        setSortOrder,
    } = useStandardList<Job, UnifiedJobFilters>({
        endpoint: "/api/v3/jobs/views/recruiter-board",
        defaultFilters: { status: undefined, job_owner_filter: "assigned" },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
        include: "company,skills",
    });

    const { registerEntities } = useGamification();

    useEffect(() => {
        const companyIds = jobs
            .map((j) => j.company_id)
            .filter((id): id is string => !!id);
        if (companyIds.length > 0) {
            registerEntities("company", [...new Set(companyIds)]);
        }
    }, [jobs, registerEntities]);

    const handleSelect = useCallback((job: Job) => {
        setSelectedJobId((prev) => (prev === job.id ? null : job.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const handleSortChange = useCallback((field: string, order: "asc" | "desc") => {
        setSortBy(field);
        setSortOrder(order);
    }, [setSortBy, setSortOrder]);

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
            <RolesAnimator>
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
                    loading={loading}
                    refresh={refresh}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                />

                {/* Content Area */}
                <section className="content-area scroll-reveal fade-in p-4">
                    <div ref={contentRef}>
                        {loading && jobs.length === 0 ? (
                            <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                                <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                                <p className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                                    Loading your pipeline...
                                </p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                                <i className={`fa-duotone fa-regular ${filters.job_owner_filter === "saved" ? "fa-bookmark" : "fa-magnifying-glass"} text-5xl text-base-content/15 mb-6 block`} />
                                <h3 className="text-2xl font-black tracking-tight mb-2">
                                    {filters.job_owner_filter === "saved" ? "No saved roles yet" : "No matching roles"}
                                </h3>
                                <p className="text-base-content/50 mb-6">
                                    {filters.job_owner_filter === "saved"
                                        ? "Browse roles and use the bookmark icon to save them for quick access."
                                        : "Adjust your search or clear filters to see available positions."}
                                </p>
                                {filters.job_owner_filter !== "saved" && (
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
                                )}
                            </div>
                        ) : (
                            <>
                                {viewMode === "table" && (
                                    <TableView
                                        jobs={jobs}
                                        onSelect={handleSelect}
                                        selectedId={selectedJobId}
                                        onRefresh={refresh}
                                        onUpdateItem={updateItem}
                                    />
                                )}
                                {viewMode === "grid" && (
                                    <GridView
                                        jobs={jobs}
                                        onSelectAction={handleSelect}
                                        selectedId={selectedJobId}
                                        onRefreshAction={refresh}
                                        onUpdateItemAction={updateItem}
                                    />
                                )}
                                {viewMode === "split" && (
                                    <SplitView
                                        jobs={jobs}
                                        onSelect={handleSelect}
                                        selectedId={selectedJobId}
                                        onRefresh={refresh}
                                        onUpdateItem={updateItem}
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
