"use client";

import { useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "../../contexts/filter-context";
import { Candidate } from "../../types";
import Row from "./row";
import Sidebar from "../shared/sidebar";

const columns: TableColumn<Candidate>[] = [
    { key: "full_name", label: "Candidate", sortable: true },
    { key: "verification_status", label: "Status", sortable: true },
    {
        key: "location" as any,
        label: "Links",
        hideOnMobile: true,
    },
    {
        key: "created_at",
        label: "Added",
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

    const [sidebarItem, setSidebarItem] = useState<Candidate | null>(null);

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
                            title="No candidates found"
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
                            onViewDetails={() => setSidebarItem(item)}
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
                onClose={() => setSidebarItem(null)}
            />
        </>
    );
}
