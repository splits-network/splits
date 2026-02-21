"use client";

import { useState } from "react";
import type { SearchFilters, SearchableEntityType } from "@/types/search";
import {
    JOB_LEVELS,
    EMPLOYMENT_TYPES,
    COMMUTE_TYPES,
    JOB_STATUSES,
    DESIRED_JOB_TYPES,
    AVAILABILITY_OPTIONS,
    COMPANY_SIZES,
} from "@/types/search";

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface SearchFilterPanelProps {
    filters: SearchFilters;
    setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
    removeFilter: (key: keyof SearchFilters) => void;
    clearAllFilters: () => void;
    activeFilterCount: number;
    selectedEntityTypes: SearchableEntityType[];
}

/* ─── Primitives ─────────────────────────────────────────────────────────── */

function FilterSection({
    title,
    icon,
    children,
    defaultOpen = true,
}: {
    title: string;
    icon: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-base-300 pb-4">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full text-left mb-2"
            >
                <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/50 flex items-center gap-2">
                    <i className={`fa-duotone fa-regular ${icon} text-sm`} />
                    {title}
                </h4>
                <i
                    className={`fa-solid fa-chevron-down text-[10px] text-base-content/30 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>
            {open && <div className="space-y-1">{children}</div>}
        </div>
    );
}

function FilterCheckboxGroup({
    options,
    value,
    onChange,
}: {
    options: readonly { value: string; label: string }[];
    value: string | undefined;
    onChange: (val: string | undefined) => void;
}) {
    return (
        <div className="space-y-0.5">
            {options.map((opt) => (
                <label
                    key={opt.value}
                    className={`flex items-center gap-2 px-2 py-1 cursor-pointer text-sm transition-colors ${
                        value === opt.value
                            ? "bg-primary/5 text-base-content font-semibold"
                            : "text-base-content/60 hover:bg-base-200"
                    }`}
                >
                    <input
                        type="checkbox"
                        checked={value === opt.value}
                        onChange={() =>
                            onChange(value === opt.value ? undefined : opt.value)
                        }
                        className="checkbox checkbox-primary checkbox-xs"
                    />
                    {opt.label}
                </label>
            ))}
        </div>
    );
}

function FilterMultiCheckboxGroup({
    options,
    values,
    onChange,
}: {
    options: readonly { value: string; label: string }[];
    values: string[];
    onChange: (vals: string[]) => void;
}) {
    return (
        <div className="space-y-0.5">
            {options.map((opt) => {
                const checked = values.includes(opt.value);
                return (
                    <label
                        key={opt.value}
                        className={`flex items-center gap-2 px-2 py-1 cursor-pointer text-sm transition-colors ${
                            checked
                                ? "bg-primary/5 text-base-content font-semibold"
                                : "text-base-content/60 hover:bg-base-200"
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                                const next = checked
                                    ? values.filter((v) => v !== opt.value)
                                    : [...values, opt.value];
                                onChange(next);
                            }}
                            className="checkbox checkbox-primary checkbox-xs"
                        />
                        {opt.label}
                    </label>
                );
            })}
        </div>
    );
}

function FilterToggle({
    label,
    value,
    onChange,
}: {
    label: string;
    value: boolean | undefined;
    onChange: (val: boolean | undefined) => void;
}) {
    return (
        <label className="flex items-center justify-between px-2 py-1.5 cursor-pointer text-sm">
            <span className={value ? "text-base-content font-semibold" : "text-base-content/60"}>
                {label}
            </span>
            <input
                type="checkbox"
                checked={value === true}
                onChange={() => onChange(value === true ? undefined : true)}
                className="toggle toggle-primary toggle-sm"
            />
        </label>
    );
}

function FilterSalaryRange({
    minValue,
    maxValue,
    onMinChange,
    onMaxChange,
}: {
    minValue: number | undefined;
    maxValue: number | undefined;
    onMinChange: (val: number | undefined) => void;
    onMaxChange: (val: number | undefined) => void;
}) {
    const formatDisplay = (val: number | undefined) => {
        if (val === undefined) return "";
        return val.toLocaleString();
    };

    return (
        <div className="flex items-center gap-2 px-2">
            <div className="flex-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40 mb-0.5 block">
                    Min
                </label>
                <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-base-content/30">$</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={formatDisplay(minValue)}
                        onChange={(e) => {
                            const num = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                            onMinChange(isNaN(num) ? undefined : num);
                        }}
                        placeholder="0"
                        className="input input-sm w-full pl-6 bg-base-200 border-base-300 text-sm"
                    />
                </div>
            </div>
            <span className="text-base-content/30 mt-4">-</span>
            <div className="flex-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40 mb-0.5 block">
                    Max
                </label>
                <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-base-content/30">$</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={formatDisplay(maxValue)}
                        onChange={(e) => {
                            const num = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                            onMaxChange(isNaN(num) ? undefined : num);
                        }}
                        placeholder="Any"
                        className="input input-sm w-full pl-6 bg-base-200 border-base-300 text-sm"
                    />
                </div>
            </div>
        </div>
    );
}

