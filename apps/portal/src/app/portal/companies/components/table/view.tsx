"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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

    const {
        data,
        loading,
        pagination,
        sortBy,
        sortOrder,
        handleSort,
        page,
        goToPage,
    } = activeContext;

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedId = searchParams.get("companyId");
    const [sidebarItem, setSidebarItem] = useState<
        Company | CompanyRelationship | null
    >(null);

    // Sync sidebar item with URL parameter
    useEffect(() => {
        if (selectedId) {
            // Extract company ID from either Company or CompanyRelationship
            const item = data.find((item: any) => {
                if (activeTab === "marketplace") return item.id === selectedId;
                return (item.company_id || item.company?.id) === selectedId;
            });
            if (item) {
                setSidebarItem(item);
            }
        } else {
            setSidebarItem(null);
        }
    }, [selectedId, data, activeTab]);

    const handleViewDetails = useCallback(
        (item: any) => {
            const params = new URLSearchParams(searchParams);
            // Extract company ID based on tab type
            const companyId =
                activeTab === "marketplace"
                    ? item.id
                    : item.company_id || item.company?.id;
            params.set("companyId", companyId);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams, activeTab],
    );

    const handleCloseSidebar = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("companyId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

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
                            onViewDetails={() => handleViewDetails(item)}
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

            <Sidebar item={sidebarItem} onClose={handleCloseSidebar} />
        </>
    );
}
