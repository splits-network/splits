"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BrowseLayout } from "@splits-network/shared-ui";
import { LoadingState } from "@splits-network/shared-ui";
import { EmptyState } from "@/hooks/use-standard-list";
import { useMessageSidebar } from "@/hooks/use-message-sidebar";
import MessageSidebar from "@/components/sidebar/MessageSidebar";
import { useFilter } from "../../contexts/filter-context";
import ListItem from "./list-item";
import DetailPanel from "./detail-panel";

export default function BrowseView() {
    const { data, loading, pagination, page, goToPage } = useFilter();
    const messageSidebar = useMessageSidebar();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedId = searchParams.get("applicationId");
    const selectedItem = useMemo(
        () =>
            selectedId
                ? data.find((item) => item.id === selectedId) ?? null
                : null,
        [selectedId, data],
    );
    const totalPages = pagination?.total_pages || 1;

    const handleSelect = useCallback(
        (id: string) => {
            const params = new URLSearchParams(searchParams);
            params.set("applicationId", id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("applicationId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    return (
    <>
        <BrowseLayout>
            {/* Left Panel - List */}
            <div
                className={`flex flex-col border-r border-base-300 bg-base-200 w-full md:w-96 lg:w-[420px] ${
                    selectedId ? "hidden md:flex" : "flex"
                }`}
            >
                <div className="flex-1 overflow-y-auto min-h-0">
                    {loading && data.length === 0 ? (
                        <div className="p-8">
                            <LoadingState message="Loading applications..." />
                        </div>
                    ) : data.length === 0 ? (
                        <div className="p-4">
                            <EmptyState
                                title="No applications found"
                                description="Try adjusting your search or filters"
                            />
                        </div>
                    ) : (
                        data.map((item) => (
                            <ListItem
                                key={item.id}
                                item={item}
                                isSelected={selectedId === item.id}
                                onSelect={handleSelect}
                            />
                        ))
                    )}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="border-t border-base-300 p-2 flex items-center justify-between text-xs text-base-content/60">
                        <span>
                            Page {page} of {totalPages}
                        </span>
                        <div className="join">
                            <button
                                className="join-item btn btn-xs"
                                disabled={page <= 1}
                                onClick={() => goToPage(page - 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-left" />
                            </button>
                            <button
                                className="join-item btn btn-xs"
                                disabled={page >= totalPages}
                                onClick={() => goToPage(page + 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-right" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel - Detail */}
            <div
                className={`flex-1 flex-col bg-base-100 min-w-0 ${
                    selectedId
                        ? "fixed inset-0 z-50 flex md:static md:z-auto"
                        : "hidden md:flex"
                }`}
            >
                {selectedId ? (
                    <DetailPanel
                        id={selectedId}
                        item={selectedItem}
                        onClose={handleClose}
                        onMessage={messageSidebar.openSidebar}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-base-content/60">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-briefcase text-4xl mb-3 block" />
                            <p>Select an application to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </BrowseLayout>

        <MessageSidebar
            conversationId={messageSidebar.conversationId}
            candidateName={messageSidebar.candidateName}
            onClose={messageSidebar.closeSidebar}
        />
    </>
    );
}
