"use client";

import { useState } from "react";
import { LoadingState } from "@/components/standard-lists/loading-state";
import { PaginationControls } from "@/components/standard-lists/pagination-controls";
import { EmptyState } from "@/components/standard-lists/empty-state";
import { useFilter } from "../../contexts/filter-context";
import type { Application } from "../../types";
import Item from "./item";
import Sidebar from "../shared/sidebar";

export default function GridView() {
    const { data, loading, pagination, page, goToPage, setLimit, refresh } =
        useFilter();
    const [sidebarItem, setSidebarItem] = useState<Application | null>(null);

    if (loading && data.length === 0) {
        return <LoadingState message="Loading applications..." />;
    }

    return (
        <>
            <div className="space-y-6">
                {data.length === 0 ? (
                    <EmptyState
                        icon="fa-inbox"
                        title="No applications found"
                        description="Try adjusting your filters or search terms"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data.map((item) => (
                            <Item
                                key={item.id}
                                item={item}
                                onViewDetails={() => setSidebarItem(item)}
                                onStageChange={refresh}
                            />
                        ))}
                    </div>
                )}

                {pagination && pagination.total_pages > 1 && (
                    <PaginationControls
                        page={page}
                        totalPages={pagination.total_pages}
                        total={pagination.total}
                        limit={pagination.limit}
                        onPageChange={goToPage}
                        onLimitChange={setLimit}
                        loading={loading}
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
