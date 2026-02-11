"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedId = searchParams.get("companyId");
    const [sidebarItem, setSidebarItem] = useState<
        Company | CompanyRelationship | null
    >(null);

    // Sync sidebar item with URL parameter
    useEffect(() => {
        if (selectedId) {
            // Extract company ID from either Company or CompanyRelationship
            const item = data.find((item: any) => {
                if (activeTab === "marketplace") return item.id === selectedId;
                return (item.company_id || item.company?.id) === selectedId;
            });
            if (item) {
                setSidebarItem(item);
            }
        } else {
            setSidebarItem(null);
        }
    }, [selectedId, data, activeTab]);

    const handleViewDetails = useCallback(
        (item: any) => {
            const params = new URLSearchParams(searchParams);
            // Extract company ID based on tab type
            const companyId =
                activeTab === "marketplace"
                    ? item.id
                    : item.company_id || item.company?.id;
            params.set("companyId", companyId);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams, activeTab],
    );

    const handleCloseSidebar = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("companyId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {data.map((item: any) => (
                            <Item
                                key={item.id}
                                item={item}
                                activeTab={activeTab}
                                onViewDetails={() => handleViewDetails(item)}
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

            <Sidebar item={sidebarItem} onClose={handleCloseSidebar} />
        </>
    );
}
