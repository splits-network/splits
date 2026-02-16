"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedId = searchParams.get("applicationId");
    const [sidebarItem, setSidebarItem] = useState<Application | null>(null);
    const messageSidebar = useMessageSidebar();

    // Sync sidebar item with URL parameter
    useEffect(() => {
        if (selectedId) {
            const item = data.find(
                (application) => application.id === selectedId,
            );
            if (item) {
                setSidebarItem(item);
            }
        } else {
            setSidebarItem(null);
        }
    }, [selectedId, data]);

    const handleViewDetails = useCallback(
        (application: Application) => {
            const params = new URLSearchParams(searchParams);
            params.set("applicationId", application.id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleCloseSidebar = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("applicationId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {data.map((item) => (
                            <Item
                                key={item.id}
                                item={item}
                                onViewDetails={() => handleViewDetails(item)}
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
                onClose={handleCloseSidebar}
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
