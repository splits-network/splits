"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    useStandardList,
    PaginationControls,
    ErrorState,
} from "@/hooks/use-standard-list";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ModalPortal } from "@splits-network/shared-ui";
import type { Invitation, InvitationFilters } from "./types";
import type { ViewMode } from "./components/shared/status-color";
import { InvitationsAnimator } from "./invitations-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";
import AddCandidateModal from "../candidates/components/modals/add-candidate-modal";

interface StatsInvitation {
    id: string;
    consent_given: boolean;
    declined_at: string | null;
}

export default function InvitationsBaselPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);
    const { getToken, isLoaded: isAuthLoaded } = useAuth();

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedId, setSelectedId] = useState<string | null>(() =>
        searchParams.get("invitationId"),
    );
    const [showAddModal, setShowAddModal] = useState(false);

    // Stats (fetched independently)
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        accepted: 0,
        declined: 0,
    });

    // Fetch stats
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (cancelled || !isAuthLoaded) return;

            const token = await getToken();
            if (!token) {
                if (!cancelled) {
                    setStats({
                        total: 0,
                        pending: 0,
                        accepted: 0,
                        declined: 0,
                    });
                }
                return;
            }

            try {
                const client = createAuthenticatedClient(token);
                const response = await client.get("/recruiter-candidates", {
                    params: { limit: 1000 },
                });

                const invitations: StatsInvitation[] = response.data || [];
                const pending = invitations.filter(
                    (inv) => !inv.consent_given && !inv.declined_at,
                ).length;
                const accepted = invitations.filter(
                    (inv) => inv.consent_given,
                ).length;
                const declined = invitations.filter(
                    (inv) => inv.declined_at != null,
                ).length;

                if (!cancelled) {
                    setStats({
                        total: response.pagination?.total || invitations.length,
                        pending,
                        accepted,
                        declined,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch invitation stats:", error);
                if (!cancelled) {
                    setStats({
                        total: 0,
                        pending: 0,
                        accepted: 0,
                        declined: 0,
                    });
                }
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthLoaded]);

    /* ── URL sync ── */
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

    const defaultFilters = useMemo<InvitationFilters>(
        () => ({ status: undefined }),
        [],
    );

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
    } = useStandardList<Invitation, InvitationFilters>({
        endpoint: "/recruiter-candidates",
        include: "candidate",
        defaultFilters,
        defaultSortBy: "invited_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
    });

    const handleSelect = useCallback((inv: Invitation) => {
        setSelectedId((prev) => (prev === inv.id ? null : inv.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

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
                    onInviteCandidate={() => setShowAddModal(true)}
                    invitationCount={invitations.length}
                    totalCount={pagination?.total ?? invitations.length}
                />

                {/* Content Area */}
                <section className="content-area opacity-0">
                    <div
                        ref={contentRef}
                        className="mx-auto px-6 lg:px-12 py-8"
                    >
                        {loading && invitations.length === 0 ? (
                            <div className="py-28 text-center">
                                <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                    Loading invitations...
                                </p>
                            </div>
                        ) : invitations.length === 0 ? (
                            <div className="py-28 text-center">
                                <i className="fa-duotone fa-regular fa-paper-plane text-5xl text-base-content/15 mb-6 block" />
                                <h3 className="text-2xl font-black tracking-tight mb-2">
                                    No invitations found
                                </h3>
                                <p className="text-base-content/50 mb-6">
                                    When you invite candidates, they&apos;ll
                                    appear here. Try adjusting your filters or
                                    invite a new candidate.
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
                                        onSelect={handleSelect}
                                        selectedId={selectedId}
                                        onRefresh={refresh}
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
                {showAddModal && (
                    <AddCandidateModal
                        isOpen={showAddModal}
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
