"use client";

import Link from "next/link";
import {
    DataRow,
    DataList,
    KeyMetric,
    MetricCard,
} from "@/components/ui/cards";
import { formatRelativeTime } from "@/lib/utils";
import { getRoleBadges } from "@/lib/utils/role-badges";
import { getJobStatusBadge } from "@/lib/utils/badge-styles";
import RoleActionsToolbar from "./actions-toolbar";
import { Job } from "../types";

// Re-export for backward compatibility
export type { Job };

interface Badge {
    class: string;
    icon: string;
    text?: string;
    tooltip?: string;
    animated?: boolean;
}

// ===== ROLE CARD COMPONENT =====

interface RoleCardProps {
    job: Job;
    allJobs: Job[];
    userRole: string | null;
    canManageRole: boolean | undefined;
    onEditRole?: (jobId: string) => void;
    onViewDetails?: (jobId: string) => void;
    onViewPipeline?: (jobId: string) => void;
}

export function RoleCard({
    job,
    allJobs,
    userRole,
    canManageRole,
    onEditRole,
    onViewDetails,
    onViewPipeline,
}: RoleCardProps) {
    const badges = getRoleBadges(job, allJobs);
    const maxPayout = job.salary_max
        ? Math.round((job.fee_percentage * job.salary_max) / 100)
        : null;
    const isRecruiterView =
        userRole === "recruiter" || userRole === "platform_admin";
    const isCompanyView =
        userRole === "company_admin" || userRole === "hiring_manager";

    // Get key metric based on user role
    const getKeyMetricLabel = () => {
        if (isRecruiterView) return "Potential Commission";
        if (isCompanyView) return "Placement Fee (max)";
        return "Fee Rate";
    };

    const getKeyMetricValue = () => {
        if (isRecruiterView || isCompanyView) {
            return maxPayout ? `$${maxPayout.toLocaleString()}` : "—";
        }
        return `${job.fee_percentage}%`;
    };

    const getKeyMetricColor = () => {
        if (isRecruiterView) return "text-success";
        if (isCompanyView) return "text-info";
        return "text-base-content";
    };

    const getProgressColor = (): "success" | "info" | "primary" => {
        if (isRecruiterView) return "success";
        if (isCompanyView) return "info";
        return "primary";
    };
    return (
        <MetricCard className="group hover:shadow-lg transition-all duration-200">
            <MetricCard.Header>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex justify-between w-full items-center">
                        {/* Company Avatar */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="avatar avatar-placeholder shrink-0">
                                <div className="bg-base-200 text-base-content/70 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold">
                                    {job.company?.logo_url ? (
                                        <img
                                            src={job.company.logo_url}
                                            alt={job.company.name}
                                            className="w-full h-full object-contain rounded-lg"
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    "none";
                                                e.currentTarget.parentElement!.innerHTML =
                                                    (job.company?.name ||
                                                        "C")[0].toUpperCase();
                                            }}
                                        />
                                    ) : (
                                        (job.company?.name ||
                                            "C")[0].toUpperCase()
                                    )}
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors truncate">
                                    {job.title}
                                </h3>
                                <p className="text-sm text-base-content/60 truncate">
                                    {job.company?.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            {/* Status Badge */}
                            <div
                                className={`badge ${getJobStatusBadge(job.status)} shrink-0`}
                            >
                                {job.status}
                            </div>
                        </div>
                    </div>
                </div>
            </MetricCard.Header>
            <MetricCard.Body>
                {/* Key Metric */}
                <KeyMetric
                    label={getKeyMetricLabel()}
                    value={getKeyMetricValue()}
                    valueColor={getKeyMetricColor()}
                    progress={
                        job.application_count
                            ? Math.min((job.application_count / 10) * 100, 100)
                            : undefined
                    }
                    progressColor={getProgressColor()}
                />
                {/* Data Rows */}
                <DataList compact>
                    {job.location && (
                        <DataRow
                            icon="fa-location-dot"
                            label="Location"
                            value={job.location}
                        />
                    )}
                    {job.salary_min && job.salary_max && (
                        <DataRow
                            icon="fa-dollar-sign"
                            label="Salary Range"
                            value={`$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k`}
                        />
                    )}
                    <DataRow
                        icon="fa-percent"
                        label="Placement Fee"
                        value={`${job.fee_percentage}%`}
                    />
                    <DataRow
                        icon="fa-users"
                        label="Applicants"
                        value={job.application_count || 0}
                    />
                </DataList>
                {/* Badges Row */}
                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {badges.map((badge: Badge, idx: number) => (
                            <span
                                key={idx}
                                className={`badge badge-sm ${badge.class} gap-1 ${badge.animated ? "animate-pulse" : ""}`}
                                title={badge.tooltip}
                            >
                                <i
                                    className={`fa-duotone fa-regular ${badge.icon}`}
                                ></i>
                                {badge.text}
                            </span>
                        ))}
                    </div>
                )}
            </MetricCard.Body>
            <MetricCard.Footer>
                <div className="flex items-center justify-between w-full">
                    <span className=" text-base-content/50">
                        Posted {formatRelativeTime(job.created_at)}
                    </span>
                    <div className="flex items-center gap-2">
                        <RoleActionsToolbar
                            job={job}
                            variant="icon-only"
                            layout="horizontal"
                            size="xs"
                            onViewDetails={onViewDetails}
                            onViewPipeline={onViewPipeline}
                            showActions={{
                                viewPipeline: true,
                            }}
                        />
                    </div>
                </div>
            </MetricCard.Footer>
        </MetricCard>
    );
}
