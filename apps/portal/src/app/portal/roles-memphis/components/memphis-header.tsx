"use client";

import { useCallback, useState } from "react";
import {
    Badge,
    BadgeTabs,
    Button,
    Select,
    GeometricDecoration,
} from "@splits-network/memphis-ui";
import type { BadgeTab } from "@splits-network/memphis-ui";
import { UnifiedJobFilters } from "../../roles/types";
import RoleWizardModal from "../../roles/components/modals/role-wizard-modal";

interface MemphisHeaderProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    filters: UnifiedJobFilters;
    setFilter: <K extends keyof UnifiedJobFilters>(
        key: K,
        value: UnifiedJobFilters[K],
    ) => void;
    loading: boolean;
    canCreateRole: boolean;
    showJobAssignmentFilter: boolean;
    refresh: () => Promise<void>;
    viewMode: string;
    onViewChange: (mode: string) => void;
    total: number;
    activeCount: number;
    pausedCount: number;
    filledCount: number;
}

const STATUS_OPTIONS = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "filled", label: "Filled" },
    { value: "closed", label: "Closed" },
];

const VIEW_TABS: BadgeTab[] = [
    { key: "grid", icon: "fa-duotone fa-regular fa-grid-2", label: "Grid" },
    { key: "table", icon: "fa-duotone fa-regular fa-table-list", label: "Table" },
    { key: "browse", icon: "fa-duotone fa-regular fa-table-columns", label: "Browse" },
];

const STAT_BORDER: Record<string, string> = {
    coral: "border-coral",
    teal: "border-teal",
    yellow: "border-yellow",
    purple: "border-purple",
};

const STAT_TEXT: Record<string, string> = {
    coral: "text-coral",
    teal: "text-teal",
    yellow: "text-yellow",
    purple: "text-purple",
};

