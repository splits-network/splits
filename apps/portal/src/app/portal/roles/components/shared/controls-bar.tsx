"use client";

import { SearchInput } from "@splits-network/memphis-ui";
import type { ViewMode } from "./accent";
import type { UnifiedJobFilters } from "../../types";
import { ViewModeToggle } from "./view-mode-toggle";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: UnifiedJobFilters;
    onFilterChange: <K extends keyof UnifiedJobFilters>(key: K, value: UnifiedJobFilters[K]) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    canCreateRole: boolean;
    onAddRole: () => void;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    canCreateRole,
    onAddRole,
}: ControlsBarProps) {
    return (
        <div className="controls-bar mb-4">
            {/* Search */}
            <SearchInput
                value={searchInput}
                onChange={onSearchChange}
                placeholder="Search jobs, companies, skills..."
                className="flex-1"
            />

            {/* Inline Status Filter */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-dark/50">Status:</span>
                <select
                    value={filters.status || ""}
                    onChange={(e) => onFilterChange("status", e.target.value || undefined)}
                    className="select select-sm select-ghost font-bold uppercase"
                >
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="filled">Filled</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            {/* Inline Type Filter */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-dark/50">Type:</span>
                <select
                    value={filters.employment_type || ""}
                    onChange={(e) => onFilterChange("employment_type", e.target.value || undefined)}
                    className="select select-sm select-ghost font-bold uppercase"
                >
                    <option value="">All</option>
                    <option value="full_time">Full Time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                </select>
            </div>

            {/* Add Role */}
            {canCreateRole && (
                <button
                    onClick={onAddRole}
                    className="btn btn-sm btn-primary gap-2"
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    <span className="hidden sm:inline">Add Role</span>
                </button>
            )}

            {/* View Mode Toggle */}
            <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
            />
        </div>
    );
}
