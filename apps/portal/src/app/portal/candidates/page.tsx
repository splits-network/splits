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
import type { Candidate, CandidateFilters, CandidateScope } from "./types";
import type { BaselViewMode as ViewMode } from "@splits-network/basel-ui";
import { isNew } from "./components/shared/helpers";
import { useGamification } from "@splits-network/shared-gamification";
import { PresenceProvider, useRegisterPresence } from "@/contexts";
import { CandidatesAnimator } from "./candidates-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";
import AddCandidateModal from "./components/modals/add-candidate-modal";

const SCOPE_KEY = "candidatesBaselScope";

export default function CandidatesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedCandidateId, setSelectedCandidateId] = useState<
        string | null
    >(() => searchParams.get("candidateId"));
    const [showAddModal, setShowAddModal] = useState(false);

    // Scope management (persisted to localStorage)
    const [scope, setScopeState] = useState<CandidateScope>("mine");
    const [scopeLoaded, setScopeLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedScope = localStorage.getItem(
                SCOPE_KEY,
            ) as CandidateScope | null;
            if (savedScope === "mine" || savedScope === "saved" || savedScope === "all") {
                setScopeState(savedScope);
            }
            setScopeLoaded(true);
        }
    }, []);

    const setScope = useCallback((newScope: CandidateScope) => {
        setScopeState(newScope);
        if (typeof window !== "undefined") {
            localStorage.setItem(SCOPE_KEY, newScope);
        }
    }, []);

    /* ── URL sync ── */
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());
        if (selectedCandidateId) {
            params.set("candidateId", selectedCandidateId);
        } else {
            params.delete("candidateId");
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
    }, [selectedCandidateId, viewMode, pathname, router]);

    const { isAdmin, isRecruiter } = useUserProfile();

    const {
        data: candidates,
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
        sortBy,
        sortOrder,
        setSortBy,
        setSortOrder,
        updateItem,
    } = useStandardList<Candidate, CandidateFilters>({
        endpoint: "/candidates/views/enriched",
        defaultFilters: { scope: scopeLoaded ? scope : "mine" },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: true,
    });

    // Sync scope changes into the filter
    useEffect(() => {
        if (scopeLoaded) {
            setFilter("scope", scope);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scope, scopeLoaded]);

    const handleSelect = useCallback((candidate: Candidate) => {
        setSelectedCandidateId((prev) =>
            prev === candidate.id ? null : candidate.id,
        );
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const handleScopeChange = useCallback(
        (newScope: CandidateScope) => {
            setScope(newScope);
        },
        [setScope],
    );

    const handleSortChange = useCallback(
        (field: string, order: "asc" | "desc") => {
            setSortBy(field);
            setSortOrder(order);
        },
        [setSortBy, setSortOrder],
    );

    // Register candidate IDs with gamification context for batch fetching
    const { registerEntities } = useGamification();
    useEffect(() => {
        if (candidates.length > 0) {
            registerEntities("candidate", candidates.map(c => c.id));
        }
    }, [candidates, registerEntities]);

    // Register user IDs with presence context for batch fetching
    const registerPresence = useRegisterPresence();
    useEffect(() => {
        const userIds = candidates.map(c => c.user_id).filter(Boolean) as string[];
        if (userIds.length > 0) {
            registerPresence(userIds);
        }
    }, [candidates, registerPresence]);

    const stats = useMemo(
        () => ({
            total: pagination?.total || candidates.length,
            mine: candidates.filter((c) => c.has_active_relationship).length,
            verified: candidates.filter(
                (c) => c.verification_status === "verified",
            ).length,
            pending: candidates.filter(
                (c) => c.verification_status === "pending",
            ).length,
        }),
        [candidates, pagination],
    );

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <PresenceProvider>
            <CandidatesAnimator>
                <HeaderSection stats={stats} />

                <ControlsBar
                    searchInput={searchInput}
                    onSearchChange={setSearchInput}
                    filters={filters}
                    onFilterChange={setFilter}
                    scope={scope}
                    onScopeChange={handleScopeChange}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    onAddCandidate={() => setShowAddModal(true)}
                    candidateCount={candidates.length}
                    totalCount={pagination?.total ?? candidates.length}
                    loading={loading}
                    refresh={refresh}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    isRecruiter={isRecruiter}
                />

                {/* Content Area */}
                <section className="content-area scroll-reveal fade-in p-4">
                    <div ref={contentRef}>
                        {loading && candidates.length === 0 ? (
                            <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                                <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                                <p className="text-sm uppercase tracking-[0.15em] font-bold text-base-content/40">
                                    Loading candidates...
                                </p>
                            </div>
                        ) : candidates.length === 0 ? (
                            <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                                <i className={`fa-duotone fa-regular ${scope === "saved" ? "fa-bookmark" : "fa-magnifying-glass"} text-5xl text-base-content/15 mb-6 block`} />
                                <h3 className="text-2xl font-black tracking-tight mb-2">
                                    {scope === "saved" ? "No saved candidates yet" : "No candidates found"}
                                </h3>
                                <p className="text-base-content/50 mb-6">
                                    {scope === "saved"
                                        ? "Browse candidates and use the bookmark icon to save them for quick access."
                                        : "No candidates match your current filters. Clear them to see your full pipeline."}
                                </p>
                                {scope !== "saved" && (
                                    <button
                                        onClick={() => {
                                            clearSearch();
                                            clearFilters();
                                        }}
                                        className="btn btn-outline btn-sm rounded-none"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {viewMode === "table" && (
                                    <TableView
                                        candidates={candidates}
                                        onSelect={handleSelect}
                                        selectedId={selectedCandidateId}
                                        onRefresh={refresh}
                                        onUpdateItem={updateItem}
                                    />
                                )}
                                {viewMode === "grid" && (
                                    <GridView
                                        candidates={candidates}
                                        onSelect={handleSelect}
                                        selectedId={selectedCandidateId}
                                        onRefresh={refresh}
                                        onUpdateItem={updateItem}
                                    />
                                )}
                                {viewMode === "split" && (
                                    <div className="h-[calc(100vh-18rem)] min-h-[500px]">
                                        <SplitView
                                            candidates={candidates}
                                            onSelect={handleSelect}
                                            selectedId={selectedCandidateId}
                                            onRefresh={refresh}
                                            onUpdateItem={updateItem}
                                        />
                                    </div>
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
            </CandidatesAnimator>

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
        </PresenceProvider>
    );
}
