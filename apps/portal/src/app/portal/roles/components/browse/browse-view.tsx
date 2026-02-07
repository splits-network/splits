"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BrowseLayout } from "@splits-network/shared-ui";
import RoleListItem from "./list-item";
import DetailPanel from "./detail-panel";
import { useRolesFilter } from "../../contexts/roles-filter-context";
import { PaginationControls, LoadingState, ErrorState } from "@/hooks/use-standard-list";

export default function BrowseRolesView() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const {
        data: jobs,
        loading,
        error,
        pagination,
        page,
        totalPages,
        total,
        limit,
        goToPage,
        setLimit,
        refresh,
        filters,
        setFilter,
    } = useRolesFilter();

    // URL-based selection
    const selectedId = searchParams.get("roleId");

    const handleSelect = useCallback(
        (id: string) => {
            const params = new URLSearchParams(searchParams);
            params.set("roleId", id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("roleId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    // Handle tab changes - these modify the job_owner_filter
    const activeTab = filters.job_owner_filter === "assigned" ? "mine" : "all";

    const handleTabChange = useCallback(
        (tabKey: string) => {
            setFilter("job_owner_filter", tabKey === "mine" ? "assigned" : "all");
            goToPage(1);
        },
        [setFilter, goToPage],
    );

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <BrowseLayout>
            {/* List Panel */}
            <div
                className={`
                    flex flex-col border-r border-base-300 bg-base-200
                    w-full md:w-96 lg:w-[420px]
                    ${selectedId ? "hidden md:flex" : "flex"}
                `}
            >
                {/* Header with Tabs */}
                <div className="p-4 border-b border-base-300 bg-base-100/50 backdrop-blur-sm sticky top-0 z-20">
                    {/* Tabs */}
                    <div role="tablist" className="tabs tabs-box w-full">
                        <a
                            role="tab"
                            className={`tab ${activeTab === "mine" ? "tab-active" : ""}`}
                            onClick={() => handleTabChange("mine")}
                        >
                            My Roles
                        </a>
                        <a
                            role="tab"
                            className={`tab ${activeTab === "all" ? "tab-active" : ""}`}
                            onClick={() => handleTabChange("all")}
                        >
                            Marketplace
                        </a>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto min-h-0 relative">
                    {loading && jobs.length === 0 ? (
                        <div className="p-8 text-center text-base-content/50">
                            <span className="loading loading-spinner loading-md mb-2" />
                            <p>Loading...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="p-8 text-center text-base-content/30">
                            <i className="fa-duotone fa-briefcase text-4xl mb-4 opacity-40" />
                            <p>No roles found</p>
                        </div>
                    ) : (
                        <>
                            {/* List Items */}
                            <div>
                                {jobs.map((job) => (
                                    <RoleListItem
                                        key={job.id}
                                        item={job}
                                        isSelected={selectedId === job.id}
                                        onSelect={handleSelect}
                                    />
                                ))}
                            </div>

                            {/* Loading indicator for additional pages */}
                            {loading && jobs.length > 0 && (
                                <div className="p-4 text-center">
                                    <span className="loading loading-spinner loading-sm" />
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between p-4 border-t border-base-300">
                                    <span className="text-sm text-base-content/60">
                                        Page {page} of {totalPages}
                                    </span>
                                    <div className="join">
                                        <button
                                            className="join-item btn btn-sm"
                                            disabled={page <= 1}
                                            onClick={() => goToPage(page - 1)}
                                        >
                                            <i className="fa-duotone fa-chevron-left" />
                                        </button>
                                        <button
                                            className="join-item btn btn-sm"
                                            disabled={page >= totalPages}
                                            onClick={() => goToPage(page + 1)}
                                        >
                                            <i className="fa-duotone fa-chevron-right" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Detail Panel */}
            <div
                className={`
                    flex-1 flex-col bg-base-100 min-w-0
                    ${selectedId ? "fixed inset-0 z-50 flex md:static md:z-auto" : "hidden md:flex"}
                `}
            >
                {selectedId ? (
                    <DetailPanel id={selectedId} onClose={handleClose} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-base-content/30">
                        <div className="text-center">
                            <i className="fa-duotone fa-briefcase text-6xl mb-4 opacity-40" />
                            <p>Select a role to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </BrowseLayout>
    );
}
