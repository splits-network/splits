"use client";

import { useCallback } from "react";
import { JobFilters } from "./types";

interface FilterDropdownProps {
    filters: JobFilters;
    onChange: (filters: JobFilters) => void;
}

export default function FilterDropdown({
    filters,
    onChange,
}: FilterDropdownProps) {
    const handleChange = useCallback(
        (key: keyof JobFilters, value: any) => {
            onChange({
                ...filters,
                [key]: value,
            });
        },
        [filters, onChange],
    );

    const handleReset = () => {
        onChange({
            scope: filters.scope, // Preserve scope
        });
    };

    return (
        <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                className="btn btn-square btn-ghost text-base-content/70 hover:text-primary hover:bg-primary/10"
                title="Filter Roles"
            >
                <i className="fa-duotone fa-filter text-lg"></i>
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
                        Reset All
                    </button>
                </div>

                {/* Remote Policy */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Remote Policy</legend>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-primary"
                            checked={!!filters.is_remote}
                            onChange={(e) =>
                                handleChange("is_remote", e.target.checked)
                            }
                        />
                        <span className="text-sm">Remote Only</span>
                    </label>
                </fieldset>

                {/* Employment Type */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Employment Type</legend>
                    <select
                        className="select select-sm select-bordered w-full"
                        value={filters.employment_type || ""}
                        onChange={(e) =>
                            handleChange(
                                "employment_type",
                                e.target.value || undefined,
                            )
                        }
                    >
                        <option value="">Any</option>
                        <option value="full_time">Full Time</option>
                        <option value="contract">Contract</option>
                        <option value="temporary">Temporary</option>
                    </select>
                </fieldset>

                {/* Status */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Status</legend>
                    <select
                        className="select select-sm select-bordered w-full"
                        value={filters.status || ""}
                        onChange={(e) =>
                            handleChange("status", e.target.value || undefined)
                        }
                    >
                        <option value="">Any</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="closed">Closed</option>
                        <option value="filled">Filled</option>
                    </select>
                </fieldset>
            </div>
        </div>
    );
}
