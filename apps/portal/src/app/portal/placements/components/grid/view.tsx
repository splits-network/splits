"use client";

import { useState } from "react";
import { LoadingState } from "@splits-network/shared-ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "../../contexts/filter-context";
import type { Placement } from "../../types";
import Item from "./item";
import Sidebar from "../shared/sidebar";

export default function GridView() {
    const { data, loading, pagination, page, goToPage } = useFilter();
    const [sidebarItem, setSidebarItem] = useState<Placement | null>(null);

    if (loading && data.length === 0) {
        return <LoadingState message="Loading placements..." />;
    }

    return (
        <>
            <div className="space-y-6">
                {data.length === 0 ? (
                    <EmptyState
                        title="No placements found"
                        description="Try adjusting your search or filters"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {data.map((item) => (
                            <Item
                                key={item.id}
                                item={item}
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

            <Sidebar item={sidebarItem} onClose={() => setSidebarItem(null)} />
        </>
    );
}
