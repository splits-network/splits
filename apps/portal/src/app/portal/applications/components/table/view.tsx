"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DataTable, type TableColumn } from "@/components/ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useMessageSidebar } from "@/hooks/use-message-sidebar";
import MessageSidebar from "@/components/sidebar/MessageSidebar";
import { useFilter } from "../../contexts/filter-context";
import { Application } from "../../types";
import Row from "./row";
import Sidebar from "../shared/sidebar";

const columns: TableColumn[] = [
    { key: "candidate", label: "Candidate", sortable: true },
    { key: "job", label: "Job", sortable: true },
    { key: "company", label: "Company", sortable: false, hideOnMobile: true },
    { key: "ai_score", label: "AI Score", sortable: true, hideOnMobile: true },
    { key: "stage", label: "Stage", sortable: true },
    {
        key: "created_at",
        label: "Submitted",
        sortable: true,
        hideOnMobile: true,
    },
    { key: "actions" as any, label: "Actions", align: "right" },
];

export default function TableView() {
    const {
        data,
        loading,
        pagination,
        sortBy,
        sortOrder,
        handleSort,
        page,
        goToPage,
    } = useFilter();

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

    return (
        <>
            <div className="space-y-6">
                <DataTable
                    columns={columns}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    loading={loading}
                    isEmpty={data.length === 0}
                    emptyState={
                        <EmptyState
                            title="No applications found"
                            description="Try adjusting your search or filters"
                        />
                    }
                    showExpandColumn
                    card
                    zebra
                >
                    {data.map((item) => (
                        <Row
                            key={item.id}
                            item={item}
                            onViewDetails={() => handleViewDetails(item)}
                            onMessage={messageSidebar.openSidebar}
                        />
                    ))}
                </DataTable>

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
