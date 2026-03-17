"use client";

import { useState } from "react";
import { SearchInput } from "@/hooks/use-standard-list";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    BaselFilterSelect,
    BaselSortSelect,
    BaselExpandToggle,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { CallFilters, CallTag } from "../../types";
import { CALL_TYPE_LABELS, CALL_STATUS_LABELS, CALL_SORT_OPTIONS } from "../../types";

const TYPE_OPTIONS = Object.entries(CALL_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(CALL_STATUS_LABELS).map(([value, label]) => ({ value, label }));

const FOLLOW_UP_OPTIONS = [
    { value: "true", label: "Needs Follow-up" },
    { value: "false", label: "No Follow-up" },
];

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
    callCount,
    totalCount,
    loading,
    refresh,
    tags,
    sortBy,
    sortOrder,
    onSortChange,
}: ControlsBarProps) {
    const [expanded, setExpanded] = useState(false);

    const hasExpandedFilters = !!(filters.tag || filters.needs_follow_up !== undefined || filters.date_from || filters.date_to);

    const tagOptions = tags.map((t) => ({ value: t.slug, label: t.label }));

    return (
        <BaselControlsBarShell
            search={
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search calls, participants..."
                    className="input-sm"
                />
            }
            filters={
                <>
                    <BaselFilterSelect
                        value={filters.call_type}
                        onChange={(v) => onFilterChange("call_type", v)}
                        options={TYPE_OPTIONS}
                        placeholder="All Types"
                    />
                    <BaselFilterSelect
                        value={filters.status}
                        onChange={(v) => onFilterChange("status", v)}
                        options={STATUS_OPTIONS}
                        placeholder="All Status"
                    />
                </>
            }
            statusLeft={
                <BaselResultsCount count={callCount} total={totalCount} />
            }
            statusRight={
                <>
                    <BaselSortSelect
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        options={CALL_SORT_OPTIONS}
                    />
                    <BaselRefreshButton onClick={refresh} loading={loading} />
                    <BaselViewModeSelector
                        viewMode={viewMode}
                        onViewModeChange={onViewModeChange}
                    />
                    <BaselExpandToggle
                        expanded={expanded || hasExpandedFilters}
                        onToggle={() => setExpanded((prev) => !prev)}
                    />
                </>
            }
            expandedFilters={
                (expanded || hasExpandedFilters) ? (
                    <>
                        {tagOptions.length > 0 && (
                            <BaselFilterSelect
                                value={filters.tag}
                                onChange={(v) => onFilterChange("tag", v)}
                                options={tagOptions}
                                placeholder="All Tags"
                            />
                        )}
                        <BaselFilterSelect
                            value={
                                filters.needs_follow_up === undefined
                                    ? undefined
                                    : String(filters.needs_follow_up)
                            }
                            onChange={(v) =>
                                onFilterChange(
                                    "needs_follow_up",
                                    v === undefined ? undefined : v === "true",
                                )
                            }
                            options={FOLLOW_UP_OPTIONS}
                            placeholder="Follow-up"
                        />
                        <input
                            type="date"
                            value={filters.date_from || ""}
                            onChange={(e) =>
                                onFilterChange("date_from", e.target.value || undefined)
                            }
                            className="input input-sm rounded-none"
                            placeholder="From date"
                            title="From date"
                        />
                        <input
                            type="date"
                            value={filters.date_to || ""}
                            onChange={(e) =>
                                onFilterChange("date_to", e.target.value || undefined)
                            }
                            className="input input-sm rounded-none"
                            placeholder="To date"
                            title="To date"
                        />
                    </>
                ) : undefined
            }
        />
    );
}
