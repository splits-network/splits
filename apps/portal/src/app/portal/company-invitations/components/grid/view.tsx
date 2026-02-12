"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LoadingState } from "@splits-network/shared-ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useConnectionFilter } from "../../contexts/filter-context";
import { RecruiterCompanyRelationship } from "../../types";
import Item from "./item";
import Sidebar from "../shared/sidebar";

export default function GridView() {
    const {
        data: invitations,
        loading,
        pagination,
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

    if (loading && invitations.length === 0) {
        return <LoadingState message="Loading connections..." />;
    }

    return (
        <>
            <div className="space-y-6">
                {invitations.length === 0 ? (
                    <EmptyState
                        title="No connections found"
                        description="When recruiters request to connect, they'll appear here"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {invitations.map((invitation) => (
                            <Item
                                key={invitation.id}
                                invitation={invitation}
                                onViewDetails={() =>
                                    handleViewDetails(invitation)
                                }
                            />
                        ))}
                    </div>
                )}

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
