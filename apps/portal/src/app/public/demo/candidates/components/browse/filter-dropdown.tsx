"use client";

import { useState } from "react";

interface FilterDropdownProps {
    filters: Record<string, any>;
    onFiltersChange: (filters: Record<string, any>) => void;
}

export function FilterDropdown({
    filters,
    onFiltersChange,
}: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const statusOptions = [
        { value: "", label: "All Statuses" },
        { value: "active", label: "Active" },
        { value: "placed", label: "Placed" },
        { value: "inactive", label: "Inactive" },
    ];

    const verificationOptions = [
        { value: "", label: "All Candidates" },
        { value: "verified", label: "Verified Only" },
        { value: "unverified", label: "Unverified Only" },
    ];

    const clearFilters = () => {
        onFiltersChange({});
        setIsOpen(false);
    };

    const hasActiveFilters = Object.keys(filters).some(
        (key) => filters[key] !== "" && filters[key] !== undefined,
    );

    return (
        <div className="dropdown dropdown-end">
            <button
                tabIndex={0}
                role="button"
                className={`btn btn-sm ${hasActiveFilters ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <i className="fa-duotone fa-regular fa-filter text-sm"></i>
                Filter
                {hasActiveFilters && (
                    <span className="badge badge-xs badge-neutral">
                        {
                            Object.values(filters).filter(
                                (v) => v !== "" && v !== undefined,
                            ).length
                        }
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="dropdown-content z-[1] menu p-4 shadow bg-base-100 rounded-box w-64 border border-base-200">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">Filters</h3>
                            {hasActiveFilters && (
                                <button
                                    className="btn btn-xs btn-ghost"
                                    onClick={clearFilters}
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Status Filter */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Status</legend>
                            <select
                                className="select select-sm w-full"
                                value={filters.status || ""}
                                onChange={(e) =>
                                    onFiltersChange({
                                        ...filters,
                                        status: e.target.value,
                                    })
                                }
                            >
                                {statusOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </fieldset>

                        {/* Verification Filter */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Verification
                            </legend>
                            <select
                                className="select select-sm w-full"
                                value={filters.verified || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const verified =
                                        value === ""
                                            ? undefined
                                            : value === "verified";
                                    onFiltersChange({ ...filters, verified });
                                }}
                            >
                                {verificationOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </fieldset>

                        {/* Location Filter */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Location
                            </legend>
                            <input
                                type="text"
                                className="input input-sm w-full"
                                placeholder="Filter by location..."
                                value={filters.location || ""}
                                onChange={(e) =>
                                    onFiltersChange({
                                        ...filters,
                                        location: e.target.value,
                                    })
                                }
                            />
                        </fieldset>

                        {/* Current Role Filter */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Current Role
                            </legend>
                            <input
                                type="text"
                                className="input input-sm w-full"
                                placeholder="Filter by role..."
                                value={filters.current_role || ""}
                                onChange={(e) =>
                                    onFiltersChange({
                                        ...filters,
                                        current_role: e.target.value,
                                    })
                                }
                            />
                        </fieldset>
                    </div>
                </div>
            )}
        </div>
    );
}
