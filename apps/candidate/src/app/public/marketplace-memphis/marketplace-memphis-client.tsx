"use client";

import { useState, useMemo, useCallback } from "react";
import type { StandardListResponse } from "@splits-network/shared-types";
import {
    useStandardList,
    PaginationControls,
    LoadingState,
    EmptyState,
    ErrorState,
} from "@/hooks/use-standard-list";
import MarketplaceAnimator from "./marketplace-animator";
import RecruiterGrid from "./components/recruiter-grid";
import RecruiterTable from "./components/recruiter-table";
import { Input, Button } from "@splits-network/memphis-ui";

export interface Recruiter {
    id: string;
    user_id: string;
    name?: string;
    email?: string;
    tagline?: string;
    specialization?: string;
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

interface MarketplaceMemphisClientProps {
    initialData?: Recruiter[];
    initialPagination?: StandardListResponse<Recruiter>["pagination"];
}

type ViewMode = "grid" | "table";

export default function MarketplaceMemphisClient({
    initialData = [],
    initialPagination,
}: MarketplaceMemphisClientProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [selectedRecruiter, setSelectedRecruiter] = useState<Recruiter | null>(null);

    const {
        data: recruiters,
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
    } = useStandardList<Recruiter, RecruiterFilters>({
        endpoint: "/recruiters",
        defaultFilters: { marketplace_enabled: true },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
        include: "user",
        initialData,
        initialPagination,
        requireAuth: false,
    });

    const handleSelectRecruiter = useCallback((recruiter: Recruiter) => {
        setSelectedRecruiter((prev) =>
            prev?.id === recruiter.id ? null : recruiter
        );
    }, []);

    const stats = useMemo(
        () => ({
            total: pagination?.total || recruiters.length,
            experienced: recruiters.filter((r) => (r.total_placements ?? 0) > 10).length,
            topRated: recruiters.filter((r) => (r.reputation_score ?? 0) >= 4.5).length,
        }),
        [recruiters, pagination],
    );

    return (
        <MarketplaceAnimator>
            {/* Hero Section */}
            <section className="relative overflow-hidden py-16 lg:py-24 bg-dark">
                {/* Memphis shapes decoration */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                    <div className="absolute top-[10%] left-[5%] w-20 h-20 rounded-full border-4 border-coral" />
                    <div className="absolute top-[40%] right-[8%] w-16 h-16 bg-teal" />
                    <div className="absolute bottom-[15%] left-[15%] w-12 h-12 rotate-45 bg-mint" />
                    <div className="absolute top-[25%] right-[25%] w-14 h-14 rotate-12 bg-coral" />
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="max-w-4xl">
                        <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-cream opacity-0">
                            Find Your{" "}
                            <span className="text-coral">Perfect</span>{" "}
                            Recruiter
                        </h1>
                        <p className="hero-subtitle text-lg md:text-xl text-cream/70 leading-relaxed max-w-2xl mb-10 opacity-0">
                            Connect with expert recruiters who specialize in your industry.
                            Browse profiles, check reputation scores, and start your next career move.
                        </p>

                        {/* Search bar */}
                        <div className="search-bar max-w-2xl opacity-0">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search by name, specialty, or location..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="w-full border-4 border-teal bg-white text-dark"
                                    />
                                </div>
                                {searchInput && (
                                    <Button
                                        onClick={clearSearch}
                                        className="bg-coral text-white border-4 border-coral"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-6 mt-10">
                            <div className="stat-item opacity-0">
                                <div className="text-3xl font-black text-coral">
                                    {stats.total}
                                </div>
                                <div className="text-xs uppercase tracking-wider text-cream/50">
                                    Active Recruiters
                                </div>
                            </div>
                            <div className="stat-item opacity-0">
                                <div className="text-3xl font-black text-teal">
                                    {stats.experienced}
                                </div>
                                <div className="text-xs uppercase tracking-wider text-cream/50">
                                    Experienced
                                </div>
                            </div>
                            <div className="stat-item opacity-0">
                                <div className="text-3xl font-black text-mint">
                                    {stats.topRated}
                                </div>
                                <div className="text-xs uppercase tracking-wider text-cream/50">
                                    Top Rated
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Controls Bar */}
            <section className="controls-bar sticky top-0 z-30 bg-white border-b-4 border-dark opacity-0">
                <div className="container mx-auto px-6 lg:px-12 py-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xs uppercase tracking-wider text-dark/40 font-bold">
                                Showing {recruiters.length} of {pagination?.total ?? recruiters.length} recruiters
                            </span>
                            {searchInput && (
                                <span className="text-xs uppercase tracking-wider text-coral font-bold">
                                    Filtered by: &ldquo;{searchInput}&rdquo;
                                </span>
                            )}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex bg-cream border-4 border-dark">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                                    viewMode === "grid"
                                        ? "bg-dark text-cream"
                                        : "text-dark hover:bg-dark/10"
                                }`}
                            >
                                <i className="fa-duotone fa-regular fa-grid-2 mr-2"></i>
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                                    viewMode === "table"
                                        ? "bg-dark text-cream"
                                        : "text-dark hover:bg-dark/10"
                                }`}
                            >
                                <i className="fa-duotone fa-regular fa-table-list mr-2"></i>
                                Table
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Area */}
            <section className="content-area py-12 opacity-0">
                <div className="container mx-auto px-6 lg:px-12">
                    {error ? (
                        <ErrorState message={error} onRetry={refresh} />
                    ) : loading && recruiters.length === 0 ? (
                        <LoadingState message="Loading recruiters..." />
                    ) : recruiters.length === 0 ? (
                        <div className="text-center py-20 border-4 border-dark bg-white">
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12 bg-coral" />
                                <div className="w-8 h-8 rounded-full bg-teal" />
                                <div className="w-8 h-8 rotate-45 bg-mint" />
                            </div>
                            <h3 className="font-black text-2xl uppercase tracking-tight mb-2 text-dark">
                                No Recruiters Found
                            </h3>
                            <p className="text-sm text-dark/50 mb-4">
                                Try adjusting your search or check back later
                            </p>
                            {searchInput && (
                                <Button
                                    onClick={clearSearch}
                                    className="bg-coral text-white border-4 border-coral"
                                >
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    ) : viewMode === "grid" ? (
                        <RecruiterGrid
                            recruiters={recruiters}
                            selectedRecruiter={selectedRecruiter}
                            onSelect={handleSelectRecruiter}
                        />
                    ) : (
                        <RecruiterTable
                            recruiters={recruiters}
                            selectedRecruiter={selectedRecruiter}
                            onSelect={handleSelectRecruiter}
                        />
                    )}

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
