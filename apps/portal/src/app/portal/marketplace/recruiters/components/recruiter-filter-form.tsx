"use client";

import { useState } from "react";

interface MarketplaceFilters {
    status?: string;
    marketplace_enabled?: boolean;
}

interface RecruiterFilterFormProps {
    filters: MarketplaceFilters;
    onFilterChange: <K extends keyof MarketplaceFilters>(
        key: K,
        value: MarketplaceFilters[K],
    ) => void;
}

export function RecruiterFilterForm({
    filters,
    onFilterChange,
}: RecruiterFilterFormProps) {
    const [isOpen, setIsOpen] = useState(false);

    const hasActiveFilters = filters.status && filters.status !== "active";

    return (
        <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                className={`btn btn-square ${hasActiveFilters ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Filter recruiters"
            >
                <i className="fa-duotone fa-regular fa-filter text-lg"></i>
                {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 badge badge-xs badge-secondary">
                        1
                    </span>
                )}
            </div>
            {isOpen && (
                <div
                    tabIndex={0}
                    className="dropdown-content z-50 card card-compact shadow-lg bg-base-100 w-64"
                >
                    <div className="card-body">
                        <h4 className="card-title text-sm">
                            <i className="fa-duotone fa-regular fa-filter mr-2"></i>
                            Filters
                        </h4>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-xs">Status</span>
                            </label>
                            <select
                                className="select select-bordered select-sm w-full"
                                value={filters.status || "active"}
                                onChange={(e) => onFilterChange("status", e.target.value)}
                            >
                                <option value="active">Active</option>
                                <option value="">All Statuses</option>
                            </select>
                        </div>

                        <div className="card-actions justify-end mt-2">
                            <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => {
                                    onFilterChange("status", "active");
                                    setIsOpen(false);
                                }}
                            >
                                Reset
                            </button>
                            <button
                                className="btn btn-primary btn-xs"
                                onClick={() => setIsOpen(false)}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