function FilterSelect({
    options,
    value,
    onChange,
    placeholder = "Any",
}: {
    options: readonly { value: string; label: string }[];
    value: string | undefined;
    onChange: (val: string | undefined) => void;
    placeholder?: string;
}) {
    return (
        <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="select select-sm w-full bg-base-200 border-base-300 text-sm"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

/* ─── Main Panel ─────────────────────────────────────────────────────────── */

export function SearchFilterPanel({
    filters,
    setFilter,
    removeFilter,
    clearAllFilters,
    activeFilterCount,
    selectedEntityTypes,
}: SearchFilterPanelProps) {
    // Determine which sections to show
    const noFilter = selectedEntityTypes.length === 0;
    const showJobs = noFilter || selectedEntityTypes.includes("job");
    const showCandidates = noFilter || selectedEntityTypes.includes("candidate");
    const showCompanies = noFilter || selectedEntityTypes.includes("company");

    const hasAny = showJobs || showCandidates || showCompanies;

    if (!hasAny) return null;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40">
                    Field Filters
                </h3>
                {activeFilterCount > 0 && (
                    <button
                        onClick={clearAllFilters}
                        className="text-xs text-error font-semibold hover:underline"
                    >
                        Clear ({activeFilterCount})
                    </button>
                )}
            </div>

            {/* ── Jobs ───────────────────────────────────────────── */}
            {showJobs && (
                <>
                    <FilterSection title="Jobs" icon="fa-briefcase">
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                                    Employment Type
                                </p>
                                <FilterCheckboxGroup
                                    options={EMPLOYMENT_TYPES}
                                    value={filters.employment_type}
                                    onChange={(val) =>
                                        val
                                            ? setFilter("employment_type", val)
                                            : removeFilter("employment_type")
                                    }
                                />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                                    Job Level
                                </p>
                                <FilterCheckboxGroup
                                    options={JOB_LEVELS}
                                    value={filters.job_level}
                                    onChange={(val) =>
                                        val
                                            ? setFilter("job_level", val)
                                            : removeFilter("job_level")
                                    }
                                />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                                    Commute Type
                                </p>
                                <FilterMultiCheckboxGroup
                                    options={COMMUTE_TYPES}
                                    values={filters.commute_types ?? []}
                                    onChange={(vals) =>
                                        vals.length > 0
                                            ? setFilter("commute_types", vals)
                                            : removeFilter("commute_types")
                                    }
                                />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                                    Salary Range
                                </p>
                                <FilterSalaryRange
                                    minValue={filters.salary_min}
                                    maxValue={filters.salary_max}
                                    onMinChange={(val) =>
                                        val !== undefined
                                            ? setFilter("salary_min", val)
                                            : removeFilter("salary_min")
                                    }
                                    onMaxChange={(val) =>
                                        val !== undefined
                                            ? setFilter("salary_max", val)
                                            : removeFilter("salary_max")
                                    }
                                />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                                    Status
                                </p>
                                <FilterSelect
                                    options={JOB_STATUSES}
                                    value={filters.job_status}
                                    onChange={(val) =>
                                        val
                                            ? setFilter("job_status", val)
                                            : removeFilter("job_status")
                                    }
                                />
                            </div>

                            <FilterToggle
                                label="Open to Relocation"
                                value={filters.open_to_relocation}
                                onChange={(val) =>
                                    val !== undefined
                                        ? setFilter("open_to_relocation", val)
                                        : removeFilter("open_to_relocation")
                                }
                            />
                        </div>
                    </FilterSection>
                </>
            )}

            {/* ── Candidates ─────────────────────────────────────── */}
            {showCandidates && (
                <FilterSection title="Candidates" icon="fa-user">
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                                Desired Job Type
                            </p>
                            <FilterCheckboxGroup
                                options={DESIRED_JOB_TYPES}
                                value={filters.desired_job_type}
                                onChange={(val) =>
                                    val
                                        ? setFilter("desired_job_type", val)
                                        : removeFilter("desired_job_type")
                                }
                            />
                        </div>

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                                Availability
                            </p>
                            <FilterSelect
                                options={AVAILABILITY_OPTIONS}
                                value={filters.availability}
                                onChange={(val) =>
                                    val
                                        ? setFilter("availability", val)
                                        : removeFilter("availability")
                                }
                            />
                        </div>

                        <FilterToggle
                            label="Open to Remote"
                            value={filters.open_to_remote}
                            onChange={(val) =>
                                val !== undefined
                                    ? setFilter("open_to_remote", val)
                                    : removeFilter("open_to_remote")
                            }
                        />

                        <FilterToggle
                            label="Open to Relocation"
                            value={filters.open_to_relocation}
                            onChange={(val) =>
                                val !== undefined
                                    ? setFilter("open_to_relocation", val)
                                    : removeFilter("open_to_relocation")
                            }
                        />
                    </div>
                </FilterSection>
            )}

            {/* ── Companies ──────────────────────────────────────── */}
            {showCompanies && (
                <FilterSection title="Companies" icon="fa-building">
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                                Industry
                            </p>
                            <input
                                type="text"
                                value={filters.industry ?? ""}
                                onChange={(e) =>
                                    e.target.value
                                        ? setFilter("industry", e.target.value)
                                        : removeFilter("industry")
                                }
                                placeholder="e.g. Technology, Finance..."
                                className="input input-sm w-full bg-base-200 border-base-300 text-sm"
                            />
                        </div>

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                                Company Size
                            </p>
                            <FilterSelect
                                options={COMPANY_SIZES}
                                value={filters.company_size}
                                onChange={(val) =>
                                    val
                                        ? setFilter("company_size", val)
                                        : removeFilter("company_size")
                                }
                            />
                        </div>
                    </div>
                </FilterSection>
            )}
        </div>
    );
}
