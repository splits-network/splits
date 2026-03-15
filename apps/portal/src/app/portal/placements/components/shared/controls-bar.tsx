"use client";

import { useState } from "react";
import { SearchInput } from "@/components/standard-lists";
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
import type { PlacementFilters } from "../../types";
import {
    PLACEMENT_STATUS_LABELS,
    PLACEMENT_SORT_OPTIONS,
    SALARY_RANGE_LABELS,
    FEE_RANGE_LABELS,
    FEE_AMOUNT_LABELS,
    GUARANTEE_STATUS_LABELS,
    IS_REPLACEMENT_LABELS,
    HAS_STARTED_LABELS,
    INVOICE_STATUS_LABELS,
    PAYOUT_STATUS_LABELS,
} from "../../types";

const STATUS_OPTIONS = Object.entries(PLACEMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const SALARY_RANGE_OPTIONS = Object.entries(SALARY_RANGE_LABELS).map(([value, label]) => ({ value, label }));
const FEE_RANGE_OPTIONS = Object.entries(FEE_RANGE_LABELS).map(([value, label]) => ({ value, label }));
const FEE_AMOUNT_OPTIONS = Object.entries(FEE_AMOUNT_LABELS).map(([value, label]) => ({ value, label }));
const GUARANTEE_STATUS_OPTIONS = Object.entries(GUARANTEE_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const IS_REPLACEMENT_OPTIONS = Object.entries(IS_REPLACEMENT_LABELS).map(([value, label]) => ({ value, label }));
const HAS_STARTED_OPTIONS = Object.entries(HAS_STARTED_LABELS).map(([value, label]) => ({ value, label }));
const INVOICE_STATUS_OPTIONS = Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const PAYOUT_STATUS_OPTIONS = Object.entries(PAYOUT_STATUS_LABELS).map(([value, label]) => ({ value, label }));

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: PlacementFilters;
    onFilterChange: <K extends keyof PlacementFilters>(
        key: K,
        value: PlacementFilters[K],
    ) => void;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    placementCount: number;
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
    placementCount,
    totalCount,
    loading,
    refresh,
    sortBy,
    sortOrder,
    onSortChange,
}: ControlsBarProps) {
    const [expanded, setExpanded] = useState(false);

    const hasExpandedFilters = !!(filters.fee_range || filters.fee_amount_range || filters.guarantee_status || filters.is_replacement || filters.has_started || filters.invoice_status || filters.payout_status);

    return (
        <BaselControlsBarShell
            search={
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search placements, candidates, companies..."
                    className="input-sm"
                />
            }
            filters={
                <>
                    <BaselFilterSelect
                        value={filters.status}
                        onChange={(v) => onFilterChange("status", v)}
                        options={STATUS_OPTIONS}
                        placeholder="All Status"
                    />
                    <BaselFilterSelect
                        value={filters.salary_range}
                        onChange={(v) => onFilterChange("salary_range", v)}
                        options={SALARY_RANGE_OPTIONS}
                        placeholder="All Salaries"
                    />
                </>
            }
            statusLeft={
                <BaselResultsCount count={placementCount} total={totalCount} />
            }
            statusRight={
                <>
                    <BaselSortSelect
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        options={PLACEMENT_SORT_OPTIONS}
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
                        <BaselFilterSelect
                            value={filters.fee_range}
                            onChange={(v) => onFilterChange("fee_range", v)}
                            options={FEE_RANGE_OPTIONS}
                            placeholder="Fee %"
                        />
                        <BaselFilterSelect
                            value={filters.fee_amount_range}
                            onChange={(v) => onFilterChange("fee_amount_range", v)}
                            options={FEE_AMOUNT_OPTIONS}
                            placeholder="Fee Amount"
                        />
                        <BaselFilterSelect
                            value={filters.guarantee_status}
                            onChange={(v) => onFilterChange("guarantee_status", v)}
                            options={GUARANTEE_STATUS_OPTIONS}
                            placeholder="Guarantee"
                        />
                        <BaselFilterSelect
                            value={filters.is_replacement}
                            onChange={(v) => onFilterChange("is_replacement", v)}
                            options={IS_REPLACEMENT_OPTIONS}
                            placeholder="Placement Type"
                        />
                        <BaselFilterSelect
                            value={filters.has_started}
                            onChange={(v) => onFilterChange("has_started", v)}
                            options={HAS_STARTED_OPTIONS}
                            placeholder="Start Status"
                        />
                        <BaselFilterSelect
                            value={filters.invoice_status}
                            onChange={(v) => onFilterChange("invoice_status", v)}
                            options={INVOICE_STATUS_OPTIONS}
                            placeholder="Invoice"
                        />
                        <BaselFilterSelect
                            value={filters.payout_status}
                            onChange={(v) => onFilterChange("payout_status", v)}
                            options={PAYOUT_STATUS_OPTIONS}
                            placeholder="Payout"
                        />
                    </>
                ) : undefined
            }
        />
    );
}
