"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BrowseLayout } from "@splits-network/shared-ui";
import { LoadingState } from "@splits-network/shared-ui";
import { EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "../../contexts/filter-context";
import ListItem from "./list-item";
import DetailPanel from "./detail-panel";

export default function BrowseView() {
    const { activeTab, marketplaceContext, myCompaniesContext } = useFilter();
    const activeContext =
        activeTab === "marketplace" ? marketplaceContext : myCompaniesContext;

    const { data, loading, pagination, page, goToPage } = activeContext;

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedId = searchParams.get("companyId");
    const totalPages = pagination?.total_pages || 1;

    const handleSelect = useCallback(
        (id: string) => {
            const params = new URLSearchParams(searchParams);
            params.set("companyId", id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("companyId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    // Extract company ID from either Company or CompanyRelationship
    const getItemCompanyId = (item: any) => {
        if (activeTab === "marketplace") return item.id;
        return item.company_id || item.company?.id;
    };

    return (
        <BrowseLayout>
            {/* Left Panel - List */}
            <div
                className={`flex flex-col border-r border-base-300 bg-base-200 w-full md:w-96 lg:w-[420px] ${
                    selectedId ? "hidden md:flex" : "flex"
                }`}
            >
                {/* List Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {loading && data.length === 0 ? (
                        <div className="p-8">
                            <LoadingState message="Loading companies..." />
                        </div>
                    ) : data.length === 0 ? (
                        <div className="p-4">
                            <EmptyState
                                title="No companies found"
                                description={
                                    activeTab === "marketplace"
                                        ? "Try adjusting your search or filters"
                                        : "You don't have any company relationships yet. Browse the marketplace to connect."
                                }
                            />
                        </div>
                    ) : (
                        data.map((item: any) => {
                            const companyId = getItemCompanyId(item);
                            return (
                                <ListItem
                                    key={item.id}
                                    item={item}
                                    activeTab={activeTab}
                                    isSelected={selectedId === companyId}
                                    onSelect={() => handleSelect(companyId)}
                                />
                            );
                        })
                    )}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="border-t border-base-300 p-2 flex items-center justify-between text-xs text-base-content/60">
                        <span>
                            Page {page} of {totalPages}
                        </span>
                        <div className="join">
                            <button
                                className="join-item btn btn-xs"
                                disabled={page <= 1}
                                onClick={() => goToPage(page - 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-left" />
                            </button>
                            <button
                                className="join-item btn btn-xs"
                                disabled={page >= totalPages}
                                onClick={() => goToPage(page + 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-right" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel - Detail */}
            <div
                className={`flex-1 flex-col bg-base-100 min-w-0 ${
                    selectedId
                        ? "fixed inset-0 z-50 flex md:static md:z-auto"
                        : "hidden md:flex"
                }`}
            >
                {selectedId ? (
                    <DetailPanel id={selectedId} onClose={handleClose} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-base-content/60">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-building text-4xl mb-3 block" />
                            <p>Select a company to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </BrowseLayout>
    );
}
