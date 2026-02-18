"use client";

import { SearchInput } from "@splits-network/memphis-ui";
import type { ViewMode } from "./accent";
import type { ConnectionFilters } from "../../types";
import { ViewModeToggle } from "./view-mode-toggle";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: ConnectionFilters;
    onFilterChange: <K extends keyof ConnectionFilters>(key: K, value: ConnectionFilters[K]) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
}: ControlsBarProps) {
    return (
        <div className="controls-bar mb-4">
            {/* Search */}
            <SearchInput
                value={searchInput}
                onChange={onSearchChange}
                placeholder="Search connections..."
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
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="declined">Declined</option>
                    <option value="terminated">Terminated</option>
                </select>
            </div>

            {/* View Mode Toggle */}
            <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
            />
        </div>
    );
}
