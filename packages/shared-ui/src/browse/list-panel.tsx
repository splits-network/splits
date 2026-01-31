/**
 * BrowseListPanel - Generic list panel with search, filters, and pagination
 * Integrates with useStandardList hook pattern from the portal apps
 */

"use client";

import { useCallback, useMemo, useState, ReactNode } from "react";
import {
    StandardListParams,
    StandardListResponse,
} from "@splits-network/shared-types";
import type {
    BrowseListPanelProps,
    BrowseListItem,
    BrowseFilters,
} from "./types";

// These hooks would need to be passed in or re-implemented in shared-ui
// For now, we'll create a minimal interface that domains can provide
interface UseStandardListHook<T, F> {
    data: T[];
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
    searchInput: string;
    setSearchInput: (value: string) => void;
    goToPage: (page: number) => void;
    refresh: () => Promise<void>;
    filters: F;
    setFilters: (filters: F) => void;
    setFilter: (key: keyof F, value: any) => void;
}

interface BrowseListPanelInternalProps<
    T extends BrowseListItem,
    F extends BrowseFilters,
> extends BrowseListPanelProps<T, F> {
    useStandardList: (config: {
        fetchFn: (
            params: StandardListParams & F,
        ) => Promise<StandardListResponse<T>>;
        defaultFilters: F;
        defaultSortBy: string;
        defaultSortOrder: "asc" | "desc";
    }) => UseStandardListHook<T, F>;
}

export function BrowseListPanel<
    T extends BrowseListItem,
    F extends BrowseFilters,
>({
    selectedId,
    onSelect,
    fetchFn,
    renderListItem,
    renderFilters,
    defaultFilters = {} as F,
    defaultSortBy = "created_at",
    defaultSortOrder = "desc",
    searchPlaceholder = "Search...",
    listHeader,
    actions,
    tabs,
    defaultActiveTab,
    className = "",
    useStandardList,
}: BrowseListPanelInternalProps<T, F>) {
    const [activeTab, setActiveTab] = useState(
        defaultActiveTab || tabs?.[0]?.key || "",
    );

    const {
        data,
        loading,
        error,
        pagination,
        searchInput,
        setSearchInput,
        goToPage,
        refresh,
        filters,
        setFilters,
        setFilter,
    } = useStandardList({
        fetchFn,
        defaultFilters,
        defaultSortBy,
        defaultSortOrder,
    });

    const handleTabChange = useCallback(
        (tabKey: string) => {
            setActiveTab(tabKey);
            const tab = tabs?.find((t) => t.key === tabKey);
            if (tab && tab.filterKey && tab.filterValue !== undefined) {
                setFilter(tab.filterKey, tab.filterValue);
            }
            goToPage(1);
        },
        [tabs, setFilter, goToPage],
    );

    // Search input component
    const SearchInput = ({
        value,
        onChange,
        placeholder,
        className: searchClassName = "",
    }: {
        value: string;
        onChange: (value: string) => void;
        placeholder: string;
        className?: string;
    }) => (
        <label className={`input ${searchClassName}`}>
            <i className="fa-duotone fa-regular fa-search" />
            <input
                type="text"
                placeholder={placeholder}
                className=""
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </label>
    );

    // Pagination controls component
    const PaginationControls = ({
        pagination,
        onPageChange,
    }: {
        pagination: { page: number; total_pages: number; total: number };
        onPageChange: (page: number) => void;
    }) => {
        if (pagination.total_pages <= 1) return null;

        return (
            <div className="flex items-center justify-between p-4 border-t border-base-300">
                <span className="text-sm text-base-content/60">
                    Page {pagination.page} of {pagination.total_pages}
                </span>
                <div className="join">
                    <button
                        className="join-item btn btn-sm"
                        disabled={pagination.page <= 1}
                        onClick={() => onPageChange(pagination.page - 1)}
                    >
                        <i className="fa-duotone fa-chevron-left" />
                    </button>
                    <button
                        className="join-item btn btn-sm"
                        disabled={pagination.page >= pagination.total_pages}
                        onClick={() => onPageChange(pagination.page + 1)}
                    >
                        <i className="fa-duotone fa-chevron-right" />
                    </button>
                </div>
            </div>
        );
    };

    // Error state component
    const ErrorState = ({
        error,
        onRefresh,
    }: {
        error: string;
        onRefresh: () => void;
    }) => (
        <div className="p-8 text-center">
            <div className="alert alert-error mb-4">
                <i className="fa-duotone fa-regular fa-circle-exclamation" />
                <span>{error}</span>
            </div>
            <button onClick={onRefresh} className="btn btn-sm btn-ghost">
                <i className="fa-duotone fa-refresh mr-2" />
                Try Again
            </button>
        </div>
    );

    return (
        <div className={className}>
            {/* Header / Search Area */}
            <div className="p-4 border-b border-base-300 bg-base-100/50 backdrop-blur-sm sticky top-0 z-20">
                {/* Tabs */}
                {tabs && tabs.length > 0 && (
                    <div role="tablist" className="tabs tabs-box w-full mb-4">
                        {tabs.map((tab) => (
                            <a
                                key={tab.key}
                                role="tab"
                                className={`tab ${activeTab === tab.key ? "tab-active" : ""}`}
                                onClick={() => handleTabChange(tab.key)}
                            >
                                {tab.label}
                            </a>
                        ))}
                    </div>
                )}

                {/* Custom header */}
                {listHeader}

                {/* Search and Actions Row */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <SearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder={searchPlaceholder}
                            className="w-full"
                        />
                    </div>

                    {/* Filters */}
                    {renderFilters && renderFilters(filters, setFilters)}

                    {/* Actions */}
                    {actions}
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto min-h-0 relative">
                {loading && data.length === 0 ? (
                    <div className="p-8 text-center text-base-content/50">
                        <span className="loading loading-spinner loading-md mb-2" />
                        <p>Loading...</p>
                    </div>
                ) : error ? (
                    <ErrorState error={error} onRefresh={refresh} />
                ) : data.length === 0 ? (
                    <div className="p-8 text-center text-base-content/30">
                        <i className="fa-duotone fa-inbox text-4xl mb-4 opacity-40" />
                        <p>No items found</p>
                        {searchInput && (
                            <button
                                onClick={() => setSearchInput("")}
                                className="btn btn-sm btn-ghost mt-2"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* List Items */}
                        <div>
                            {data.map((item) =>
                                renderListItem(
                                    item,
                                    selectedId === item.id,
                                    onSelect,
                                ),
                            )}
                        </div>

                        {/* Loading indicator for additional pages */}
                        {loading && data.length > 0 && (
                            <div className="p-4 text-center">
                                <span className="loading loading-spinner loading-sm" />
                            </div>
                        )}

                        {/* Pagination */}
                        <PaginationControls
                            pagination={pagination}
                            onPageChange={goToPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

// Export a factory function that domains can use to create their browse list panels
export function createBrowseListPanel<
    T extends BrowseListItem,
    F extends BrowseFilters,
>(
    useStandardListHook: (config: {
        fetchFn: (
            params: StandardListParams & F,
        ) => Promise<StandardListResponse<T>>;
        defaultFilters: F;
        defaultSortBy: string;
        defaultSortOrder: "asc" | "desc";
    }) => UseStandardListHook<T, F>,
) {
    return function DomainBrowseListPanel(props: BrowseListPanelProps<T, F>) {
        return (
            <BrowseListPanel {...props} useStandardList={useStandardListHook} />
        );
    };
}
