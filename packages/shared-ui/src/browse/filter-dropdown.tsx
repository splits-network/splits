/**
 * BrowseFilterDropdown - Reusable filter dropdown component
 * Provides consistent filter UI pattern
 */

"use client";

import { useCallback, ReactNode } from "react";
import type { BrowseFilterDropdownProps, BrowseFilters } from "./types";

export function BrowseFilterDropdown<F extends BrowseFilters>({
    filters,
    onChange,
    preserveFilters = [],
    children,
}: BrowseFilterDropdownProps<F>) {
    const handleReset = useCallback(() => {
        const resetFilters = {} as F;

        // Preserve specified filters
        preserveFilters.forEach((key) => {
            if (filters[key] !== undefined) {
                resetFilters[key] = filters[key];
            }
        });

        onChange(resetFilters);
    }, [filters, onChange, preserveFilters]);

    return (
        <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                className="btn btn-square btn-ghost text-base-content/70 hover:text-primary hover:bg-primary/10"
                title="Filter"
            >
                <i className="fa-duotone fa-filter text-lg" />
            </div>
            <div
                tabIndex={0}
                className="dropdown-content menu p-4 shadow-lg bg-base-100 rounded-box w-80 z-[50] border border-base-200 gap-4"
            >
                <div className="flex justify-between items-center pb-2 border-b border-base-200">
                    <span className="font-semibold">Filters</span>
                    <button
                        onClick={handleReset}
                        className="text-xs text-base-content/60 hover:text-primary"
                    >
                        Reset
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}
