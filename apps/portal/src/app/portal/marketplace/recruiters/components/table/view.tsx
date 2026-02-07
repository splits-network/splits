"use client";

import { useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui/tables";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { LoadingState } from "@splits-network/shared-ui";
import { useRecruiterFilter } from "../../contexts/filter-context";
import { RecruiterWithUser } from "../../types";
import Row from "./row";
import Sidebar from "../shared/sidebar";

const columns: TableColumn[] = [
    { key: "name", label: "Recruiter", sortable: true },
    { key: "specialties", label: "Specialty" },
    { key: "location", label: "Location", sortable: true, hideOnMobile: true },
    { key: "total_placements", label: "Placements", sortable: true },
    { key: "reputation_score", label: "Reputation", sortable: true, hideOnMobile: true },
    { key: "years_experience", label: "Experience", hideOnMobile: true },
    { key: "actions", label: "Actions", align: "right" },
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
    } = useRecruiterFilter();

    const [sidebarItem, setSidebarItem] = useState<RecruiterWithUser | null>(
        null,
    );

    if (loading && data.length === 0) {
        return <LoadingState message="Loading recruiters..." />;
    }

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
                            title="No recruiters found"
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
