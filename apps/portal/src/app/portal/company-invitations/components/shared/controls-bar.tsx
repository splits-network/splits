"use client";

import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    BaselFilterSelect,
    BaselSortSelect,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { ConnectionFilters } from "../../types";
import { CONNECTION_STATUS_LABELS, CONNECTION_SORT_OPTIONS } from "../../types";

const STATUS_OPTIONS = Object.entries(CONNECTION_STATUS_LABELS).map(([value, label]) => ({ value, label }));

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: ConnectionFilters;
    onFilterChange: <K extends keyof ConnectionFilters>(
        key: K,
        value: ConnectionFilters[K],
    ) => void;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    invitationCount: number;
    totalCount: number;
    loading: boolean;
    refresh: () => void;
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSortChange: (field: string, order: "asc" | "desc") => void;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    invitationCount,
    totalCount,
    loading,
    refresh,
    sortBy,
    sortOrder,
    onSortChange,
}: ControlsBarProps) {
    return (
        <BaselControlsBarShell
            search={
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search connections..."
                    className="input-sm"
                />
            }
            filters={
                <BaselFilterSelect
                    value={filters.status}
                    onChange={(v) => onFilterChange("status", v)}
                    options={STATUS_OPTIONS}
                    placeholder="All Status"
                />
            }
            statusLeft={
                <BaselResultsCount count={invitationCount} total={totalCount} />
            }
            statusRight={
                <>
                    <BaselSortSelect
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        options={CONNECTION_SORT_OPTIONS}
                    />
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
