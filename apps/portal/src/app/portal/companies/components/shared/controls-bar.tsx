"use client";

import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { CompanyTab, CompanyFilters } from "../../types";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    activeTab: CompanyTab;
    onTabChange: (tab: CompanyTab) => void;
    filters: CompanyFilters;
    onFilterChange: <K extends keyof CompanyFilters>(
        key: K,
        value: CompanyFilters[K],
    ) => void;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    isMyCompanies: boolean;
    companyCount: number;
    totalCount: number;
    loading: boolean;
    refresh: () => void;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    activeTab,
    onTabChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    isMyCompanies,
    companyCount,
    totalCount,
    loading,
    refresh,
}: ControlsBarProps) {
    return (
        <BaselControlsBarShell
            filters={
                <>
                    <SearchInput
                        value={searchInput}
                        onChange={onSearchChange}
                        placeholder="Search companies..."
                        className="flex-1 min-w-[200px] max-w-md"
                    />

                    {/* Tab Toggle */}
                    <div className="join">
                        <button
                            onClick={() => onTabChange("marketplace")}
                            className={`join-item btn btn-sm rounded-none ${
                                activeTab === "marketplace" ? "btn-active" : ""
                            }`}
                        >
                            <i className="fa-duotone fa-regular fa-store" />
                            <span className="hidden sm:inline">Marketplace</span>
                        </button>
                        <button
                            onClick={() => onTabChange("my-companies")}
                            className={`join-item btn btn-sm rounded-none ${
                                activeTab === "my-companies" ? "btn-active" : ""
                            }`}
                        >
                            <i className="fa-duotone fa-regular fa-handshake" />
                            <span className="hidden sm:inline">My Companies</span>
                        </button>
                    </div>

                    <select
                        value={filters.industry || ""}
                        onChange={(e) =>
                            onFilterChange("industry", e.target.value || undefined)
                        }
                        className="select uppercase rounded-none"
                    >
                        <option value="">All Industries</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Consulting">Consulting</option>
                    </select>

                    {isMyCompanies && (
                        <select
                            value={filters.status || ""}
                            onChange={(e) =>
                                onFilterChange("status", e.target.value || undefined)
                            }
                            className="select uppercase rounded-none"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="declined">Declined</option>
                            <option value="terminated">Terminated</option>
                        </select>
                    )}

                </>
            }
            statusLeft={
                <BaselResultsCount count={companyCount} total={totalCount} />
            }
            statusRight={
                <>
                    <BaselRefreshButton onClick={refresh} loading={loading} />
                    <BaselViewModeSelector
                        viewMode={viewMode}
                        onViewModeChange={onViewModeChange}
                    />
                </>
            }
        />
    );
}
