"use client";

import { useState, useMemo, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import type { StandardListResponse } from "@splits-network/shared-types";
import { useStandardList } from "@/hooks/use-standard-list";
import { PaginationControls } from "@/components/standard-lists/pagination-controls";
import { LoadingState } from "@/components/standard-lists/loading-state";
import { ErrorState } from "@/components/standard-lists/error-state";
import { BaselEmptyState } from "@splits-network/basel-ui";
import type { BaselViewMode as ViewMode } from "@splits-network/basel-ui";
import type { PublicFirm, PublicFirmFilters } from "./types";
import { FirmsAnimator } from "./firms-animator";
import { HeaderSection } from "./components/header-section";
import { ControlsBar } from "./components/controls-bar";
import { GridView } from "./components/grid/grid-view";
import { TableView } from "./components/table/table-view";
import { SplitView } from "./components/split/split-view";

interface FirmsClientProps {
    initialData?: PublicFirm[];
    initialPagination?: StandardListResponse<PublicFirm>["pagination"];
}

function FirmsClientInner({
    initialData = [],
    initialPagination,
}: FirmsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const contentRef = useRef<HTMLDivElement>(null);

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const param = searchParams.get("view");
        if (param === "table" || param === "split") return param;
        return "grid";
    });

    const [selectedFirmId, setSelectedFirmId] = useState<string | null>(
        () => searchParams.get("firmId") || null,
    );

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedFirmId) params.set("firmId", selectedFirmId);
        else params.delete("firmId");
        if (viewMode !== "grid") params.set("view", viewMode);
        else params.delete("view");
        const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
        router.replace(newUrl, { scroll: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFirmId, viewMode, pathname]);

    const {
        data: firms,
        loading,
        error,
        pagination,
        searchInput,
        setSearchInput,
        page,
        limit,
        totalPages,
        total,
        goToPage,
        setLimit,
        refresh,
    } = useStandardList<PublicFirm, PublicFirmFilters>({
        endpoint: "/public/firms",
        requireAuth: false,
        defaultLimit: 24,
        defaultSortBy: "name",
        defaultSortOrder: "asc",
        syncToUrl: true,
        initialData,
        initialPagination,
    });

    const stats = useMemo(() => ({
        total: pagination?.total || firms.length,
        seekingSplit: firms.filter((f) => f.seeking_split_partners).length,
        acceptsSubmissions: firms.filter((f) => f.accepts_candidate_submissions).length,
    }), [firms, pagination]);

    const handleSelect = useCallback((firm: PublicFirm) => {
        setSelectedFirmId((prev) => (prev === firm.id ? null : firm.id));
    }, []);

    const handleViewModeChange = useCallback(
        (mode: ViewMode) => {
            if (mode === viewMode) return;
            setViewMode(mode);
            setSelectedFirmId(null);
        },
        [viewMode],
    );

    return (
        <FirmsAnimator contentRef={contentRef}>
            <HeaderSection
                total={stats.total}
                seekingSplit={stats.seekingSplit}
                acceptsSubmissions={stats.acceptsSubmissions}
            />

            <ControlsBar
                resultCount={firms.length}
                totalCount={total}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                loading={loading}
                refresh={refresh}
            />

            <section className="content-area opacity-0">
                <div className="container mx-auto px-6 lg:px-12 py-8">
                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState message={error} onRetry={refresh} />
                    ) : firms.length === 0 ? (
                        <BaselEmptyState
                            icon="fa-duotone fa-regular fa-building-columns"
                            title="No firms found"
                            subtitle={
                                searchInput
                                    ? "Try adjusting your search"
                                    : "Check back soon for new firms"
                            }
                            actions={
                                searchInput
                                    ? [{ label: "Clear Search", onClick: () => setSearchInput(""), style: "btn-primary" }]
                                    : []
                            }
                        />
                    ) : (
                        <div ref={contentRef}>
                            {viewMode === "grid" && (
                                <GridView firms={firms} selectedId={selectedFirmId} onSelect={handleSelect} />
                            )}
                            {viewMode === "table" && (
                                <TableView firms={firms} selectedId={selectedFirmId} onSelect={handleSelect} />
                            )}
                            {viewMode === "split" && (
                                <SplitView firms={firms} selectedId={selectedFirmId} onSelect={handleSelect} />
                            )}
                        </div>
                    )}

                    {!loading && firms.length > 0 && totalPages > 1 && (
                        <PaginationControls
                            page={page}
                            totalPages={totalPages}
                            total={total}
                            limit={limit}
                            onPageChange={goToPage}
                            onLimitChange={setLimit}
                            loading={loading}
                        />
                    )}
                </div>
            </section>
        </FirmsAnimator>
    );
}

export default function FirmsClient(props: FirmsClientProps) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-base-100 flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg text-primary" />
                </div>
            }
        >
            <FirmsClientInner {...props} />
        </Suspense>
    );
}
