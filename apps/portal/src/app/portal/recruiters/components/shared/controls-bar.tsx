"use client";

import { SearchInput } from "@splits-network/memphis-ui";
import type { ViewMode } from "./accent";
import type { MarketplaceFilters } from "../../types";
import { ViewModeToggle } from "./view-mode-toggle";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: MarketplaceFilters;
    onFilterChange: <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    canInvite: boolean;
    onInvite: () => void;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    canInvite,
    onInvite,
}: ControlsBarProps) {
    return (
        <div className="controls-bar mb-4">
            {/* Search */}
            <SearchInput
                value={searchInput}
                onChange={onSearchChange}
                placeholder="Search recruiters, specialties, industries..."
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
                    <option value="active">Active</option>
                    <option value="">All</option>
                </select>
            </div>

            {/* Invite Recruiter */}
            {canInvite && (
                <button
                    onClick={onInvite}
                    className="btn btn-sm btn-primary gap-2"
                >
                    <i className="fa-duotone fa-regular fa-paper-plane" />
                    <span className="hidden sm:inline">Invite</span>
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
