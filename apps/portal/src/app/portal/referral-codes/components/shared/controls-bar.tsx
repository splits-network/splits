"use client";

import type { ReferralCodeFilters } from "../../types";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: ReferralCodeFilters;
    onFilterChange: <K extends keyof ReferralCodeFilters>(
        key: K,
        value: ReferralCodeFilters[K],
    ) => void;
    onCreateCode: () => void;
    codeCount: number;
    totalCount: number;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    onCreateCode,
    codeCount,
    totalCount,
}: ControlsBarProps) {
    return (
        <section className="controls-bar sticky top-0 z-30 bg-base-100 border-b-2 border-base-300 opacity-0">
            <div className="container mx-auto px-6 lg:px-12 py-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Search + Filters */}
                    <div className="flex flex-wrap gap-3 items-center flex-1">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <i className="fa-duotone fa-regular fa-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm" />
                            <input
                                type="text"
                                placeholder="Search by code or label..."
                                value={searchInput}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="input input-bordered w-full pl-9 bg-base-200 border-base-300 text-sm font-medium focus:border-primary focus:outline-none"
                                style={{ borderRadius: 0 }}
                            />
                        </div>

                        {/* Status filter */}
                        <select
                            value={filters.status || ""}
                            onChange={(e) =>
                                onFilterChange(
                                    "status",
                                    e.target.value || undefined,
                                )
                            }
                            className="select select-bordered select-sm bg-base-200 border-base-300 text-xs uppercase tracking-wider font-bold"
                            style={{ borderRadius: 0 }}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        {/* Create Code */}
                        <button
                            onClick={onCreateCode}
                            className="btn btn-sm btn-primary gap-2"
                            style={{ borderRadius: 0 }}
                        >
                            <i className="fa-duotone fa-regular fa-plus" />
                            <span className="hidden sm:inline">
                                New Code
                            </span>
                        </button>
                    </div>

                    {/* Results count */}
                    <div className="flex items-center gap-4">
                        <span className="text-xs uppercase tracking-wider text-base-content/40 font-bold">
                            {codeCount} of {totalCount} codes
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
