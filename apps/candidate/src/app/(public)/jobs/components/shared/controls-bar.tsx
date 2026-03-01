"use client";

import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import { EMPLOYMENT_TYPES } from "../../types";
import type { JobFilters } from "../../types";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: JobFilters;
    onFilterChange: (key: keyof JobFilters, value: string | undefined) => void;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    resultCount: number;
    totalCount: number;
    loading: boolean;
    refresh: () => void;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    resultCount,
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
                        placeholder="Search jobs, companies, locations..."
                        className="flex-1 min-w-[200px] max-w-md"
                    />

                    <select
                        value={filters.employment_type || ""}
                        onChange={(e) =>
                            onFilterChange(
                                "employment_type",
                                e.target.value || undefined,
                            )
                        }
                        className="select select-bordered bg-base-200 border-base-300 text-sm uppercase tracking-wider font-bold rounded-none"
                    >
                        <option value="">All Types</option>
                        {EMPLOYMENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>

                </>
            }
            statusLeft={
                <BaselResultsCount count={resultCount} total={totalCount} />
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
