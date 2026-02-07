"use client";

import { useState } from "react";
import { LoadingState } from "@splits-network/shared-ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useInvitationFilter } from "../../contexts/filter-context";
import { CompanyInvitation } from "../../types";
import Item from "./item";
import Sidebar from "../shared/sidebar";

export default function GridView() {
    const {
        data: invitations,
        loading,
        pagination,
        page,
        goToPage,
    } = useInvitationFilter();

    const [sidebarInvitation, setSidebarInvitation] =
        useState<CompanyInvitation | null>(null);

    if (loading && invitations.length === 0) {
        return <LoadingState message="Loading invitations..." />;
    }

    return (
        <>
            <div className="space-y-6">
                {/* Grid */}
                {invitations.length === 0 ? (
                    <EmptyState
                        title="No invitations found"
                        description="Create your first invitation to start bringing companies to Splits Network"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {invitations.map((invitation) => (
                            <Item
                                key={invitation.id}
                                invitation={invitation}
                                onViewDetails={(id) =>
                                    setSidebarInvitation(invitation)
                                }
                            />
                        ))}
                    </div>
                )}

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
                onClose={() => setSidebarInvitation(null)}
            />
        </>
    );
}
