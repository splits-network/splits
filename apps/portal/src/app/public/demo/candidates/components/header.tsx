"use client";

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filters: Record<string, any>;
    onFiltersChange: (filters: Record<string, any>) => void;
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSortChange: (field: string, order: "asc" | "desc") => void;
    selectedCount: number;
    totalCount: number;
    onAddNew: () => void;
}

export function Header({
    searchQuery,
    onSearchChange,
    filters,
    onFiltersChange,
    sortBy,
    sortOrder,
    onSortChange,
    selectedCount,
    totalCount,
    onAddNew,
}: HeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                        Search candidates
                    </legend>
                    <div className="relative">
                        <input
                            type="text"
                            className="input w-full pl-10"
                            placeholder="Search by name, email, or skills..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"></i>
                    </div>
                </fieldset>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Status Filter */}
                <select
                    className="select select-sm"
                    value={filters.status || ""}
                    onChange={(e) =>
                        onFiltersChange({
                            ...filters,
                            status: e.target.value || undefined,
                        })
                    }
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="passive">Passive</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="placed">Placed</option>
                </select>

                {/* Verification Filter */}
                <select
                    className="select select-sm"
                    value={filters.verification_status || ""}
                    onChange={(e) =>
                        onFiltersChange({
                            ...filters,
                            verification_status: e.target.value || undefined,
                        })
                    }
                >
                    <option value="">All Verification</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>

                {/* Sort */}
                <select
                    className="select select-sm"
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                        const [field, order] = e.target.value.split("-") as [
                            string,
                            "asc" | "desc",
                        ];
                        onSortChange(field, order);
                    }}
                >
                    <option value="created_at-desc">Newest First</option>
                    <option value="created_at-asc">Oldest First</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="experience_years-desc">
                        Most Experience
                    </option>
                    <option value="experience_years-asc">
                        Least Experience
                    </option>
                </select>

                {/* Clear Filters */}
                {(Object.keys(filters).length > 0 ||
                    sortBy !== "created_at" ||
                    sortOrder !== "desc") && (
                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => {
                            onFiltersChange({});
                            onSortChange("created_at", "desc");
                        }}
                    >
                        <i className="fa-duotone fa-regular fa-filter-circle-xmark"></i>
                        Clear
                    </button>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Selected count */}
                {selectedCount > 0 && (
                    <span className="text-sm text-base-content/70">
                        {selectedCount} of {totalCount} selected
                    </span>
                )}

                {/* Add button */}
                <button className="btn btn-primary" onClick={onAddNew}>
                    <i className="fa-duotone fa-regular fa-plus"></i>
                    Add Candidate
                </button>
            </div>
        </div>
    );
}
