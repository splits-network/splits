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
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { RecruiterCompanyRelationship, ConnectionFilters } from "./types";
import type { ViewMode } from "./components/shared/accent";
import { ConnectionsAnimator } from "./connections-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";

export default function CompanyInvitationsPage() {
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
        active: 0,
        declined: 0,
    });

    // Fetch stats
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (cancelled || !isAuthLoaded) return;

            const token = await getToken();
            if (!token) return;

            try {
                const client = createAuthenticatedClient(token);
                const [totalRes, pendingRes, activeRes, declinedRes]: any[] =
                    await Promise.all([
                        client.get("/recruiter-companies", { params: { limit: 1 } }),
                        client.get("/recruiter-companies", { params: { status: "pending", limit: 1 } }),
                        client.get("/recruiter-companies", { params: { status: "active", limit: 1 } }),
                        client.get("/recruiter-companies", { params: { status: "declined", limit: 1 } }),
                    ]);

                if (!cancelled) {
                    setStats({
                        total: totalRes.pagination?.total || 0,
                        pending: pendingRes.pagination?.total || 0,
                        active: activeRes.pagination?.total || 0,
                        declined: declinedRes.pagination?.total || 0,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch connection stats:", error);
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
    } = useStandardList<RecruiterCompanyRelationship, ConnectionFilters>({
        endpoint: "/recruiter-companies",
        defaultFilters: { status: undefined },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
    });

    const handleSelect = useCallback((inv: RecruiterCompanyRelationship) => {
        setSelectedId((prev) => (prev === inv.id ? null : inv.id));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <ConnectionsAnimator>
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
                    />

                    {/* Listing Count */}
                    <p className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-6">
                        Showing {invitations.length} of{" "}
                        {pagination?.total ?? invitations.length} connections
                    </p>

                    {/* Content Area */}
                    <div className="listings-content opacity-0">
                        {loading && invitations.length === 0 ? (
                            <LoadingState message="Loading connections..." />
                        ) : invitations.length === 0 ? (
                            <EmptyState
                                icon="fa-handshake"
                                title="No Connections Found"
                                description="When recruiters request to connect, they'll appear here. Try adjusting your filters."
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
        </ConnectionsAnimator>
    );
}
