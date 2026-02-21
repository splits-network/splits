"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    useStandardList,
    PaginationControls,
    ErrorState,
} from "@/hooks/use-standard-list";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { RecruiterCompanyRelationship, ConnectionFilters } from "./types";
import type { ViewMode } from "./components/shared/status-color";
import { InvitationsAnimator } from "./invitations-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";

export default function CompanyInvitationsBaselPage() {
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
                        client.get("/recruiter-companies", {
                            params: { limit: 1 },
                        }),
                        client.get("/recruiter-companies", {
                            params: { status: "pending", limit: 1 },
                        }),
                        client.get("/recruiter-companies", {
                            params: { status: "active", limit: 1 },
                        }),
                        client.get("/recruiter-companies", {
                            params: { status: "declined", limit: 1 },
                        }),
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
            />

            {/* Content Area */}
            <section className="content-area opacity-0">
                <div ref={contentRef} className="mx-auto">
                    {loading && invitations.length === 0 ? (
                        <div className="py-28 text-center">
                            <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                Loading connections...
                            </p>
                        </div>
                    ) : invitations.length === 0 ? (
                        <div className="py-28 text-center">
                            <i className="fa-duotone fa-regular fa-handshake text-5xl text-base-content/15 mb-6 block" />
                            <h3 className="text-2xl font-black tracking-tight mb-2">
                                No connections found
                            </h3>
                            <p className="text-base-content/50 mb-6">
                                When recruiters request to connect, they&apos;ll
                                appear here. Try adjusting your filters.
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
    );
}
