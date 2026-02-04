"use client";

import { useRouter } from "next/navigation";
import { formatSalary, formatRelativeTime } from "@/lib/utils";
import {
    ExpandableTableRow,
    ExpandedDetailSection,
    ExpandedDetailGrid,
    ExpandedDetailItem,
} from "@/components/ui/tables";

interface Job {
    id: string;
    title: string;
    description?: string | null;
    candidate_description?: string | null;
    location?: string | null;
    employment_type?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    category?: string | null;
    open_to_relocation?: boolean;
    updated_at?: string | Date;
    created_at?: string | Date;
    company?: {
        id: string;
        name: string;
        logo_url?: string | null;
        headquarters_location?: string | null;
        industry?: string | null;
    };
}

interface JobTableRowProps {
    job: Job;
}

export function JobTableRow({ job }: JobTableRowProps) {
    const router = useRouter();

    // Compute company initials for avatar (matching card component)
    const companyInitials = (() => {
        const name = job.company?.name || "Company";
        const words = name.split(" ");
        const firstInitial = words[0]?.[0]?.toUpperCase() || "";
        const lastInitial = words[words.length - 1]?.[0]?.toUpperCase() || "";
        return words.length > 1 ? firstInitial + lastInitial : firstInitial;
    })();

    const viewJob = () => {
        router.push(`/public/jobs/${job.id}`);
    };

    // Format employment type for display
    const formatEmploymentType = (type?: string) => {
        if (!type) return "—";
        return type
            .split("_")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
            .join(" ");
    };

    // Get job freshness badge
    const getFreshnessBadge = () => {
        const date = job.updated_at || job.created_at;
        if (!date) return null;

        const daysOld = Math.floor(
            (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysOld <= 3) {
            return { label: "New", color: "badge-success" };
        } else if (daysOld <= 7) {
            return { label: "Recent", color: "badge-secondary" };
        }
        return null;
    };

    const freshnessBadge = getFreshnessBadge();

    // Main row cells
    const cells = (
        <>
            <td>
                <div className="flex items-center gap-3">
                    {/* Company Avatar */}
                    <div className="avatar avatar-placeholder shrink-0 hidden md:block">
                        <div className="bg-base-100 text-base-content rounded-full w-10 h-10">
                            {job.company?.logo_url ? (
                                <img
                                    src={job.company.logo_url}
                                    alt={job.company.name}
                                    className="object-contain w-full h-full"
                                />
                            ) : (
                                <span className="text-sm">
                                    {companyInitials}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="font-bold">{job.title}</div>
                        {freshnessBadge && (
                            <span
                                className={`badge ${freshnessBadge.color} badge-xs mt-1`}
                            >
                                {freshnessBadge.label}
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td>
                <div className="text-sm">{job.company?.name || "Company"}</div>
                {job.company?.industry && (
                    <div className="text-xs text-base-content/60">
                        {job.company.industry}
                    </div>
                )}
            </td>
            <td>
                {job.location && (
                    <div className="flex items-center gap-1 text-sm whitespace-nowrap">
                        <i className="fa-duotone fa-regular fa-location-dot"></i>
                        {job.location}
                    </div>
                )}
                {job.open_to_relocation && (
                    <span className="badge badge-outline badge-xs mt-1 gap-1 text-nowrap p-2">
                        <i className="fa-duotone fa-regular fa-location-arrow text-xs"></i>
                        Relocation OK
                    </span>
                )}
            </td>
            <td>
                <div className="text-sm">
                    {formatSalary(job.salary_min ?? 0, job.salary_max ?? 0)}
                </div>
                <div className="text-xs text-base-content/60">
                    {formatEmploymentType(job.employment_type ?? undefined)}
                </div>
            </td>
            <td>
                <div className="text-sm">
                    {formatRelativeTime(
                        (job.updated_at || job.created_at) ??
                            new Date().toISOString(),
                    )}
                </div>
            </td>
            <td onClick={(e) => e.stopPropagation()}>
                <button
                    className="btn btn-sm btn-primary whitespace-nowrap"
                    onClick={(e) => {
                        e.stopPropagation();
                        viewJob();
                    }}
                >
                    <i className="fa-duotone fa-regular fa-briefcase"></i>
                    View Job
                </button>
            </td>
        </>
    );

    // Expanded content for additional details
    const expandedContent = (
        <div className="space-y-4">
            {/* Description */}
            {(job.candidate_description || job.description) && (
                <ExpandedDetailSection title="Description">
                    <p className="text-sm text-base-content/70">
                        <i className="fa-duotone fa-regular fa-quote-left mr-2" />
                        {job.candidate_description || job.description}
                    </p>
                </ExpandedDetailSection>
            )}

            {/* Job Details */}
            <ExpandedDetailSection title="Job Details">
                <ExpandedDetailGrid>
                    {/* Location */}
                    {job.location && (
                        <ExpandedDetailItem
                            label="Location"
                            value={
                                <div className="flex items-center gap-1">
                                    <i className="fa-duotone fa-regular fa-location-dot"></i>
                                    {job.location}
                                    {job.open_to_relocation && (
                                        <span className="badge badge-outline badge-xs ml-2 gap-1 text-nowrap">
                                            <i className="fa-duotone fa-regular fa-location-arrow text-xs"></i>
                                            Relocation OK
                                        </span>
                                    )}
                                </div>
                            }
                        />
                    )}

                    {/* Salary */}
                    <ExpandedDetailItem
                        label="Salary"
                        value={formatSalary(
                            job.salary_min ?? 0,
                            job.salary_max ?? 0,
                        )}
                    />

                    {/* Employment Type */}
                    <ExpandedDetailItem
                        label="Employment Type"
                        value={formatEmploymentType(
                            job.employment_type ?? undefined,
                        )}
                    />

                    {/* Category */}
                    {job.category && (
                        <ExpandedDetailItem
                            label="Category"
                            value={job.category}
                        />
                    )}

                    {/* Posted Date */}
                    <ExpandedDetailItem
                        label="Posted"
                        value={formatRelativeTime(
                            (job.updated_at || job.created_at) ??
                                new Date().toISOString(),
                        )}
                    />
                </ExpandedDetailGrid>
            </ExpandedDetailSection>

            {/* Company Information */}
            {job.company && (
                <ExpandedDetailSection title="Company Information">
                    <ExpandedDetailGrid>
                        <ExpandedDetailItem
                            label="Company"
                            value={job.company.name}
                        />

                        {job.company.industry && (
                            <ExpandedDetailItem
                                label="Industry"
                                value={job.company.industry}
                            />
                        )}

                        {job.company.headquarters_location && (
                            <ExpandedDetailItem
                                label="Company HQ"
                                value={job.company.headquarters_location}
                            />
                        )}
                    </ExpandedDetailGrid>
                </ExpandedDetailSection>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-base-300">
                <button
                    className="btn btn-primary btn-sm gap-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        viewJob();
                    }}
                >
                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                    View Full Details
                </button>
            </div>
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`job-${job.id}`}
            cells={cells}
            expandedContent={expandedContent}
            showToggle={true}
        />
    );
}
