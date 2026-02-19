"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import type { StandardListResponse } from "@splits-network/shared-types";
import {
    useStandardList,
    PaginationControls,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import gsap from "gsap";
import MarketplaceAnimator from "./marketplace-animator";
import HeaderSection from "./components/header-section";
import ControlsBar, { type ViewMode } from "./components/controls-bar";
import GridView from "./components/grid-view";
import TableView from "./components/table-view";
import SplitView from "./components/split-view";

export interface Recruiter {
    id: string;
    user_id: string;
    name?: string;
    email?: string;
    phone?: string;
    tagline?: string;
    specialization?: string;
    industries?: string[];
    specialties?: string[];
    location?: string;
    years_experience?: number;
    bio?: string;
    total_placements?: number;
    success_rate?: number;
    reputation_score?: number;
    created_at: string;
    users?: {
        id: string;
        name?: string;
        email?: string;
    };
}

interface RecruiterFilters {
    marketplace_enabled?: boolean;
    specialization?: string;
    location?: string;
}

interface MarketplaceClientProps {
    initialData?: Recruiter[];
    initialPagination?: StandardListResponse<Recruiter>["pagination"];
}

export default function MarketplaceClient({
    initialData = [],
    initialPagination,
}: MarketplaceClientProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [selectedRecruiter, setSelectedRecruiter] =
        useState<Recruiter | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const {
        data: recruiters,
        loading,
        error,
        pagination,
        searchInput,
        setSearchInput,
        clearSearch,
        page,
        limit,
        goToPage,
        setLimit,
        total,
        totalPages,
        refresh,
    } = useStandardList<Recruiter, RecruiterFilters>({
        endpoint: "/recruiters",
        defaultFilters: { marketplace_enabled: true },
        defaultSortBy: "reputation_score",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
        include: "user,reputation",
        initialData,
        initialPagination,
        requireAuth: false,
    });

    const handleSelectRecruiter = useCallback((recruiter: Recruiter) => {
        setSelectedRecruiter((prev) =>
            prev?.id === recruiter.id ? null : recruiter,
        );
    }, []);

    const handleViewModeChange = useCallback(
        (newMode: ViewMode) => {
            if (newMode === viewMode) return;

            // Fade out current content, switch view, fade in
            if (contentRef.current) {
                gsap.to(contentRef.current, {
                    opacity: 0,
                    y: 15,
                    duration: 0.2,
                    ease: "power2.in",
                    onComplete: () => {
                        setViewMode(newMode);
                        setSelectedRecruiter(null);

                        gsap.fromTo(
                            contentRef.current,
                            { opacity: 0, y: 15 },
                            {
                                opacity: 1,
                                y: 0,
                                duration: 0.35,
                                ease: "power3.out",
                            },
                        );
                    },
                });
            } else {
                setViewMode(newMode);
                setSelectedRecruiter(null);
            }
        },
        [viewMode],
    );

    const stats = useMemo(
        () => ({
            total: pagination?.total || recruiters.length,
            experienced: recruiters.filter(
                (r) => (r.years_experience ?? 0) >= 5,
            ).length,
            topRated: recruiters.filter(
                (r) => (r.reputation_score ?? 0) >= 4.5,
            ).length,
        }),
        [recruiters, pagination],
    );

    return (
        <MarketplaceAnimator>
            {/* Hero Section */}
            <HeaderSection
                total={stats.total}
                experienced={stats.experienced}
                topRated={stats.topRated}
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                onSearchClear={clearSearch}
            />

            {/* Controls Bar */}
            <ControlsBar
                showing={recruiters.length}
                total={pagination?.total ?? recruiters.length}
                searchInput={searchInput}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                loading={loading}
            />

            {/* Content Area */}
            <section className="content-area py-10 opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    <div ref={contentRef}>
                        {error ? (
                            <div className="py-16 text-center">
                                <ErrorState
                                    message={error}
                                    onRetry={refresh}
                                />
                            </div>
                        ) : loading && recruiters.length === 0 ? (
                            <LoadingState message="Loading recruiters..." />
                        ) : recruiters.length === 0 ? (
                            <EmptyState
                                searchInput={searchInput}
                                onClear={clearSearch}
                            />
                        ) : viewMode === "grid" ? (
                            <GridView
                                recruiters={recruiters}
                                selectedRecruiter={selectedRecruiter}
                                onSelect={handleSelectRecruiter}
                            />
                        ) : viewMode === "table" ? (
                            <TableView
                                recruiters={recruiters}
                                selectedRecruiter={selectedRecruiter}
                                onSelect={handleSelectRecruiter}
                            />
                        ) : (
                            <SplitView
                                recruiters={recruiters}
                                selectedRecruiter={selectedRecruiter}
                                onSelect={handleSelectRecruiter}
                            />
                        )}
                    </div>

                    {/* Pagination */}
                    {recruiters.length > 0 && totalPages > 1 && (
                        <div className="mt-12">
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
                    )}
                </div>
            </section>
        </MarketplaceAnimator>
    );
}

function EmptyState({
    searchInput,
    onClear,
}: {
    searchInput: string;
    onClear: () => void;
}) {
    return (
        <div className="bg-base-200 border border-base-300 p-10 lg:p-16 text-center">
            <i className="fa-duotone fa-regular fa-magnifying-glass text-5xl text-base-content/15 mb-6 block" />
            <h3 className="text-2xl font-black tracking-tight mb-2">
                No recruiters found
            </h3>
            <p className="text-base-content/50 mb-6">
                Try adjusting your search or check back later.
            </p>
            {searchInput && (
                <button
                    onClick={onClear}
                    className="btn btn-primary"
                    style={{ borderRadius: 0 }}
                >
                    Clear Search
                </button>
            )}
        </div>
    );
}
