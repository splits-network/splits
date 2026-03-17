"use client";

import type { CallFilters, CallTag } from "../../types";
import { CALL_STATUS_LABELS, CALL_TYPE_LABELS } from "../../types";

interface CallFilterDropdownsProps {
    filters: CallFilters;
    onFilterChange: <K extends keyof CallFilters>(
        key: K,
        value: CallFilters[K],
    ) => void;
    tags: CallTag[];
}

export function CallFilterDropdowns({
    filters,
    onFilterChange,
    tags,
}: CallFilterDropdownsProps) {
    return (
        <>
            <select
                value={filters.call_type || ""}
                onChange={(e) =>
                    onFilterChange("call_type", e.target.value || undefined)
                }
                className="select uppercase rounded-none"
            >
                <option value="">All Types</option>
                {Object.entries(CALL_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>

            <select
                value={filters.status || ""}
                onChange={(e) =>
                    onFilterChange("status", e.target.value || undefined)
                }
                className="select uppercase rounded-none"
            >
                <option value="">All Status</option>
                {Object.entries(CALL_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>

            {tags.length > 0 && (
                <select
                    value={filters.tag || ""}
                    onChange={(e) =>
                        onFilterChange("tag", e.target.value || undefined)
                    }
                    className="select uppercase rounded-none"
                >
                    <option value="">All Tags</option>
                    {tags.map((tag) => (
                        <option key={tag.slug} value={tag.slug}>
                            {tag.label}
                        </option>
                    ))}
                </select>
            )}

            <select
                value={
                    filters.needs_follow_up === undefined
                        ? ""
                        : filters.needs_follow_up
                          ? "true"
                          : "false"
                }
                onChange={(e) => {
                    const val = e.target.value;
                    onFilterChange(
                        "needs_follow_up",
                        val === "" ? undefined : val === "true",
                    );
                }}
                className="select uppercase rounded-none"
            >
                <option value="">Follow-up</option>
                <option value="true">Needs Follow-up</option>
                <option value="false">No Follow-up</option>
            </select>

            <input
                type="date"
                value={filters.date_from || ""}
                onChange={(e) =>
                    onFilterChange("date_from", e.target.value || undefined)
                }
                className="input rounded-none"
                placeholder="From date"
                title="From date"
            />

            <input
                type="date"
                value={filters.date_to || ""}
                onChange={(e) =>
                    onFilterChange("date_to", e.target.value || undefined)
                }
                className="input rounded-none"
                placeholder="To date"
                title="To date"
            />
        </>
    );
}
