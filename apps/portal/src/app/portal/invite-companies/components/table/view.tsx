"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DataTable, type TableColumn } from "@/components/ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useInvitationFilter } from "../../contexts/filter-context";
import { CompanyInvitation } from "../../types";
import Row from "./row";
import Sidebar from "../shared/sidebar";

const invitationColumns: TableColumn<CompanyInvitation>[] = [
    { key: "company_name_hint", label: "Company", sortable: true },
    {
        key: "invited_email",
        label: "Email",
        sortable: true,
        hideOnMobile: true,
    },
    { key: "invite_code", label: "Code", sortable: false },
    { key: "status", label: "Status", sortable: true },
    { key: "created_at", label: "Created", sortable: true, hideOnMobile: true },
    { key: "expires_at", label: "Expires", sortable: true, hideOnMobile: true },
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
    } = useInvitationFilter();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedId = searchParams.get("invitationId");
    const [sidebarInvitation, setSidebarInvitation] =
        useState<CompanyInvitation | null>(null);

    // Sync sidebar invitation with URL parameter
    useEffect(() => {
        if (selectedId) {
            const invitation = invitations.find(
                (invitation) => invitation.id === selectedId,
            );
            if (invitation) {
                setSidebarInvitation(invitation);
            }
        } else {
            setSidebarInvitation(null);
        }
    }, [selectedId, invitations]);

    const handleViewDetails = useCallback(
        (invitation: CompanyInvitation) => {
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
                {/* Table */}
                <DataTable
                    columns={invitationColumns}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    loading={loading}
                    isEmpty={invitations.length === 0}
                    emptyState={
                        <EmptyState
                            title="No invitations found"
                            description="Create your first invitation to start bringing companies to Splits Network"
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

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                    <PaginationControls
                        page={page}
                        totalPages={pagination.total_pages}
                        onPageChange={goToPage}
                    />
                )}
            </div>

            {/* Sidebar */}
            <Sidebar
                invitation={sidebarInvitation}
                onClose={handleCloseSidebar}
            />
        </>
    );
}
