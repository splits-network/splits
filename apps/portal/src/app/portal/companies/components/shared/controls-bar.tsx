"use client";

import { SearchInput } from "@splits-network/memphis-ui";
import type { ViewMode } from "./accent";
import type { CompanyTab, CompanyFilters } from "../../types";
import { ViewModeToggle } from "./view-mode-toggle";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    activeTab: CompanyTab;
    onTabChange: (tab: CompanyTab) => void;
    filters: CompanyFilters;
    onFilterChange: <K extends keyof CompanyFilters>(key: K, value: CompanyFilters[K]) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    isMyCompanies: boolean;
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
}: ControlsBarProps) {
    return (
        <div className="controls-bar mb-4">
            {/* Search */}
            <SearchInput
                value={searchInput}
                onChange={onSearchChange}
                placeholder="Search companies..."
                className="flex-1"
            />

            {/* Tab Toggle */}
            <div className="flex items-center border-2 border-dark h-10">
                <button
                    onClick={() => onTabChange("marketplace")}
                    className={`btn btn-sm gap-2 rounded-none border-0 h-full ${
                        activeTab === "marketplace"
                            ? "btn-dark text-coral"
                            : "btn-ghost text-dark hover:bg-cream"
                    }`}
                >
                    <i className="fa-duotone fa-regular fa-store" />
                    <span className="hidden sm:inline">Marketplace</span>
                </button>
                <button
                    onClick={() => onTabChange("my-companies")}
                    className={`btn btn-sm gap-2 rounded-none border-0 h-full ${
                        activeTab === "my-companies"
                            ? "btn-dark text-teal"
                            : "btn-ghost text-dark hover:bg-cream"
                    }`}
                >
                    <i className="fa-duotone fa-regular fa-handshake" />
                    <span className="hidden sm:inline">My Companies</span>
                </button>
            </div>

            {/* Industry Filter */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-dark/50">Industry:</span>
                <select
                    value={filters.industry || ""}
                    onChange={(e) => onFilterChange("industry", e.target.value || undefined)}
                    className="select select-sm select-ghost font-bold uppercase"
                >
                    <option value="">All</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Consulting">Consulting</option>
                </select>
            </div>

            {/* Status Filter (my-companies only) */}
            {isMyCompanies && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-dark/50">Status:</span>
                    <select
                        value={filters.status || ""}
                        onChange={(e) => onFilterChange("status", e.target.value || undefined)}
                        className="select select-sm select-ghost font-bold uppercase"
                    >
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="declined">Declined</option>
                        <option value="terminated">Terminated</option>
                    </select>
                </div>
            )}

            {/* View Mode Toggle */}
            <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
            />
        </div>
    );
}
