"use client";

import { useMemo, useRef, Suspense } from "react";
import type { StandardListResponse } from "@splits-network/shared-types";
import { useStandardList } from "@/hooks/use-standard-list";
import { PaginationControls } from "@/components/standard-lists/pagination-controls";
import { LoadingState } from "@/components/standard-lists/loading-state";
import { ErrorState } from "@/components/standard-lists/error-state";
import { BaselEmptyState } from "@splits-network/basel-ui";
import type { PublicCompany, PublicCompanyFilters } from "./types";
import { CompaniesAnimator } from "./companies-animator";
import { HeaderSection } from "./components/header-section";
import { ControlsBar } from "./components/controls-bar";
import { GridView } from "./components/grid/grid-view";

interface CompaniesClientProps {
    initialData?: PublicCompany[];
    initialPagination?: StandardListResponse<PublicCompany>["pagination"];
}

function CompaniesClientInner({
    initialData = [],
    initialPagination,
}: CompaniesClientProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    const {
        data: companies,
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
    } = useStandardList<PublicCompany, PublicCompanyFilters>({
        endpoint: "/public/companies",
        requireAuth: false,
        defaultLimit: 25,
        defaultSortBy: "name",
        defaultSortOrder: "asc",
        syncToUrl: true,
        initialData,
        initialPagination,
    });

    const stats = useMemo(() => {
        const hiring = companies.filter((c) => c.open_roles_count > 0).length;
        const totalRoles = companies.reduce(
            (sum, c) => sum + c.open_roles_count,
            0,
        );
        return {
            total: pagination?.total || companies.length,
            hiring,
            totalRoles,
        };
    }, [companies, pagination]);

    return (
        <CompaniesAnimator>
            <HeaderSection
                total={stats.total}
                hiring={stats.hiring}
                totalRoles={stats.totalRoles}
            />

            <ControlsBar
                resultCount={companies.length}
                totalCount={total}
                loading={loading}
                refresh={refresh}
            />

            <section
                className="content-area"
                style={{
                    opacity: loading ? 0 : 1,
                    transition: "opacity 0.4s ease",
                }}
            >
                <div className="container mx-auto px-6 lg:px-12 py-8">
                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState message={error} onRetry={refresh} />
                    ) : companies.length === 0 ? (
                        <BaselEmptyState
                            icon="fa-duotone fa-regular fa-buildings"
                            title="No companies found"
                            subtitle={
                                searchInput
                                    ? "Try adjusting your search"
                                    : "Check back soon for new companies"
                            }
                            actions={
                                searchInput
                                    ? [
                                          {
                                              label: "Clear Search",
                                              onClick: () =>
                                                  setSearchInput(""),
                                              style: "btn-primary",
                                          },
                                      ]
                                    : []
                            }
                        />
                    ) : (
                        <div ref={contentRef}>
                            <GridView companies={companies} />
                        </div>
                    )}

                    {!loading && companies.length > 0 && totalPages > 1 && (
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
        </CompaniesAnimator>
    );
}

export default function CompaniesClient(props: CompaniesClientProps) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-base-100 flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg text-primary" />
                </div>
            }
        >
            <CompaniesClientInner {...props} />
        </Suspense>
    );
}
