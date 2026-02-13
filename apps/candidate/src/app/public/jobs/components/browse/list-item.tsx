"use client";

import { formatSalary, formatRelativeTime } from "@/lib/utils";
import {
    type Job,
    getJobFreshnessBadge,
    getCompanyInitials,
    getCompanyName,
    shouldShowSalary,
    formatCommuteTypes,
    formatJobLevel,
} from "../../types";

interface ListItemProps {
    item: Job;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function ListItem({
    item,
    isSelected,
    onSelect,
}: ListItemProps) {
    const freshnessBadge = getJobFreshnessBadge(
        item.updated_at,
        item.created_at,
    );
    const companyName = getCompanyName(item);

    return (
        <div
            className={`flex items-center gap-3 p-3 cursor-pointer border-b border-base-300 transition-colors hover:bg-base-300/50 ${
                isSelected ? "bg-primary/10 border-l-4 border-l-primary" : ""
            }`}
            onClick={() => onSelect(item.id)}
        >
            {/* Company Avatar */}
            <div className="avatar avatar-placeholder shrink-0">
                <div className="bg-base-200 text-base-content rounded-lg w-10 h-10 flex items-center justify-center">
                    {item.company?.logo_url ? (
                        <img
                            src={item.company.logo_url}
                            alt={`${companyName} logo`}
                            className="w-full h-full object-contain rounded-lg"
                        />
                    ) : (
                        <span className="text-sm font-bold">
                            {getCompanyInitials(companyName)}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-sm truncate">
                        {item.title}
                    </h4>
                    {freshnessBadge && (
                        <span
                            className={`badge ${freshnessBadge.color} badge-xs font-medium shrink-0 gap-1`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${freshnessBadge.icon} text-xs`}
                            />
                            {freshnessBadge.label}
                        </span>
                    )}
                </div>
                <p className="text-xs text-base-content/60 truncate">
                    {companyName} - {item.location || "Location not specified"}
                    {formatCommuteTypes(item.commute_types) && (
                        <> · {formatCommuteTypes(item.commute_types)}</>
                    )}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-accent">
                        {item.show_salary_range === false
                            ? "Salary not disclosed"
                            : shouldShowSalary(item)
                              ? formatSalary(
                                    item.salary_min ?? 0,
                                    item.salary_max ?? 0,
                                )
                              : "Salary not specified"}
                    </span>
                    <span className="text-xs text-base-content/40">
                        {item.updated_at
                            ? formatRelativeTime(item.updated_at)
                            : "Date not available"}
                    </span>
                </div>
            </div>
        </div>
    );
}
