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
import type { ViewMode } from "./components/shared/accent";
import { isNew } from "./components/shared/helpers";
import { ListsSixAnimator } from "./lists-six-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";
import AddCandidateModal from "./components/modals/add-candidate-modal";

const SCOPE_KEY = "candidatesMemphisScope";

export default function CandidatesMemphisPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
        () => searchParams.get("candidateId"),
    );
    const [showAddModal, setShowAddModal] = useState(false);

    // Scope management (persisted to localStorage)
    const [scope, setScopeState] = useState<CandidateScope>("mine");
    const [scopeLoaded, setScopeLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedScope = localStorage.getItem(SCOPE_KEY) as CandidateScope | null;
            if (savedScope === "mine" || savedScope === "all") {
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

    // Sync viewMode + selectedCandidateId to URL (ref pattern avoids infinite loops)
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
        const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;

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
    } = useStandardList<Candidate, CandidateFilters>({
        endpoint: "/candidates",
        defaultFilters: { scope: scopeLoaded ? scope : "mine" },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
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
        setSelectedCandidateId((prev) => (prev === candidate.id ? null : candidate.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const handleScopeChange = useCallback((newScope: CandidateScope) => {
        setScope(newScope);
    }, [setScope]);

    const stats = useMemo(
        () => ({
            total: pagination?.total || candidates.length,
            mine: candidates.filter((c) => c.has_active_relationship).length,
            verified: candidates.filter((c) => c.verification_status === "verified").length,
            pending: candidates.filter((c) => c.verification_status === "pending").length,
        }),
        [candidates, pagination],
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
                            scope={scope}
                            onScopeChange={handleScopeChange}
                            viewMode={viewMode}
                            onViewModeChange={handleViewModeChange}
                            onAddCandidate={() => setShowAddModal(true)}
                        />

                        {/* Listing Count */}
                        <p className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-6">
                            Showing {candidates.length} of {pagination?.total ?? candidates.length} candidates
                        </p>

                        {/* Content Area */}
                        <div className="listings-content opacity-0">
                            {loading && candidates.length === 0 ? (
                                <LoadingState message="Loading candidates..." />
                            ) : candidates.length === 0 ? (
                                <EmptyState
                                    icon="fa-users"
                                    title="No Candidates Found"
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
                                            candidates={candidates}
                                            onSelect={handleSelect}
                                            selectedId={selectedCandidateId}
                                            onRefresh={refresh}
                                        />
                                    )}
                                    {viewMode === "grid" && (
                                        <GridView
                                            candidates={candidates}
                                            onSelect={handleSelect}
                                            selectedId={selectedCandidateId}
                                            onRefresh={refresh}
                                        />
                                    )}
                                    {viewMode === "split" && (
                                        <SplitView
                                            candidates={candidates}
                                            onSelect={handleSelect}
                                            selectedId={selectedCandidateId}
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
