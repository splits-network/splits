"use client";

import { formatSalary, formatRelativeTime } from "@/lib/utils";
import {
    EntityCard,
    DataRow,
    VerticalDataRow,
    DataList,
} from "@/components/ui/cards";
import { MarkdownRenderer } from "@/components/markdown-renderer";
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

interface ItemProps {
    item: Job;
    onViewDetails: (id: string) => void;
}

export default function Item({ item, onViewDetails }: ItemProps) {
    const freshnessBadge = getJobFreshnessBadge(
        item.updated_at,
        item.created_at,
    );
    const companyName = getCompanyName(item);

    return (
        <EntityCard className="group hover:shadow-lg transition-all duration-200">
            <EntityCard.Header>
                <div className="flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Company Logo/Avatar */}
                        <div className="avatar avatar-placeholder">
                            <div className="bg-base-200 text-base-content rounded-lg w-10 h-10">
                                {item.company?.logo_url ? (
                                    <img
                                        src={item.company.logo_url}
                                        alt={companyName}
                                        className="object-contain w-full h-full"
                                    />
                                ) : (
                                    <span className="text-lg">
                                        {getCompanyInitials(companyName)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h3
                                className="font-semibold text-md flex items-center gap-2 overflow-hidden whitespace-nowrap text-ellipsis"
                                title={item.title}
                            >
                                {item.title}
                            </h3>
                            <div className="text-sm text-base-content/70 truncate">
                                {companyName}
                            </div>
                        </div>
                    </div>
                    {freshnessBadge && (
                        <span
                            className={`badge ${freshnessBadge.color} badge-sm gap-1 whitespace-nowrap`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${freshnessBadge.icon} text-xs`}
                            />
                            <span className="hidden sm:inline">
                                {freshnessBadge.label}
                            </span>
                        </span>
                    )}
                </div>
            </EntityCard.Header>

            <EntityCard.Body>
                <DataList>
                    <VerticalDataRow label="Description" icon="fa-file-lines">
                        <div className="w-full text-sm text-base-content/80 line-clamp-3">
                            <MarkdownRenderer
                                content={
                                    item.candidate_description ||
                                    item.description ||
                                    "No description provided"
                                }
                            />
                        </div>
                    </VerticalDataRow>
                    <DataRow
                        label="Location"
                        icon="fa-location-dot"
                        value={item.location || "Not specified"}
                    />
                    <DataRow
                        label="Employment"
                        icon="fa-briefcase"
                        value={formatEmploymentType(item.employment_type)}
                    />
                    <DataRow
                        label="Salary"
                        icon="fa-dollar-sign"
                        value={
                            item.show_salary_range === false
                                ? "Not disclosed"
                                : shouldShowSalary(item)
                                  ? formatSalary(
                                        item.salary_min ?? 0,
                                        item.salary_max ?? 0,
                                    )
                                  : "Not specified"
                        }
                    />
                    {formatCommuteTypes(item.commute_types) && (
                        <DataRow
                            label="Work Type"
                            icon="fa-building-user"
                            value={formatCommuteTypes(item.commute_types)!}
                        />
                    )}
                    {formatJobLevel(item.job_level) && (
                        <DataRow
                            label="Level"
                            icon="fa-signal"
                            value={formatJobLevel(item.job_level)!}
                        />
                    )}
                    <DataRow
                        label="Department"
                        icon="fa-building"
                        value={item.department || "Not specified"}
                    />
                    <VerticalDataRow label="Industry" icon="fa-industry">
                        <div className="w-full">
                            <span className="badge badge-sm">
                                {getCompanyIndustry(item) || "Not specified"}
                            </span>
                        </div>
                    </VerticalDataRow>
                </DataList>
            </EntityCard.Body>

            <EntityCard.Footer>
                <div className="flex justify-between items-center">
                    <div>
                        {item.open_to_relocation && (
                            <span className="badge badge-outline badge-sm gap-1 mb-1">
                                <i className="fa-duotone fa-regular fa-location-arrow text-xs" />
                                Open to Relocation
                            </span>
                        )}
                        <div className="text-xs text-base-content/50">
                            Posted:{" "}
                            {formatRelativeTime(
                                (item.updated_at ||
                                    item.created_at ||
                                    new Date().toISOString()) as string,
                            )}
                        </div>
                    </div>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onViewDetails(item.id)}
                    >
                        View Details
                        <i className="fa-duotone fa-regular fa-arrow-right ml-1.5" />
                    </button>
                </div>
            </EntityCard.Footer>
        </EntityCard>
    );
}
