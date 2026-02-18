"use client";

import { SearchInput } from "@splits-network/memphis-ui";
import type { ViewMode } from "./accent";
import type { InvitationFilters } from "../../types";
import { ViewModeToggle } from "./view-mode-toggle";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: InvitationFilters;
    onFilterChange: <K extends keyof InvitationFilters>(key: K, value: InvitationFilters[K]) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onCreateInvitation: () => void;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    onCreateInvitation,
}: ControlsBarProps) {
    return (
        <div className="controls-bar mb-4">
            {/* Search */}
            <SearchInput
                value={searchInput}
                onChange={onSearchChange}
                placeholder="Search invitations, emails, companies..."
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
                    <option value="accepted">Accepted</option>
                    <option value="expired">Expired</option>
                    <option value="revoked">Revoked</option>
                </select>
            </div>

            {/* Create Invitation */}
            <button
                onClick={onCreateInvitation}
                className="btn btn-sm btn-primary gap-2"
            >
                <i className="fa-duotone fa-regular fa-plus" />
                <span className="hidden sm:inline">Invite Company</span>
            </button>

            {/* View Mode Toggle */}
            <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
            />
        </div>
    );
}
