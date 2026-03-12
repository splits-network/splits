"use client";

import { useState } from "react";
import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    BaselScopeToggle,
    BaselFilterSelect,
    BaselSortSelect,
    BaselExpandToggle,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { CompanyTab, CompanyFilters } from "../../types";
import {
    INDUSTRY_LABELS,
    RELATIONSHIP_STATUS_LABELS,
    COMPANY_SIZE_LABELS,
    COMPANY_SORT_OPTIONS,
} from "../../types";

const INDUSTRY_OPTIONS = Object.entries(INDUSTRY_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(RELATIONSHIP_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const SIZE_OPTIONS = Object.entries(COMPANY_SIZE_LABELS).map(([value, label]) => ({ value, label }));

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    activeTab: CompanyTab;
    onTabChange: (tab: CompanyTab) => void;
    filters: CompanyFilters;
    onFilterChange: <K extends keyof CompanyFilters>(
        key: K,
        value: CompanyFilters[K],
    ) => void;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    isMyCompanies: boolean;
    companyCount: number;
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
    activeTab,
    onTabChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    companyCount,
    totalCount,
    loading,
    refresh,
    sortBy,
    sortOrder,
    onSortChange,
}: ControlsBarProps) {
    const [expanded, setExpanded] = useState(false);

    const isMyCompanies = activeTab === "my-companies";
    const hasExpandedFilters = !!(filters.status || filters.company_size);

    return (
        <BaselControlsBarShell
            search={
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search companies..."
                    className="input-sm"
                />
            }
            filters={
                <BaselFilterSelect
                    value={filters.industry}
                    onChange={(v) => onFilterChange("industry", v)}
                    options={INDUSTRY_OPTIONS}
                    placeholder="All Industries"
                />
            }
            statusLeft={
                <>
                    <BaselScopeToggle
                        value={activeTab}
                        onChange={(v) => onTabChange(v as CompanyTab)}
                        options={[
                            { value: "marketplace", label: "Marketplace" },
                            { value: "my-companies", label: "My Companies" },
                        ]}
                    />
                    <BaselResultsCount count={companyCount} total={totalCount} />
                </>
            }
            statusRight={
                <>
                    <BaselSortSelect
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        options={COMPANY_SORT_OPTIONS}
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
                        {isMyCompanies && (
                            <BaselFilterSelect
                                value={filters.status}
                                onChange={(v) => onFilterChange("status", v)}
                                options={STATUS_OPTIONS}
                                placeholder="All Status"
                            />
                        )}
                        <BaselFilterSelect
                            value={filters.company_size}
                            onChange={(v) => onFilterChange("company_size", v)}
                            options={SIZE_OPTIONS}
                            placeholder="All Sizes"
                        />
                    </>
                ) : undefined
            }
        />
    );
}
