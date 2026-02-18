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
import type { Company, CompanyRelationship, CompanyFilters, CompanyTab } from "./types";
import type { ViewMode } from "./components/shared/accent";
import { companyId as getCompanyId } from "./components/shared/helpers";
import { CompaniesAnimator } from "./companies-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import { TableView } from "./components/table/table-view";
import { GridView } from "./components/grid/grid-view";
import { SplitView } from "./components/split/split-view";

export default function CompaniesMemphisPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const v = searchParams.get("view");
        return v === "table" || v === "grid" || v === "split" ? v : "grid";
    });
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(() =>
        searchParams.get("companyId"),
    );
    const [activeTab, setActiveTab] = useState<CompanyTab>(() => {
        const t = searchParams.get("tab");
        return t === "my-companies" ? "my-companies" : "marketplace";
    });

    // Sync viewMode, selectedCompanyId, and tab to URL
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

    // Two useStandardList hooks — one for each tab
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
            total: marketplace.pagination?.total || marketplace.data.length,
            myCompanies: myCompanies.pagination?.total || myCompanies.data.length,
            pending: myCompanies.data.filter(
                (r: any) => r.status === "pending",
            ).length,
        }),
        [marketplace.pagination, marketplace.data, myCompanies.pagination, myCompanies.data],
    );

    if (active.error) {
        return <ErrorState message={active.error} onRetry={handleRefresh} />;
    }

    return (
        <CompaniesAnimator>
            <HeaderSection stats={stats} />

            <section className="min-h-screen bg-cream">
                <div className="py-8 px-4 lg:px-8">
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
                    />

                    {/* Listing Count */}
                    <p className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-6">
                        Showing {active.data.length} of{" "}
                        {active.pagination?.total ?? active.data.length}{" "}
                        {isMarketplace ? "companies" : "relationships"}
                    </p>

                    {/* Content Area */}
                    <div className="listings-content opacity-0">
                        {active.loading && active.data.length === 0 ? (
                            <LoadingState message="Loading companies..." />
                        ) : active.data.length === 0 ? (
                            <EmptyState
                                icon="fa-building"
                                title={isMarketplace ? "No Companies Found" : "No Relationships"}
                                description={
                                    isMarketplace
                                        ? "Try adjusting your search or filters"
                                        : "Browse the marketplace to connect with companies"
                                }
                                action={{
                                    label: isMarketplace ? "Reset Filters" : "Browse Marketplace",
                                    onClick: () => {
                                        if (isMarketplace) {
                                            active.clearSearch();
                                            active.clearFilters();
                                        } else {
                                            handleTabChange("marketplace");
                                        }
                                    },
                                }}
                            />
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

                    {/* Pagination */}
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
            </section>
        </CompaniesAnimator>
    );
}
