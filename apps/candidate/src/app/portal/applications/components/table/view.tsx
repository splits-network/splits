"use client";

import { useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui/tables";
import { PaginationControls } from "@/components/standard-lists/pagination-controls";
import { EmptyState } from "@/components/standard-lists/empty-state";
import { useFilter } from "../../contexts/filter-context";
import type { Application } from "../../types";
import Row from "./row";
import Sidebar from "../shared/sidebar";

const columns: TableColumn[] = [
    { key: "position", label: "Position", sortable: true },
    { key: "company", label: "Company", sortable: true },
    { key: "location", label: "Location", hideOnMobile: true },
    { key: "stage", label: "Status", sortable: true },
    { key: "recruiter", label: "Recruiter", hideOnMobile: true },
    { key: "created_at", label: "Applied", sortable: true },
    { key: "actions", label: "", align: "right" },
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
        setLimit,
    } = useFilter();

    const [sidebarItem, setSidebarItem] = useState<Application | null>(null);

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
                            icon="fa-inbox"
                            title="No applications found"
                            description="Try adjusting your filters or search terms"
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
                            onViewDetails={() => setSidebarItem(item)}
                        />
                    ))}
                </DataTable>

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
