"use client";

import { useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui/tables";
import { PaginationControls } from "@/components/standard-lists/pagination-controls";
import { EmptyState } from "@/components/standard-lists/empty-state";
import { useFilter } from "../../contexts/filter-context";
import type { Job } from "../../types";
import Row from "./row";
import Sidebar from "../shared/sidebar";

const columns: TableColumn[] = [
    { key: "title", label: "Job Title", sortable: true },
    { key: "company.name", label: "Company", sortable: true },
    { key: "location", label: "Location", sortable: true, hideOnMobile: true },
    { key: "salary_min", label: "Salary", sortable: true, hideOnMobile: true },
    { key: "updated_at", label: "Posted", sortable: true },
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

    const [sidebarItem, setSidebarItem] = useState<Job | null>(null);

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
                            icon="fa-briefcase"
                            title="No jobs found"
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
