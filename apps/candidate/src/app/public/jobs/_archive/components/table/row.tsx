"use client";

import { formatSalary, formatRelativeTime } from "@/lib/utils";
import { DataTableRow } from "@/components/ui/tables";
import {
    type Job,
    getJobFreshnessBadge,
    getCompanyInitials,
    getCompanyName,
    getCompanyIndustry,
    shouldShowSalary,
    formatEmploymentType,
    formatCommuteTypes,
    formatJobLevel,
} from "../../types";

interface RowProps {
    item: Job;
    onViewDetails: (id: string) => void;
}

export default function Row({ item, onViewDetails }: RowProps) {
    const freshnessBadge = getJobFreshnessBadge(
        item.updated_at,
        item.created_at,
    );
    const companyName = getCompanyName(item);
    const companyIndustry = getCompanyIndustry(item);

    return (
        <DataTableRow onClick={() => onViewDetails(item.id)}>
            {/* Expand column spacer */}
            <td className="w-10">
                <button
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(item.id);
                    }}
                >
                    <i className="fa-duotone fa-regular fa-chevron-right" />
                </button>
            </td>

            {/* Job Title */}
            <td>
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder shrink-0 hidden md:block">
                        <div className="bg-base-200 text-base-content rounded-lg w-8 h-8 flex items-center justify-center">
                            {item.company?.logo_url ? (
                                <img
                                    src={item.company.logo_url}
                                    alt=""
                                    className="w-full h-full object-contain rounded-lg"
                                />
                            ) : (
                                <span className="text-xs font-bold">
                                    {getCompanyInitials(companyName)}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <span className="font-semibold text-sm">
                            {item.title}
                        </span>
                        {freshnessBadge && (
                            <span
                                className={`badge ${freshnessBadge.color} badge-xs ml-2`}
                            >
                                {freshnessBadge.label}
                            </span>
                        )}
                    </div>
                </div>
            </td>

            {/* Company */}
            <td>
                <div className="text-sm">{companyName}</div>
                <div className="text-xs text-base-content/60">
                    {companyIndustry || "Not specified"}
                </div>
            </td>

            {/* Location */}
            <td className="hidden md:table-cell">
                <span className="text-sm">
                    <i className="fa-duotone fa-regular fa-location-dot mr-1 text-xs" />
                    {item.location || "Not specified"}
                </span>
            </td>

            {/* Salary */}
            <td className="hidden md:table-cell">
                <div className="text-sm">
                    {item.show_salary_range === false ? (
                        <span className="text-base-content/50">
                            Not disclosed
                        </span>
                    ) : shouldShowSalary(item) ? (
                        formatSalary(item.salary_min ?? 0, item.salary_max ?? 0)
                    ) : (
                        <span className="text-base-content/50">
                            Not specified
                        </span>
                    )}
                </div>
                <div className="text-xs text-base-content/60">
                    {formatEmploymentType(item.employment_type)}
                    {formatCommuteTypes(item.commute_types) && (
                        <> · {formatCommuteTypes(item.commute_types)}</>
                    )}
                </div>
            </td>

            {/* Posted */}
            <td>
                <span className="text-sm">
                    {formatRelativeTime(
                        (item.updated_at || item.created_at) as string,
                    )}
                </span>
            </td>

            {/* Actions */}
            <td className="text-right">
                <button
                    className="btn btn-ghost btn-xs"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(item.id);
                    }}
                >
                    <i className="fa-duotone fa-regular fa-eye" />
                </button>
            </td>
        </DataTableRow>
    );
}
