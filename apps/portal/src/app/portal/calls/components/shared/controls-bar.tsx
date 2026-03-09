"use client";

import { SearchInput } from "@/hooks/use-standard-list";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { CallFilters, CallTag } from "../../types";
import { CALL_STATUS_LABELS } from "../../types";
import { CallFilterDropdowns } from "./call-filters";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: CallFilters;
    onFilterChange: <K extends keyof CallFilters>(
        key: K,
        value: CallFilters[K],
    ) => void;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    callCount: number;
    totalCount: number;
    loading: boolean;
    refresh: () => void;
    tags: CallTag[];
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    callCount,
    totalCount,
    loading,
    refresh,
    tags,
}: ControlsBarProps) {
    return (
        <BaselControlsBarShell
            filters={
                <>
                    <SearchInput
                        value={searchInput}
                        onChange={onSearchChange}
                        placeholder="Search calls, participants..."
                        className="flex-1 min-w-[200px] max-w-md"
                    />

                    <CallFilterDropdowns
                        filters={filters}
                        onFilterChange={onFilterChange}
                        tags={tags}
                    />
                </>
            }
            statusLeft={
                <BaselResultsCount count={callCount} total={totalCount} />
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
