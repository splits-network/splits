"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    useStandardList,
    PaginationControls,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { EmptyState } from "@splits-network/memphis-ui";
import type { Invitation, InvitationFilters } from "./types";
import type { ViewMode } from "./components/shared/accent";
import { InvitationsAnimator } from "./invitations-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";

interface StatsInvitation {
    id: string;
    consent_given: boolean;
    declined_at: string | null;
}

export default function InvitationsMemphisPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { getToken, isLoaded: isAuthLoaded } = useAuth();

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedId, setSelectedId] = useState<string | null>(() =>
        searchParams.get("invitationId"),
    );

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
                    setStats({ total: 0, pending: 0, accepted: 0, declined: 0 });
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
                        total:
                            response.pagination?.total || invitations.length,
                        pending,
                        accepted,
                        declined,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch invitation stats:", error);
                if (!cancelled) {
                    setStats({ total: 0, pending: 0, accepted: 0, declined: 0 });
                }
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthLoaded]);

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
        <InvitationsAnimator>
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
                        onRefresh={refresh}
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
                                icon="fa-duotone fa-regular fa-paper-plane"
                                title="No Invitations Found"
                                description="When you invite candidates, they'll appear here. Try adjusting your filters or invite a new candidate."
                                color="coral"
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
        </InvitationsAnimator>
    );
}
