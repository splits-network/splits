"use client";

import { useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "../../contexts/filter-context";
import { Company, CompanyRelationship } from "../../types";
import Row from "./row";
import Sidebar from "../shared/sidebar";

const marketplaceColumns: TableColumn<Company>[] = [
    { key: "name", label: "Company", sortable: true },
    {
        key: "headquarters_location",
        label: "Location",
        sortable: true,
        hideOnMobile: true,
    },
    {
        key: "company_size",
        label: "Size",
        sortable: true,
        hideOnMobile: true,
    },
    { key: "actions", label: "Actions", align: "right" },
];

const myCompaniesColumns: TableColumn<CompanyRelationship>[] = [
    { key: "company.name" as any, label: "Company", sortable: true },
    { key: "status", label: "Status", sortable: true },
    {
        key: "relationship_type",
        label: "Type",
        sortable: true,
        hideOnMobile: true,
    },
    {
        key: "created_at",
        label: "Since",
        sortable: true,
        hideOnMobile: true,
    },
    { key: "actions", label: "Actions", align: "right" },
];

export default function TableView() {
    const { activeTab, marketplaceContext, myCompaniesContext } = useFilter();
    const activeContext =
        activeTab === "marketplace" ? marketplaceContext : myCompaniesContext;

    const { data, loading, pagination, sortBy, sortOrder, handleSort, page, goToPage } =
        activeContext;

    const [sidebarItem, setSidebarItem] = useState<
        Company | CompanyRelationship | null
    >(null);

    const columns =
        activeTab === "marketplace"
            ? (marketplaceColumns as TableColumn<any>[])
            : (myCompaniesColumns as TableColumn<any>[]);

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
                            title="No companies found"
                            description={
                                activeTab === "marketplace"
                                    ? "Try adjusting your search or filters"
                                    : "You don't have any company relationships yet"
                            }
                        />
                    }
                    showExpandColumn
                    card
                    zebra
                >
                    {data.map((item: any) => (
                        <Row
                            key={item.id}
                            item={item}
                            activeTab={activeTab}
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