export function MemphisHeader({
    searchInput,
    setSearchInput,
    clearSearch,
    filters,
    setFilter,
    loading,
    canCreateRole,
    showJobAssignmentFilter,
    refresh,
    viewMode,
    onViewChange,
    total,
    activeCount,
    pausedCount,
    filledCount,
}: MemphisHeaderProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const activeStatus = filters.status || "all";

    const handleStatusChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setFilter(
                "status",
                e.target.value === "all" ? undefined : e.target.value,
            );
        },
        [setFilter],
    );

    const handleReset = useCallback(() => {
        setFilter("status", undefined);
        setFilter("employment_type", undefined);
        setFilter("is_remote", undefined);
        setFilter("commute_type", undefined);
        setFilter("job_level", undefined);
    }, [setFilter]);

    const activeFilterCount = [
        filters.employment_type,
        filters.is_remote,
        filters.commute_type,
        filters.job_level,
    ].filter(Boolean).length;

    const STATS = [
        { label: "Total Roles", value: total, color: "coral" },
        { label: "Active", value: activeCount, color: "teal" },
        { label: "Paused", value: pausedCount, color: "yellow" },
        { label: "Filled", value: filledCount, color: "purple" },
    ];

    return (
        <>
            {/* ═══════════════════════════════════════════════════════════
                HERO HEADER – Dark Memphis style
               ═══════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden py-10 bg-dark mb-6 -mx-2 -mt-2">
                {/* Memphis background shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <GeometricDecoration
                        shape="circle"
                        color="coral"
                        size={80}
                        className="absolute top-[8%] left-[4%] opacity-20"
                    />
                    <GeometricDecoration
                        shape="circle"
                        color="teal"
                        size={64}
                        className="absolute top-[50%] right-[6%] opacity-30"
                    />
                    <GeometricDecoration
                        shape="circle"
                        color="yellow"
                        size={40}
                        className="absolute bottom-[10%] left-[12%] opacity-25"
                    />
                    <GeometricDecoration
                        shape="square"
                        color="purple"
                        size={56}
                        className="absolute top-[20%] right-[18%] rotate-12 opacity-20"
                    />
                    <GeometricDecoration
                        shape="square"
                        color="coral"
                        size={40}
                        className="absolute top-[40%] left-[22%] rotate-45 opacity-15"
                    />
                </div>

                <div className="relative z-10 px-6">
                    {/* Badge */}
                    <div className="mb-4">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] bg-coral text-white">
                            <i className="fa-duotone fa-regular fa-briefcase" />
                            Job Listings
                        </span>
                    </div>

                    {/* Title + Add Role */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-cream leading-tight mb-2">
                                Browse{" "}
                                <span className="relative inline-block">
                                    <span className="text-coral">Roles</span>
                                    <span className="absolute -bottom-1 left-0 w-full h-1.5 bg-coral" />
                                </span>
                            </h1>
                            <p className="text-sm text-cream/60 font-semibold uppercase tracking-wide">
                                Explore opportunities &bull; Split-fee
                                recruiting, made transparent
                            </p>
                        </div>

                        {canCreateRole && (
                            <Button
                                variant="coral"
                                size="md"
                                onClick={() => setShowAddModal(true)}
                            >
                                <i className="fa-duotone fa-regular fa-plus mr-2" />
                                Add Role
                            </Button>
                        )}
                    </div>

                    {/* Stats pills */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        {STATS.map((stat) => (
                            <div
                                key={stat.label}
                                className={`flex items-center gap-2 px-4 py-2 border-2 ${STAT_BORDER[stat.color]}`}
                            >
                                <span
                                    className={`text-lg font-black ${STAT_TEXT[stat.color]}`}
                                >
                                    {stat.value}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-cream/50">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                CONTROLS BAR – Unified search + filters + view toggles
               ═══════════════════════════════════════════════════════════ */}
            <div className="border-memphis border-dark bg-white mb-6">
                {/* Main controls row */}
                <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 border-2 border-dark/30">
                        <i className="fa-duotone fa-regular fa-magnifying-glass text-sm text-coral" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search roles by title, company, or location..."
                            className="flex-1 bg-transparent outline-none text-sm font-semibold text-dark placeholder:text-dark/30"
                        />
                        {searchInput && (
                            <button
                                onClick={clearSearch}
                                className="text-xs font-bold uppercase text-coral"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Status filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-dark/50">
                            Status:
                        </span>
                        <select
                            value={activeStatus}
                            onChange={handleStatusChange}
                            className="memphis-select text-xs font-black uppercase tracking-wider"
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Advanced filters toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`memphis-btn memphis-btn-sm ${
                            showFilters
                                ? "btn-dark"
                                : "memphis-btn-outline btn-dark"
                        }`}
                    >
                        <i className="fa-duotone fa-sliders" />
                        Filters
                        {activeFilterCount > 0 && (
                            <Badge variant="coral">{activeFilterCount}</Badge>
                        )}
                    </button>

                    {activeFilterCount > 0 && (
                        <button
                            onClick={handleReset}
                            className="text-xs font-black uppercase text-coral tracking-wider"
                        >
                            Reset
                        </button>
                    )}

                    {/* View mode toggles */}
                    <BadgeTabs
                        tabs={VIEW_TABS}
                        activeKey={viewMode}
                        onChange={onViewChange}
                        stretch={false}
                        activeTextColor="var(--color-yellow)"
                    />
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="px-4 pb-4 pt-4 border-t-2 border-dark/10 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Select
                            label="Employment Type"
                            options={[
                                { value: "", label: "All Types" },
                                { value: "fulltime", label: "Full-time" },
                                { value: "contract", label: "Contract" },
                                { value: "parttime", label: "Part-time" },
                                { value: "freelance", label: "Freelance" },
                            ]}
                            value={filters.employment_type || ""}
                            onChange={(e) =>
                                setFilter(
                                    "employment_type",
                                    e.target.value || undefined,
                                )
                            }
                        />
                        <Select
                            label="Commute Type"
                            options={[
                                { value: "", label: "All Commute Types" },
                                { value: "remote", label: "Remote" },
                                { value: "hybrid_1", label: "Hybrid (1 day)" },
                                { value: "hybrid_2", label: "Hybrid (2 days)" },
                                { value: "hybrid_3", label: "Hybrid (3 days)" },
                                { value: "hybrid_4", label: "Hybrid (4 days)" },
                                { value: "in_office", label: "In Office" },
                            ]}
                            value={filters.commute_type || ""}
                            onChange={(e) =>
                                setFilter(
                                    "commute_type",
                                    e.target.value || undefined,
                                )
                            }
                        />
                        <Select
                            label="Job Level"
                            options={[
                                { value: "", label: "All Levels" },
                                { value: "entry", label: "Entry Level" },
                                { value: "mid", label: "Mid Level" },
                                { value: "senior", label: "Senior" },
                                { value: "lead", label: "Lead" },
                                { value: "manager", label: "Manager" },
                                { value: "director", label: "Director" },
                                { value: "vp", label: "VP" },
                                { value: "c_suite", label: "C-Suite" },
                            ]}
                            value={filters.job_level || ""}
                            onChange={(e) =>
                                setFilter(
                                    "job_level",
                                    e.target.value || undefined,
                                )
                            }
                        />
                        {showJobAssignmentFilter && (
                            <Select
                                label="Job Assignment"
                                options={[
                                    { value: "all", label: "All Jobs" },
                                    {
                                        value: "assigned",
                                        label: "My Assigned Jobs",
                                    },
                                ]}
                                value={filters.job_owner_filter || "all"}
                                onChange={(e) =>
                                    setFilter(
                                        "job_owner_filter",
                                        e.target.value as "all" | "assigned",
                                    )
                                }
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Add Role Modal */}
            {showAddModal && (
                <RoleWizardModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        refresh();
                    }}
                />
            )}
        </>
    );
}
