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
import type { CompanyInvitation, InvitationFilters } from "./types";
import type { ViewMode } from "./components/shared/accent";
import { ListsSixAnimator } from "./lists-six-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";
import CreateInvitationModal from "./components/modals/create-invitation-modal";

export default function InviteCompaniesMemphisPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedId, setSelectedId] = useState<string | null>(() =>
        searchParams.get("invitationId"),
    );
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Sync viewMode + selectedId to URL (ref pattern avoids infinite loops)
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        if (selectedId) {
            params.set("invitationId", selectedId);
        } else {
            params.delete("invitationId");
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
    }, [selectedId, viewMode, pathname, router]);

    const {
        data: invitations,
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
    } = useStandardList<CompanyInvitation, InvitationFilters>({
        endpoint: "/company-invitations",
        defaultFilters: { status: undefined },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
    });

    const handleSelect = useCallback((inv: CompanyInvitation) => {
        setSelectedId((prev) => (prev === inv.id ? null : inv.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const stats = useMemo(
        () => ({
            total: pagination?.total || invitations.length,
            pending: invitations.filter((inv) => inv.status === "pending").length,
            accepted: invitations.filter((inv) => inv.status === "accepted").length,
            expired: invitations.filter((inv) => inv.status === "expired").length,
        }),
        [invitations, pagination],
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
                            onCreateInvitation={() => setShowCreateModal(true)}
                        />

                        {/* Listing Count */}
                        <p className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-6">
                            Showing {invitations.length} of{" "}
                            {pagination?.total ?? invitations.length} invitations
                        </p>

                        {/* Content Area */}
                        <div className="listings-content opacity-0">
                            {loading && invitations.length === 0 ? (
                                <LoadingState message="Loading invitations..." />
                            ) : invitations.length === 0 ? (
                                <EmptyState
                                    icon="fa-building-user"
                                    title="No Invitations Found"
                                    description="Try adjusting your search or filters, or create a new invitation"
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
                                            invitations={invitations}
                                            onSelect={handleSelect}
                                            selectedId={selectedId}
                                            onRefresh={refresh}
                                        />
                                    )}
                                    {viewMode === "grid" && (
                                        <GridView
                                            invitations={invitations}
                                            onSelectAction={handleSelect}
                                            selectedId={selectedId}
                                            onRefreshAction={refresh}
                                        />
                                    )}
                                    {viewMode === "split" && (
                                        <SplitView
                                            invitations={invitations}
                                            onSelect={handleSelect}
                                            selectedId={selectedId}
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
                {showCreateModal && (
                    <CreateInvitationModal
                        isOpen={showCreateModal}
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
