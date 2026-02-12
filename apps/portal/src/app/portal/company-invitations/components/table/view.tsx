"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DataTable, type TableColumn } from "@/components/ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useConnectionFilter } from "../../contexts/filter-context";
import { RecruiterCompanyRelationship } from "../../types";
import Row from "./row";
import Sidebar from "../shared/sidebar";

const connectionColumns: TableColumn<RecruiterCompanyRelationship>[] = [
    { key: "recruiter", label: "Recruiter", sortable: true },
    {
        key: "relationship_type",
        label: "Type",
        sortable: true,
        hideOnMobile: true,
    },
    { key: "status", label: "Status", sortable: true },
    { key: "created_at", label: "Received", sortable: true, hideOnMobile: true },
    { key: "actions", label: "Actions", align: "right" as const },
];

export default function TableView() {
    const {
        data: invitations,
        loading,
        pagination,
        sortBy,
        sortOrder,
        handleSort,
        page,
        goToPage,
    } = useConnectionFilter();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedId = searchParams.get("invitationId");
    const [sidebarInvitation, setSidebarInvitation] =
        useState<RecruiterCompanyRelationship | null>(null);

    useEffect(() => {
        if (selectedId) {
            const invitation = invitations.find((inv) => inv.id === selectedId);
            if (invitation) {
                setSidebarInvitation(invitation);
            }
        } else {
            setSidebarInvitation(null);
        }
    }, [selectedId, invitations]);

    const handleViewDetails = useCallback(
        (invitation: RecruiterCompanyRelationship) => {
            const params = new URLSearchParams(searchParams);
            params.set("invitationId", invitation.id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleCloseSidebar = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("invitationId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    return (
        <>
            <div className="space-y-6">
                <DataTable
                    columns={connectionColumns}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    loading={loading}
                    isEmpty={invitations.length === 0}
                    emptyState={
                        <EmptyState
                            title="No connections found"
                            description="When recruiters request to connect, they'll appear here"
                        />
                    }
                    showExpandColumn
                    card
                    zebra
                >
                    {invitations.map((invitation) => (
                        <Row
                            key={invitation.id}
                            invitation={invitation}
                            onViewDetails={() => handleViewDetails(invitation)}
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
                invitation={sidebarInvitation}
                onClose={handleCloseSidebar}
            />
        </>
    );
}
