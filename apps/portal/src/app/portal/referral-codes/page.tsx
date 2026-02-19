"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
    useStandardList,
    PaginationControls,
    ErrorState,
} from "@/hooks/use-standard-list";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ModalPortal } from "@splits-network/shared-ui";
import type { RecruiterCode, ReferralCodeFilters } from "./types";
import { ReferralCodesAnimator } from "./referral-codes-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { CreateCodeModal } from "./components/modals/create-code-modal";

interface StatsCode {
    id: string;
    status: "active" | "inactive";
    usage_count?: number;
}

export default function ReferralCodesBaselPage() {
    const contentRef = useRef<HTMLDivElement>(null);
    const { getToken, isLoaded: isAuthLoaded } = useAuth();

    const [showCreateModal, setShowCreateModal] = useState(false);

    // Stats (fetched independently)
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        signups: 0,
        inactive: 0,
    });

    // Fetch stats
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (cancelled || !isAuthLoaded) return;

            const token = await getToken();
            if (!token) {
                if (!cancelled) {
                    setStats({ total: 0, active: 0, signups: 0, inactive: 0 });
                }
                return;
            }

            try {
                const client = createAuthenticatedClient(token);
                // Paginate through all codes to compute stats (max 100 per request)
                const allCodes: StatsCode[] = [];
                let statsPage = 1;
                let hasMore = true;

                while (hasMore) {
                    const response = await client.get("/recruiter-codes", {
                        params: { limit: 100, page: statsPage },
                    });
                    if (cancelled) return;

                    const batch: StatsCode[] = response.data || [];
                    allCodes.push(...batch);

                    const totalFromServer = response.pagination?.total ?? batch.length;
                    hasMore = allCodes.length < totalFromServer && batch.length === 100;
                    statsPage++;
                }

                const active = allCodes.filter(
                    (c) => c.status === "active",
                ).length;
                const inactive = allCodes.filter(
                    (c) => c.status === "inactive",
                ).length;
                const signups = allCodes.reduce(
                    (sum, c) => sum + (c.usage_count ?? 0),
                    0,
                );

                if (!cancelled) {
                    setStats({
                        total: allCodes.length,
                        active,
                        signups,
                        inactive,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch referral code stats:", error);
                if (!cancelled) {
                    setStats({ total: 0, active: 0, signups: 0, inactive: 0 });
                }
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthLoaded]);

    const defaultFilters = useMemo<ReferralCodeFilters>(
        () => ({ status: undefined }),
        [],
    );

    const {
        data: codes,
        loading,
        error,
        pagination,
        searchInput,
        setSearchInput,
        clearSearch,
        clearFilters,
        filters,
        setFilter,
        page,
        limit,
        goToPage,
        setLimit,
        total,
        totalPages,
        refresh,
    } = useStandardList<RecruiterCode, ReferralCodeFilters>({
        endpoint: "/recruiter-codes",
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 50,
        syncToUrl: true,
    });

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        refresh();
        // Refresh stats too
        void refreshStats();
    };

    const refreshStats = async () => {
        const token = await getToken();
        if (!token) return;

        try {
            const client = createAuthenticatedClient(token);
            const allCodes: StatsCode[] = [];
            let statsPage = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await client.get("/recruiter-codes", {
                    params: { limit: 100, page: statsPage },
                });

                const batch: StatsCode[] = response.data || [];
                allCodes.push(...batch);

                const totalFromServer = response.pagination?.total ?? batch.length;
                hasMore = allCodes.length < totalFromServer && batch.length === 100;
                statsPage++;
            }

            const active = allCodes.filter(
                (c) => c.status === "active",
            ).length;
            const inactive = allCodes.filter(
                (c) => c.status === "inactive",
            ).length;
            const signups = allCodes.reduce(
                (sum, c) => sum + (c.usage_count ?? 0),
                0,
            );

            setStats({
                total: allCodes.length,
                active,
                signups,
                inactive,
            });
        } catch {
            // Silently fail - stats will be stale but not broken
        }
    };

    const handleRefresh = () => {
        refresh();
        void refreshStats();
    };

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <>
            <ReferralCodesAnimator contentRef={contentRef}>
                <HeaderSection stats={stats} />

                <ControlsBar
                    searchInput={searchInput}
                    onSearchChange={setSearchInput}
                    filters={filters}
                    onFilterChange={setFilter}
                    onCreateCode={() => setShowCreateModal(true)}
                    codeCount={codes.length}
                    totalCount={pagination?.total ?? codes.length}
                />

                {/* Content Area */}
                <section className="content-area opacity-0">
                    <div ref={contentRef} className="container mx-auto px-6 lg:px-12 py-8">
                        {loading && codes.length === 0 ? (
                            <div className="py-28 text-center">
                                <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                    Loading referral codes...
                                </p>
                            </div>
                        ) : codes.length === 0 ? (
                            <div className="py-28 text-center">
                                <i className="fa-duotone fa-regular fa-link text-5xl text-base-content/15 mb-6 block" />
                                <h3 className="text-2xl font-black tracking-tight mb-2">
                                    No referral codes yet
                                </h3>
                                <p className="text-base-content/50 mb-6 max-w-md mx-auto">
                                    Create your first referral code and start sharing it
                                    with potential candidates and companies. When they sign
                                    up using your code, you&apos;ll be attributed as the
                                    sourcer.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="btn btn-primary btn-sm"
                                        style={{ borderRadius: 0 }}
                                    >
                                        <i className="fa-duotone fa-regular fa-plus mr-2" />
                                        Create Your First Code
                                    </button>
                                    {(searchInput || filters.status) && (
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
                            </div>
                        ) : (
                            <TableView
                                codes={codes}
                                onRefresh={handleRefresh}
                            />
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
            </ReferralCodesAnimator>

            <ModalPortal>
                {showCreateModal && (
                    <CreateCodeModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={handleCreateSuccess}
                    />
                )}
            </ModalPortal>
        </>
    );
}
