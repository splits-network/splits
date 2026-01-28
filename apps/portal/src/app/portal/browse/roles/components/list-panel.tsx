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
import RoleListItem from "./list-item";
import FilterDropdown from "./filter-dropdown";
import AddRoleWizardModal from "@/app/portal/roles/components/add-role-wizard-modal";
import { Job, JobFilters } from "./types";

interface ListPanelProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function ListPanel({ selectedId, onSelect }: ListPanelProps) {
    const { getToken } = useAuth();
    const { isRecruiter, isCompanyUser, profile } = useUserProfile();
    const [activeTab, setActiveTab] = useState<"mine" | "all">("mine");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Permission check for creating roles
    // Allowed: Company Users (Admin/HM) OR Recruiters with Organization
    const canCreateRole =
        isCompanyUser ||
        (isRecruiter && (profile?.organization_ids?.length || 0) > 0);

    const fetchJobs = useCallback(
        async (params: Record<string, any>) => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const response = await client.get("/jobs", { params });

            return {
                data: (response.data || []) as Job[],
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

    const defaultFilters = useMemo(() => ({ scope: "mine" }) as JobFilters, []);

    const {
        data: jobs,
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
    } = useStandardList<Job, JobFilters>({
        fetchFn: fetchJobs,
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
    });

    const handleTabChange = (scope: "mine" | "all") => {
        setActiveTab(scope);
        setFilter("scope", scope);
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

                <div className="flex gap-2">
                    <div className="flex-1">
                        <SearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search roles..."
                            // @ts-ignore
                            className="w-full"
                        />
                    </div>
                    <FilterDropdown filters={filters} onChange={setFilters} />

                    {canCreateRole && (
                        <div
                            className="tooltip tooltip-bottom"
                            data-tip="Add Role"
                        >
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="btn btn-square btn-primary"
                                aria-label="Add role"
                            >
                                <i className="fa-duotone fa-plus text-lg"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto min-h-0 relative">
                {loading && jobs.length === 0 ? (
                    <div className="p-8 text-center text-base-content/50">
                        <span className="loading loading-spinner loading-md mb-2"></span>
                        <p>Loading roles...</p>
                    </div>
                ) : error ? (
                    <ErrorState message={error} onRetry={refresh} />
                ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 p-4 text-center text-base-content/50">
                        <i className="fa-duotone fa-briefcase text-4xl mb-3 opacity-50" />
                        <p>No roles found</p>
                        <button
                            onClick={() => setFilter("scope", "all")}
                            className="btn btn-ghost btn-xs mt-2"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-base-300">
                        {jobs.map((job) => (
                            <RoleListItem
                                key={job.id}
                                item={job}
                                isSelected={selectedId === job.id}
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
            />

            {/* Add Role Modal */}
            <AddRoleWizardModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    refresh();
                }}
            />
        </div>
    );
}
