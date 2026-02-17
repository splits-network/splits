"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedId = searchParams.get("placementId");
    const [sidebarItem, setSidebarItem] = useState<Placement | null>(null);

    // Sync sidebar item with URL parameter
    useEffect(() => {
        if (selectedId) {
            const item = data.find((placement) => placement.id === selectedId);
            if (item) {
                setSidebarItem(item);
            }
        } else {
            setSidebarItem(null);
        }
    }, [selectedId, data]);

    const handleViewDetails = useCallback(
        (placement: Placement) => {
            const params = new URLSearchParams(searchParams);
            params.set("placementId", placement.id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleCloseSidebar = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("placementId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    return (
        <>
            <div className="space-y-6">
                <div className="border-4 border-dark bg-white">
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
                        card={false}
                        zebra
                    >
                        {data.map((item) => (
                            <Row
                                key={item.id}
                                item={item}
                                onViewDetails={() => handleViewDetails(item)}
                            />
                        ))}
                    </DataTable>
                </div>

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
