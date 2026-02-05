"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { getRoleBadges } from "@/lib/utils/role-badges";
import { getJobStatusBadge } from "@/lib/utils/badge-styles";
import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
    ExpandedDetailSection,
} from "@/components/ui/tables";
import type { Job } from "./role-card";
import RoleActionsToolbar from "./role-actions-toolbar";

// ===== TYPES =====

interface Badge {
    class: string;
    icon: string;
    text?: string;
    tooltip?: string;
    animated?: boolean;
}

interface RoleTableRowProps {
    job: Job;
    allJobs: Job[];
    canManageRole: boolean | undefined;
    onEditRole?: (jobId: string) => void;
    onViewDetails?: (jobId: string) => void;
    onViewPipeline?: (jobId: string) => void;
}

// ===== COMPONENT =====

export function RoleTableRow({
    job,
    allJobs,
    canManageRole,
    onEditRole,
    onViewDetails,
    onViewPipeline,
}: RoleTableRowProps) {
    const badges = getRoleBadges(job, allJobs);
    const maxPayout = job.salary_max
        ? Math.round((job.fee_percentage * job.salary_max) / 100)
        : null;
    const minPayout = job.salary_min
        ? Math.round((job.fee_percentage * job.salary_min) / 100)
        : null;

    // Calculate commission range for display
    const commissionRange =
        minPayout && maxPayout
            ? `$${minPayout.toLocaleString()} – $${maxPayout.toLocaleString()}`
            : maxPayout
              ? `Up to $${maxPayout.toLocaleString()}`
              : "—";

    // Main row cells
    const cells = (
        <>
            <td className="py-4">
                <div className="flex items-center gap-3">
                    {/* Company Avatar */}
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-base-content/70 w-10 rounded-full flex items-center justify-center text-sm font-semibold">
                            {job.company?.logo_url ? (
                                <img
                                    src={job.company.logo_url}
                                    alt={job.company.name}
                                    className="w-full h-full object-contain rounded-lg"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : (
                                (job.company?.name || "C")[0].toUpperCase()
                            )}
                        </div>
                    </div>
                    <div className="text-sm min-w-0">
                        <span
                            className="font-semibold whitespace-pre-line"
                            title={job.title}
                        >
                            {job.title}
                        </span>
                        <div className="text-sm text-base-content/60">
                            {job.company?.name}
                        </div>
                    </div>
                </div>
            </td>
            {/* <td>
                {job.location ? (
                    <span className="text-sm">{job.location}</span>
                ) : (
                    <span className="text-base-content/30">—</span>
                )}
            </td> */}
            <td>
                {job.salary_min && job.salary_max ? (
                    <span className="text-sm tabular-nums">
                        ${(job.salary_min / 1000).toFixed(0)}k – $
                        {(job.salary_max / 1000).toFixed(0)}k
                    </span>
                ) : (
                    <span className="text-base-content/30">—</span>
                )}
            </td>
            <td>
                <span className="font-medium tabular-nums">
                    {job.fee_percentage}%
                </span>
            </td>
            <td>
                <span className="font-semibold text-success tabular-nums">
                    {maxPayout ? `$${maxPayout.toLocaleString()}` : "—"}
                </span>
            </td>
            <td>
                <div
                    className={`badge badge-sm ${getJobStatusBadge(job.status)}`}
                >
                    {job.status}
                </div>
            </td>
            <td>
                <span className="text-sm text-base-content/60">
                    {formatRelativeTime(job.created_at)}
                </span>
            </td>
            <td onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 justify-end">
                    <RoleActionsToolbar
                        job={job}
                        variant="icon-only"
                        layout="horizontal"
                        size="sm"
                        onViewDetails={onViewDetails}
                        onViewPipeline={onViewPipeline}
                        showActions={{
                            viewPipeline: true,
                        }}
                    />
                </div>
            </td>
        </>
    );

    // Expanded content
    const expandedContent = (
        <div className="space-y-4">
            {/* Badges Row */}
            {badges.length > 0 && (
                <ExpandedDetailSection title="Status Indicators">
                    <div className="flex flex-wrap gap-2">
                        {badges.map((badge: Badge, idx: number) => (
                            <span
                                key={idx}
                                className={`badge ${badge.class} gap-1.5 ${badge.animated ? "animate-pulse" : ""}`}
                                title={badge.tooltip}
                            >
                                <i
                                    className={`fa-duotone fa-regular ${badge.icon}`}
                                ></i>
                                {badge.text}
                            </span>
                        ))}
                    </div>
                </ExpandedDetailSection>
            )}

            {/* Details Grid */}
            <ExpandedDetailGrid cols={4}>
                <ExpandedDetailItem
                    icon="fa-building"
                    label="Company"
                    value={
                        <div>
                            <div>{job.company?.name}</div>
                            {job.company?.industry && (
                                <div className=" text-base-content/50">
                                    {job.company.industry}
                                </div>
                            )}
                        </div>
                    }
                />
                <ExpandedDetailItem
                    icon="fa-location-dot"
                    label="Location"
                    value={
                        job.location ||
                        job.company?.headquarters_location ||
                        "Remote"
                    }
                />
                <ExpandedDetailItem
                    icon="fa-money-bill-wave"
                    label="Salary Range"
                    value={
                        job.salary_min && job.salary_max
                            ? `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k`
                            : "Not specified"
                    }
                />
                <ExpandedDetailItem
                    icon="fa-sack-dollar"
                    label="Commission Range"
                    value={
                        <span className="text-success font-semibold">
                            {commissionRange}
                        </span>
                    }
                />
            </ExpandedDetailGrid>

            {/* Second Row - Stats */}
            <ExpandedDetailGrid cols={4}>
                <ExpandedDetailItem
                    icon="fa-percent"
                    label="Placement Fee"
                    value={`${job.fee_percentage}%`}
                />
                <ExpandedDetailItem
                    icon="fa-users"
                    label="Applicants"
                    value={job.application_count || 0}
                />
                <ExpandedDetailItem
                    icon="fa-calendar"
                    label="Posted"
                    value={formatRelativeTime(job.created_at)}
                />
                <ExpandedDetailItem
                    icon="fa-signal"
                    label="Status"
                    value={
                        <span
                            className={`badge badge-sm ${getJobStatusBadge(job.status)}`}
                        >
                            {job.status}
                        </span>
                    }
                />
            </ExpandedDetailGrid>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-base-300">
                <RoleActionsToolbar
                    job={job}
                    variant="descriptive"
                    layout="horizontal"
                    size="sm"
                    onViewDetails={onViewDetails}
                    onViewPipeline={onViewPipeline}
                    showActions={{
                        viewPipeline: true,
                    }}
                />
            </div>
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`role-${job.id}`}
            cells={cells}
            expandedContent={expandedContent}
            showToggle={true}
        />
    );
}
