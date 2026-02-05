"use client";

import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    useStandardList,
    SearchInput,
    PaginationControls,
    ErrorState,
} from "@/hooks/use-standard-list";
import ApplicationListItem from "./list-item";
import FilterDropdown from "./filter-dropdown";
import { Application, ApplicationFilters } from "./types";

interface ListPanelProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function ListPanel({ selectedId, onSelect }: ListPanelProps) {
    const { getToken } = useAuth();
    const { isRecruiter, isCompanyUser, profile } = useUserProfile();
    const [activeTab, setActiveTab] = useState<"mine" | "all">("all");

    const fetchApplications = useCallback(
        async (params: Record<string, any>) => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const response = await client.get("/applications", {
                params: {
                    ...params,
                    include: "candidate,job,company,recruiter,ai_review",
                },
            });

            return {
                data: (response.data || []) as Application[],
                pagination: response.pagination || {
                    total: 0,
                    page: 1,
                    limit: 25,
                    total_pages: 0,
                },
            };
        },
        [getToken],
    );

    const defaultFilters = useMemo(() => ({}) as ApplicationFilters, []);

    const {
        data: applications,
        loading,
        error,
        pagination,
        searchInput,
        setSearchInput,
        goToPage,
        refresh,
        filters,
        setFilters,
        setFilter,
    } = useStandardList<Application, ApplicationFilters>({
        fetchFn: fetchApplications,
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
    });

    const handleTabChange = (scope: "mine" | "all") => {
        setActiveTab(scope);
        // TODO: Add filter logic for "My Applications" vs "All Applications"
        // For now, show all applications
        goToPage(1);
    };

    return (
        <div
            className={`
            flex flex-col border-r border-base-300 bg-base-200
            w-full md:w-96 lg:w-[420px] 
            ${selectedId ? "hidden md:flex" : "flex"} 
        `}
        >
            {/* Header / Search Area */}
            <div className="p-4 border-b border-base-300 bg-base-100/50 backdrop-blur-sm sticky top-0 z-20">
                <div role="tablist" className="tabs tabs-box w-full mb-4">
                    <a
                        role="tab"
                        className={`tab ${activeTab === "mine" ? "tab-active" : ""}`}
                        onClick={() => handleTabChange("mine")}
                    >
                        My Applications
                    </a>
                    <a
                        role="tab"
                        className={`tab ${activeTab === "all" ? "tab-active" : ""}`}
                        onClick={() => handleTabChange("all")}
                    >
                        All Applications
                    </a>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1">
                        <SearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search applications..."
                            // @ts-ignore
                            className="w-full"
                        />
                    </div>
                    <FilterDropdown filters={filters} onChange={setFilters} />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto min-h-0 relative">
                {loading && applications.length === 0 ? (
                    <div className="p-8 text-center text-base-content/50">
                        <span className="loading loading-spinner loading-md mb-2"></span>
                        <p>Loading applications...</p>
                    </div>
                ) : error ? (
                    <ErrorState message={error} onRetry={refresh} />
                ) : applications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 p-4 text-center text-base-content/50">
                        <i className="fa-duotone fa-user-check text-4xl mb-3 opacity-50" />
                        <p>No applications found</p>
                        <button
                            onClick={() => setFilters({})}
                            className="btn btn-ghost btn-xs mt-2"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-base-300">
                        {applications.map((application) => (
                            <ApplicationListItem
                                key={application.id}
                                item={application}
                                isSelected={selectedId === application.id}
                                onSelect={onSelect}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            <PaginationControls
                pagination={pagination}
                onPageChange={goToPage}
                compact={true}
            />
        </div>
    );
}
