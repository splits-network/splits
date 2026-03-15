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
    STAGE_LABELS,
    FOUNDED_YEAR_RANGE_LABELS,
    HAS_OPEN_ROLES_LABELS,
    RELATIONSHIP_TYPE_LABELS,
} from "../../types";

const INDUSTRY_OPTIONS = Object.entries(INDUSTRY_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(RELATIONSHIP_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const SIZE_OPTIONS = Object.entries(COMPANY_SIZE_LABELS).map(([value, label]) => ({ value, label }));
const STAGE_OPTIONS = Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label }));
const FOUNDED_YEAR_OPTIONS = Object.entries(FOUNDED_YEAR_RANGE_LABELS).map(([value, label]) => ({ value, label }));
const HAS_OPEN_ROLES_OPTIONS = Object.entries(HAS_OPEN_ROLES_LABELS).map(([value, label]) => ({ value, label }));
const RELATIONSHIP_TYPE_OPTIONS = Object.entries(RELATIONSHIP_TYPE_LABELS).map(([value, label]) => ({ value, label }));

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
    const hasExpandedFilters = !!(filters.status || filters.company_size || filters.stage || filters.founded_year_range || filters.has_open_roles || filters.relationship_type);

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
                            { value: "my-companies", label: "Mine" },
                            { value: "marketplace", label: "All" },
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
                        <BaselFilterSelect
                            value={filters.stage}
                            onChange={(v) => onFilterChange("stage", v)}
                            options={STAGE_OPTIONS}
                            placeholder="All Stages"
                        />
                        <BaselFilterSelect
                            value={filters.founded_year_range}
                            onChange={(v) => onFilterChange("founded_year_range", v)}
                            options={FOUNDED_YEAR_OPTIONS}
                            placeholder="Founded"
                        />
                        <BaselFilterSelect
                            value={filters.has_open_roles}
                            onChange={(v) => onFilterChange("has_open_roles", v)}
                            options={HAS_OPEN_ROLES_OPTIONS}
                            placeholder="Open Roles"
                        />
                        {isMyCompanies && (
                            <BaselFilterSelect
                                value={filters.relationship_type}
                                onChange={(v) => onFilterChange("relationship_type", v)}
                                options={RELATIONSHIP_TYPE_OPTIONS}
                                placeholder="Role Type"
                            />
                        )}
                    </>
                ) : undefined
            }
        />
    );
}
