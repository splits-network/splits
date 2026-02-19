"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    useStandardList,
    PaginationControls,
    ErrorState,
} from "@/hooks/use-standard-list";
import type { Company, CompanyRelationship, CompanyFilters, CompanyTab } from "./types";
import type { ViewMode } from "./components/shared/status-color";
import { companyId as getCompanyId } from "./components/shared/helpers";
import { CompaniesAnimator } from "./companies-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";

export default function CompaniesBaselPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
        () => searchParams.get("companyId"),
    );
    const [activeTab, setActiveTab] = useState<CompanyTab>(() => {
        const t = searchParams.get("tab");
        return t === "my-companies" ? "my-companies" : "marketplace";
    });

    /* -- URL sync -- */
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        if (selectedCompanyId) {
            params.set("companyId", selectedCompanyId);
        } else {
            params.delete("companyId");
        }
        if (viewMode !== "grid") {
            params.set("view", viewMode);
        } else {
            params.delete("view");
        }
        if (activeTab !== "marketplace") {
            params.set("tab", activeTab);
        } else {
            params.delete("tab");
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
    }, [selectedCompanyId, viewMode, activeTab, pathname, router]);

    const isMarketplace = activeTab === "marketplace";

    /* -- Data -- */
    const marketplace = useStandardList<Company, CompanyFilters>({
        endpoint: "/companies",
        defaultFilters: { browse_all: "true" },
        defaultSortBy: "name",
        defaultSortOrder: "asc",
        defaultLimit: 24,
        syncToUrl: false,
    });

    const myCompanies = useStandardList<CompanyRelationship, CompanyFilters>({
        endpoint: "/recruiter-companies",
        defaultFilters: { status: undefined },
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: false,
    });

    const active = isMarketplace ? marketplace : myCompanies;

    const handleSelect = useCallback(
        (item: Company | CompanyRelationship) => {
            const cId = getCompanyId(item, isMarketplace);
            setSelectedCompanyId((prev) => (prev === cId ? null : cId));
        },
        [isMarketplace],
    );

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    const handleTabChange = useCallback((tab: CompanyTab) => {
        setActiveTab(tab);
        setSelectedCompanyId(null);
    }, []);

    const handleRefresh = useCallback(() => {
        marketplace.refresh();
        myCompanies.refresh();
    }, [marketplace, myCompanies]);

    const stats = useMemo(
        () => ({
            total:
                marketplace.pagination?.total || marketplace.data.length,
            myCompanies:
                myCompanies.pagination?.total || myCompanies.data.length,
            pending: myCompanies.data.filter(
                (r: any) => r.status === "pending",
            ).length,
        }),
        [
            marketplace.pagination,
            marketplace.data,
            myCompanies.pagination,
            myCompanies.data,
        ],
    );

    if (active.error) {
        return <ErrorState message={active.error} onRetry={handleRefresh} />;
    }

    return (
        <CompaniesAnimator contentRef={contentRef}>
            <HeaderSection stats={stats} />

            <ControlsBar
                searchInput={active.searchInput}
                onSearchChange={active.setSearchInput}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                filters={active.filters}
                onFilterChange={active.setFilter}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                isMyCompanies={!isMarketplace}
                companyCount={active.data.length}
                totalCount={active.pagination?.total ?? active.data.length}
            />

            {/* Content Area */}
            <section className="content-area opacity-0">
                <div ref={contentRef}>
                    {active.loading && active.data.length === 0 ? (
                        <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                            <span className="loading loading-spinner loading-lg text-primary mb-6 block" />
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                Loading companies...
                            </p>
                        </div>
                    ) : active.data.length === 0 ? (
                        <div className="container mx-auto px-6 lg:px-12 py-28 text-center">
                            <i className="fa-duotone fa-regular fa-magnifying-glass text-5xl text-base-content/15 mb-6 block" />
                            <h3 className="text-2xl font-black tracking-tight mb-2">
                                {isMarketplace
                                    ? "No companies found"
                                    : "No relationships"}
                            </h3>
                            <p className="text-base-content/50 mb-6">
                                {isMarketplace
                                    ? "Adjust your search or clear filters to see available companies."
                                    : "Browse the marketplace to connect with companies."}
                            </p>
                            <button
                                onClick={() => {
                                    if (isMarketplace) {
                                        active.clearSearch();
                                        active.clearFilters();
                                    } else {
                                        handleTabChange("marketplace");
                                    }
                                }}
                                className="btn btn-outline btn-sm"
                                style={{ borderRadius: 0 }}
                            >
                                {isMarketplace
                                    ? "Reset Filters"
                                    : "Browse Marketplace"}
                            </button>
                        </div>
                    ) : (
                        <>
                            {viewMode === "table" && (
                                <TableView
                                    items={active.data}
                                    activeTab={activeTab}
                                    onSelect={handleSelect}
                                    selectedId={selectedCompanyId}
                                    onRefresh={handleRefresh}
                                />
                            )}
                            {viewMode === "grid" && (
                                <GridView
                                    items={active.data}
                                    activeTab={activeTab}
                                    onSelectAction={handleSelect}
                                    selectedId={selectedCompanyId}
                                    onRefreshAction={handleRefresh}
                                />
                            )}
                            {viewMode === "split" && (
                                <SplitView
                                    items={active.data}
                                    activeTab={activeTab}
                                    onSelect={handleSelect}
                                    selectedId={selectedCompanyId}
                                    onRefresh={handleRefresh}
                                />
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Pagination */}
            <div className="container mx-auto px-6 lg:px-12 py-6">
                <PaginationControls
                    page={active.page}
                    totalPages={active.totalPages}
                    total={active.total}
                    limit={active.limit}
                    onPageChange={active.goToPage}
                    onLimitChange={active.setLimit}
                    loading={active.loading}
                />
            </div>
        </CompaniesAnimator>
    );
}
