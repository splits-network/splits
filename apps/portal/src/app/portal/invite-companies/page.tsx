"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    useStandardList,
    PaginationControls,
    ErrorState,
} from "@/hooks/use-standard-list";
import { ModalPortal } from "@splits-network/shared-ui";
import type { CompanyInvitation, InvitationFilters } from "./types";
import type { ViewMode } from "./components/shared/status-color";
import { InvitationsAnimator } from "./invitations-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";
import CreateInvitationModal from "./components/modals/create-invitation-modal";

export default function InviteCompaniesBaselPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);

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
            <InvitationsAnimator contentRef={contentRef}>
                <HeaderSection stats={stats} />

                <ControlsBar
                    searchInput={searchInput}
                    onSearchChange={setSearchInput}
                    filters={filters}
                    onFilterChange={setFilter}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    invitationCount={invitations.length}
                    totalCount={pagination?.total ?? invitations.length}
                    onCreateInvitation={() => setShowCreateModal(true)}
                />

                {/* Content Area */}
                <section className="content-area opacity-0">
                    <div ref={contentRef} className="container mx-auto px-6 lg:px-12 py-8">
                        {loading && invitations.length === 0 ? (
                            <div className="py-28 text-center">
                                <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                    Loading invitations...
                                </p>
                            </div>
                        ) : invitations.length === 0 ? (
                            <div className="py-28 text-center">
                                <i className="fa-duotone fa-regular fa-building-user text-5xl text-base-content/15 mb-6 block" />
                                <h3 className="text-2xl font-black tracking-tight mb-2">
                                    No invitations found
                                </h3>
                                <p className="text-base-content/50 mb-6">
                                    Invite companies to grow your network, or try adjusting your filters.
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
                </section>

                {/* Pagination */}
                <div className="container mx-auto px-6 lg:px-12 py-6">
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
            </InvitationsAnimator>

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
