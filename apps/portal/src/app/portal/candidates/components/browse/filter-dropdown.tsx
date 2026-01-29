"use client";

import { useCallback, useRef } from "react";
import { CandidateFilters } from "./types";

interface FilterDropdownProps {
    filters: CandidateFilters;
    onChange: (filters: CandidateFilters) => void;
}

export default function FilterDropdown({
    filters,
    onChange,
}: FilterDropdownProps) {
    // We use a ref to close the dropdown programmatically if needed,
    // though DaisyUI dropdowns usually close on click outside.
    // For applying filters, we might want to keep it open until user clicks away or "Apply".
    // Or we can simple define it as reactive.

    const handleChange = useCallback(
        (key: keyof CandidateFilters, value: any) => {
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
                title="Filter Candidates"
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
                            checked={!!filters.open_to_remote}
                            onChange={(e) =>
                                handleChange("open_to_remote", e.target.checked)
                            }
                        />
                        <span className="text-sm">Open to Remote</span>
                    </label>
                </fieldset>

                {/* Job Type */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Job Type</legend>
                    <select
                        className="select select-sm select-bordered w-full"
                        value={filters.desired_job_type || ""}
                        onChange={(e) =>
                            handleChange(
                                "desired_job_type",
                                e.target.value || undefined,
                            )
                        }
                    >
                        <option value="">Any</option>
                        <option value="full_time">Full Time</option>
                        <option value="contract">Contract</option>
                        <option value="freelance">Freelance</option>
                        <option value="part_time">Part Time</option>
                    </select>
                </fieldset>

                {/* Verification Status */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Verification</legend>
                    <select
                        className="select select-sm select-bordered w-full"
                        value={filters.verification_status || ""}
                        onChange={(e) =>
                            handleChange(
                                "verification_status",
                                e.target.value || undefined,
                            )
                        }
                    >
                        <option value="">Any</option>
                        <option value="verified">Verified</option>
                        <option value="pending">Pending</option>
                        <option value="unverified">Unverified</option>
                    </select>
                </fieldset>
            </div>
        </div>
    );
}
