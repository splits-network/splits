/**
 * Hook factory for integrating domain-specific useStandardList hooks
 * with the shared browse components
 */

"use client";

import { useCallback, ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    StandardListParams,
    StandardListResponse,
} from "@splits-network/shared-types";
import { BrowseLayout } from "./browse-layout";
import { BrowseDetailPanel } from "./detail-panel";
import { createBrowseListPanel } from "./list-panel";
import type { BrowseProps, BrowseListItem, BrowseFilters } from "./types";

/**
 * Standard interface that domain useStandardList hooks should match
 */
export interface UseStandardListResult<T, F> {
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

export interface UseStandardListConfig<T, F> {
    fetchFn: (
        params: StandardListParams & F,
    ) => Promise<StandardListResponse<T>>;
    defaultFilters: F;
    defaultSortBy: string;
    defaultSortOrder: "asc" | "desc";
}

/**
 * Factory to create domain-specific browse components using existing useStandardList hook
 *
 * Usage:
 * ```tsx
 * // In your domain (e.g., portal/roles)
 * import { useStandardList } from "@/hooks/use-standard-list";
 * import { createBrowseComponents } from "@splits-network/shared-ui";
 *
 * const { BrowseClient: RolesBrowseClient } = createBrowseComponents(useStandardList);
 * ```
 */
export function createBrowseComponents<
    T extends BrowseListItem,
    F extends BrowseFilters,
>(
    useStandardList: (
        config: UseStandardListConfig<T, F>,
    ) => UseStandardListResult<T, F>,
) {
    // Create the domain-specific ListPanel
    const DomainListPanel = createBrowseListPanel(useStandardList);

    // Create the domain-specific BrowseClient
    function DomainBrowseClient({
        fetchFn,
        renderListItem,
        renderDetail,
        defaultFilters,
        defaultSortBy = "created_at",
        defaultSortOrder = "desc",
        urlParamName = "id",
        searchPlaceholder = "Search...",
        emptyStateIcon = "fa-inbox",
        emptyStateMessage = "No items found",
        listPanelWidth = "w-full md:w-96 lg:w-[420px]",
        tabs,
        defaultActiveTab,
        renderFilters,
        actions,
        listHeader,
    }: BrowseProps<T, F>) {
        const router = useRouter();
        const pathname = usePathname();
        const searchParams = useSearchParams();

        // ID from URL is our source of truth for selection
        const selectedId = searchParams.get(urlParamName);

        const handleSelect = useCallback(
            (id: string) => {
                const params = new URLSearchParams(searchParams);
                params.set(urlParamName, id);
                router.push(`${pathname}?${params.toString()}`);
            },
            [pathname, router, searchParams, urlParamName],
        );

        const handleClose = useCallback(() => {
            const params = new URLSearchParams(searchParams);
            params.delete(urlParamName);
            router.push(`${pathname}?${params.toString()}`);
        }, [pathname, router, searchParams, urlParamName]);

        return (
            <BrowseLayout>
                <DomainListPanel
                    selectedId={selectedId}
                    onSelect={handleSelect}
                    fetchFn={fetchFn}
                    renderListItem={renderListItem}
                    renderFilters={renderFilters}
                    defaultFilters={defaultFilters}
                    defaultSortBy={defaultSortBy}
                    defaultSortOrder={defaultSortOrder}
                    searchPlaceholder={searchPlaceholder}
                    listHeader={listHeader}
                    actions={actions}
                    tabs={tabs}
                    defaultActiveTab={defaultActiveTab}
                    className={`
                        flex flex-col border-r border-base-300 bg-base-200
                        ${listPanelWidth}
                        ${selectedId ? "hidden md:flex" : "flex"} 
                    `}
                />

                <div
                    className={`
                        flex-1 flex-col bg-base-100 min-w-0
                        ${
                            selectedId
                                ? "fixed inset-0 z-50 flex md:static md:z-auto"
                                : "hidden md:flex"
                        }
                    `}
                >
                    <BrowseDetailPanel
                        id={selectedId}
                        onClose={handleClose}
                        emptyIcon={emptyStateIcon}
                        emptyMessage={emptyStateMessage}
                    >
                        {renderDetail(selectedId, handleClose)}
                    </BrowseDetailPanel>
                </div>
            </BrowseLayout>
        );
    }

    return {
        BrowseClient: DomainBrowseClient,
        ListPanel: DomainListPanel,
    };
}

/**
 * Helper to create filter components that work with BrowseFilterDropdown
 */
export function createFilterField<F extends BrowseFilters>() {
    return {
        Select: ({
            label,
            value,
            options,
            onChange,
            placeholder = "Select...",
        }: {
            label: string;
            value: any;
            options: { label: string; value: any }[];
            onChange: (value: any) => void;
            placeholder?: string;
        }) => (
            <fieldset className="fieldset">
                <legend className="fieldset-legend">{label}</legend>
                <select
                    className="select w-full"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value || undefined)}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </fieldset>
        ),

        Toggle: ({
            label,
            checked,
            onChange,
        }: {
            label: string;
            checked: boolean;
            onChange: (checked: boolean) => void;
        }) => (
            <label className="label cursor-pointer justify-start gap-3">
                <input
                    type="checkbox"
                    className="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <span className="label-text">{label}</span>
            </label>
        ),

        Input: ({
            label,
            value,
            onChange,
            placeholder,
            type = "text",
        }: {
            label: string;
            value: string;
            onChange: (value: string) => void;
            placeholder?: string;
            type?: string;
        }) => (
            <fieldset className="fieldset">
                <legend className="fieldset-legend">{label}</legend>
                <input
                    type={type}
                    className="input w-full"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            </fieldset>
        ),
    };
}
