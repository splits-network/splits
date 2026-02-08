"use client";

import { useState } from "react";
import { LoadingState } from "@splits-network/shared-ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useMessageSidebar } from "@/hooks/use-message-sidebar";
import MessageSidebar from "@/components/sidebar/MessageSidebar";
import { useFilter } from "../../contexts/filter-context";
import { Application } from "../../types";
import Item from "./card";
import Sidebar from "../shared/sidebar";

export default function GridView() {
    const { data, loading, pagination, page, goToPage } = useFilter();
    const [sidebarItem, setSidebarItem] = useState<Application | null>(null);
    const messageSidebar = useMessageSidebar();

    if (loading && data.length === 0) {
        return <LoadingState message="Loading applications..." />;
    }

    return (
        <>
            <div className="space-y-6">
                {data.length === 0 ? (
                    <EmptyState
                        title="No applications found"
                        description="Try adjusting your search or filters"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data.map((item) => (
                            <Item
                                key={item.id}
                                item={item}
                                onViewDetails={() => setSidebarItem(item)}
                                onMessage={messageSidebar.openSidebar}
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
                onMessage={messageSidebar.openSidebar}
            />

            <MessageSidebar
                conversationId={messageSidebar.conversationId}
                candidateName={messageSidebar.candidateName}
                onClose={messageSidebar.closeSidebar}
            />
        </>
    );
}
