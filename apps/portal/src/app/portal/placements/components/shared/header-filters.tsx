"use client";

import { useCallback } from "react";
import { Input, Select, Button } from "@splits-network/memphis-ui";
import { PlacementFilters } from "../../types";

interface HeaderFiltersProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    filters: PlacementFilters;
    setFilter: <K extends keyof PlacementFilters>(
        key: K,
        value: PlacementFilters[K],
    ) => void;
    loading: boolean;
    refresh: () => void;
    showStats: boolean;
    setShowStats: (show: boolean) => void;
}

export default function HeaderFilters({
    searchInput,
    setSearchInput,
    clearSearch,
    filters,
    setFilter,
    loading,
    refresh,
    showStats,
    setShowStats,
}: HeaderFiltersProps) {
    const handleReset = useCallback(() => {
        setFilter("status", undefined);
    }, [setFilter]);

    const activeFilterCount = [filters.status].filter(Boolean).length;

    return (
        <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="flex border-4 border-dark w-48 lg:w-64">
                <div className="flex items-center px-3 bg-cream">
                    <i className="fa-duotone fa-regular fa-search text-xs text-dark" />
                </div>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-3 py-2 text-xs font-semibold outline-none text-dark"
                />
                {searchInput && (
                    <button
                        onClick={clearSearch}
                        className="px-3 hover:bg-coral hover:text-white transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-xs" />
                    </button>
                )}
            </div>

            {/* Stats Toggle */}
            <button
                onClick={() => setShowStats(!showStats)}
                className={`w-10 h-10 border-4 border-dark flex items-center justify-center font-bold hover:bg-coral hover:text-white transition-colors ${showStats ? "bg-coral text-white" : "bg-white text-dark"}`}
            >
                <i className="fa-duotone fa-regular fa-chart-simple text-sm" />
            </button>

            {/* Refresh */}
            <button
                onClick={refresh}
                className="w-10 h-10 border-4 border-dark bg-white text-dark flex items-center justify-center font-bold hover:bg-teal hover:text-white transition-colors disabled:opacity-50"
                disabled={loading}
            >
                <i
                    className={`fa-duotone fa-regular fa-arrows-rotate text-sm ${loading ? "animate-spin" : ""}`}
                />
            </button>

            {/* Status Filter */}
            <Select
                value={filters.status || ""}
                onChange={(e) =>
                    setFilter("status", e.target.value || undefined)
                }
                options={[
                    { value: "", label: "All Statuses" },
                    { value: "hired", label: "Hired" },
                    { value: "active", label: "Active" },
                    { value: "completed", label: "Completed" },
                    { value: "failed", label: "Failed" },
                ]}
                className="select-sm w-40"
            />

            {activeFilterCount > 0 && (
                <button
                    onClick={handleReset}
                    className="text-xs font-black uppercase tracking-wider text-coral hover:text-dark transition-colors"
                >
                    Reset Filters
                </button>
            )}
        </div>
    );
}
