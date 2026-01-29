"use client";

import { useCallback, useMemo, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    useStandardList,
    SearchInput,
    PaginationControls,
    ErrorState,
} from "@/hooks/use-standard-list";
import CandidateListItem from "./candidate-list-item";
import AddCandidateModal from "@/app/portal/candidates/components/add-candidate-modal";
import FilterDropdown from "./filter-dropdown";
import { Candidate, CandidateFilters } from "./types";

interface CandidateListPanelProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function CandidateListPanel({
    selectedId,
    onSelect,
}: CandidateListPanelProps) {
    const { getToken } = useAuth();
    const listRef = useRef<HTMLDivElement>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"mine" | "all">("mine");

    const fetchCandidates = useCallback(
        async (params: Record<string, any>) => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const response = await client.get("/candidates", { params });

            return {
                data: (response.data || []) as Candidate[],
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

    const defaultFilters = useMemo(
        () => ({ scope: "mine" }) as CandidateFilters,
        [],
    );

    const {
        data: candidates,
        loading,
        error,
        pagination,
        searchInput,
        setSearchInput,
        goToPage,
        refresh,
        filters,
        setFilters,
        setFilter,
    } = useStandardList<Candidate, CandidateFilters>({
        fetchFn: fetchCandidates,
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
    });

    const handleTabChange = (scope: "mine" | "all") => {
        setActiveTab(scope);
        setFilter("scope", scope);
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only capture if not typing in an input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            )
                return;

            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                if (!candidates.length) return;

                const currentIndex = candidates.findIndex(
                    (c) => c.id === selectedId,
                );
                let nextIndex = currentIndex;

                if (e.key === "ArrowDown") {
                    nextIndex =
                        currentIndex < candidates.length - 1
                            ? currentIndex + 1
                            : 0;
                } else {
                    nextIndex =
                        currentIndex > 0
                            ? currentIndex - 1
                            : candidates.length - 1;
                }

                if (nextIndex !== -1 && candidates[nextIndex]) {
                    const nextId = candidates[nextIndex].id;
                    onSelect(nextId);

                    // Scroll into view logic
                    const element = document.getElementById(
                        `candidate-item-${nextId}`,
                    );
                    element?.scrollIntoView({
                        block: "nearest",
                        behavior: "smooth",
                    });
                }
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [candidates, selectedId, onSelect]);

    return (
        <div className="flex flex-col h-full bg-base-200 border-r border-base-200">
            {/* Header: Tabs, Search & Add */}
            <div className="p-4 border-b border-base-300 bg-base-100/50 backdrop-blur-sm sticky top-0 z-20">
                {/* Tabs */}
                <div role="tablist" className="tabs tabs-box w-full mb-4">
                    <a
                        role="tab"
                        className={`tab ${activeTab === "mine" ? "tab-active" : ""}`}
                        onClick={() => handleTabChange("mine")}
                    >
                        My Candidates
                    </a>
                    <a
                        role="tab"
                        className={`tab ${activeTab === "all" ? "tab-active" : ""}`}
                        onClick={() => handleTabChange("all")}
                    >
                        All Candidates
                    </a>
                </div>

                {/* Search & Add */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <SearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search candidates..."
                            // @ts-ignore - passing className even if interface might not support it (defensive)
                            className="w-full"
                        />
                    </div>

                    <FilterDropdown filters={filters} onChange={setFilters} />

                    <div
                        className="tooltip tooltip-bottom"
                        data-tip="Add Candidate"
                    >
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn btn-square btn-primary"
                            aria-label="Add candidate"
                        >
                            <i className="fa-duotone fa-regular fa-plus text-lg"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div
                ref={listRef}
                className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
            >
                {loading && candidates.length === 0 && (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="flex gap-4 p-4 border-b border-base-200"
                            >
                                <div className="skeleton h-10 w-10 rounded-full shrink-0"></div>
                                <div className="flex-col gap-2 w-full">
                                    <div className="skeleton h-4 w-32"></div>
                                    <div className="skeleton h-3 w-48"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && <ErrorState message={error} onRetry={refresh} />}

                {!loading && !error && candidates.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 p-4 text-center text-base-content/50">
                        <i className="fa-duotone fa-regular fa-inbox text-4xl mb-3 opacity-50" />
                        <p>No candidates found</p>
                        <button
                            onClick={() => {
                                setFilter("scope", "all");
                                setActiveTab("all");
                            }}
                            className="btn btn-ghost btn-xs mt-2"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {candidates.map((candidate) => (
                    <CandidateListItem
                        key={candidate.id}
                        candidate={candidate}
                        isSelected={selectedId === candidate.id}
                        onSelect={onSelect}
                    />
                ))}

                {!loading && candidates.length > 0 && (
                    <div className="p-4 border-t border-base-300 flex justify-center">
                        <PaginationControls
                            pagination={pagination}
                            onPageChange={goToPage}
                            compact={true}
                        />
                    </div>
                )}
            </div>

            <AddCandidateModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={(newCandidate) => {
                    setIsAddModalOpen(false);
                    refresh();
                    if (newCandidate?.id) {
                        onSelect(newCandidate.id);
                    }
                }}
            />
        </div>
    );
}
