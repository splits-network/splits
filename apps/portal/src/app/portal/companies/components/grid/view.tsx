"use client";

import { useState } from "react";
import { LoadingState } from "@splits-network/shared-ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "../../contexts/filter-context";
import { Company, CompanyRelationship } from "../../types";
import Item from "./item";
import Sidebar from "../shared/sidebar";

export default function GridView() {
    const { activeTab, marketplaceContext, myCompaniesContext } = useFilter();
    const activeContext =
        activeTab === "marketplace" ? marketplaceContext : myCompaniesContext;

    const { data, loading, pagination, page, goToPage } = activeContext;
    const [sidebarItem, setSidebarItem] = useState<
        Company | CompanyRelationship | null
    >(null);

    if (loading && data.length === 0) {
        return <LoadingState message="Loading companies..." />;
    }

    return (
        <>
            <div className="space-y-6">
                {data.length === 0 ? (
                    <EmptyState
                        title="No companies found"
                        description={
                            activeTab === "marketplace"
                                ? "Try adjusting your search or filters"
                                : "You don't have any company relationships yet"
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data.map((item: any) => (
                            <Item
                                key={item.id}
                                item={item}
                                activeTab={activeTab}
                                onViewDetails={() => setSidebarItem(item)}
                            />
                        ))}
                    </div>
                )}

                {pagination && pagination.total_pages > 1 && (
                    <PaginationControls
                        page={page}
                        totalPages={pagination.total_pages}
                        onPageChange={goToPage}
                    />
                )}
            </div>

            <Sidebar
                item={sidebarItem}
                onClose={() => setSidebarItem(null)}
            />
        </>
    );
}
