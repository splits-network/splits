"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BrowseLayout } from "@splits-network/shared-ui";
import { LoadingState } from "@splits-network/shared-ui";
import { EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "../../contexts/filter-context";
import NotificationListItem from "./list-item";
import NotificationDetailPanel from "./detail-panel";

export default function NotificationsBrowseView() {
    const {
        data: notifications,
        loading,
        pagination,
        filters,
        searchInput,
        page,
        goToPage,
        refresh,
    } = useFilter();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedId = searchParams.get("notificationId");
    const totalPages = pagination?.total_pages || 1;

    const handleSelect = useCallback(
        (id: string) => {
            const params = new URLSearchParams(searchParams);
            params.set("notificationId", id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("notificationId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    return (
        <BrowseLayout>
            {/* Left Panel - List */}
            <div
                className={`flex flex-col border-r border-base-300 bg-base-200 w-full md:w-96 lg:w-[420px] ${
                    selectedId ? "hidden md:flex" : "flex"
                }`}
            >
                <div className="flex-1 overflow-y-auto min-h-0">
                    {loading && notifications.length === 0 ? (
                        <div className="p-8">
                            <LoadingState message="Loading notifications..." />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4">
                            <EmptyState
                                title="No notifications"
                                description={
                                    filters.unread_only
                                        ? "You're all caught up!"
                                        : filters.category
                                          ? "No notifications in this category."
                                          : searchInput
                                            ? "No notifications match your search."
                                            : "You don't have any notifications yet."
                                }
                            />
                        </div>
                    ) : (
                        notifications.map((item) => (
                            <NotificationListItem
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
                    <NotificationDetailPanel
                        id={selectedId}
                        onClose={handleClose}
                        onUpdate={refresh}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-base-content/60">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-bell text-4xl mb-3 block" />
                            <p>Select a notification to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </BrowseLayout>
    );
}
