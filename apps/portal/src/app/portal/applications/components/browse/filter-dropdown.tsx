"use client";

import { useCallback } from "react";
import { ApplicationFilters } from "./types";

interface FilterDropdownProps {
    filters: ApplicationFilters;
    onChange: (filters: ApplicationFilters) => void;
}

export default function FilterDropdown({
    filters,
    onChange,
}: FilterDropdownProps) {
    const handleChange = useCallback(
        (key: keyof ApplicationFilters, value: any) => {
            onChange({
                ...filters,
                [key]: value,
            });
        },
        [filters, onChange],
    );

    const handleReset = () => {
        onChange({});
    };

    return (
        <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                className="btn btn-square btn-ghost text-base-content/70 hover:text-primary hover:bg-primary/10"
                title="Filter Applications"
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

                {/* Stage */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Stage</legend>
                    <select
                        className="select select-sm select-bordered w-full"
                        value={filters.stage || ""}
                        onChange={(e) =>
                            handleChange("stage", e.target.value || undefined)
                        }
                    >
                        <option value="">All Stages</option>
                        <option value="submitted">Submitted</option>
                        <option value="screening">Screening</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer_stage">Offer Stage</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                        <option value="withdrawn">Withdrawn</option>
                    </select>
                </fieldset>

                {/* AI Score Filter */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">AI Fit Score</legend>
                    <select
                        className="select select-sm select-bordered w-full"
                        value={filters.ai_score_filter || ""}
                        onChange={(e) =>
                            handleChange(
                                "ai_score_filter",
                                e.target.value || undefined,
                            )
                        }
                    >
                        <option value="">Any Score</option>
                        <option value="excellent">Excellent (90%+)</option>
                        <option value="good">Good (70-89%)</option>
                        <option value="fair">Fair (50-69%)</option>
                        <option value="poor">Poor (&lt;50%)</option>
                    </select>
                </fieldset>

                {/* Company */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Company</legend>
                    <input
                        type="text"
                        className="input input-sm input-bordered w-full"
                        placeholder="Company name..."
                        value={filters.company_id || ""}
                        onChange={(e) =>
                            handleChange(
                                "company_id",
                                e.target.value || undefined,
                            )
                        }
                    />
                </fieldset>
            </div>
        </div>
    );
}
