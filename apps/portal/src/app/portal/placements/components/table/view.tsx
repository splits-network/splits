"use client";

import { useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "../../contexts/filter-context";
import type { Placement } from "../../types";
import Row from "./row";
import Sidebar from "../shared/sidebar";

const columns: TableColumn[] = [
    { key: "hired_at", label: "Hired", sortable: true },
    { key: "candidate", label: "Candidate", sortable: true },
    { key: "job", label: "Job", sortable: false },
    { key: "company", label: "Company", sortable: false, hideOnMobile: true },
    { key: "salary", label: "Salary", sortable: true, align: "right" },
    {
        key: "fee_percentage",
        label: "Fee %",
        sortable: false,
        align: "right",
        hideOnMobile: true,
    },
    {
        key: "recruiter_share",
        label: "Your Share",
        sortable: true,
        align: "right",
    },
    { key: "state", label: "Status", sortable: true },
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

    const [sidebarItem, setSidebarItem] = useState<Placement | null>(null);

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
                            title="No placements found"
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
