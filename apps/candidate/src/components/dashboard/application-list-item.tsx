"use client";

import Link from "next/link";
import { Presence } from "@/components/presense";

interface ApplicationListItemProps {
    application: {
        id: string;
        job_title: string;
        company: string;
        status: string;
        applied_at: string;
        updated_at?: string;
        location?: string;
        employment_type?: string;
        salary_min?: number;
        salary_max?: number;
        recruiter_user_id?: string | null;
    };
    onChatClick?: (e: React.MouseEvent) => void;
    presenceStatus?: "online" | "idle" | "offline" | null;
    startingChat?: boolean;
}

// Map stage to progress percentage
function getStageProgress(stage: string): number {
    const stageMap: Record<string, number> = {
        draft: 0,
        submitted: 40,
        screen: 50,
        interview: 60,
        final_interview: 75,
        offer: 80,
        hired: 100,
        rejected: 100,
        withdrawn: 100,
    };
    return stageMap[stage] || 40;
}

// Get status indicator color
function getStatusColor(stage: string): string {
    if (["interview", "final_interview", "offer"].includes(stage)) {
        return "bg-success";
    }
    if (["submitted", "screen"].includes(stage)) {
        return "bg-warning";
    }
    if (["rejected", "withdrawn"].includes(stage)) {
        return "bg-error";
    }
    return "bg-info";
}

// Get status badge color
function getStatusBadgeClass(stage: string): string {
    if (["interview", "final_interview"].includes(stage)) {
        return "badge-info";
    }
    if (stage === "offer") {
        return "badge-warning";
    }
    if (["rejected", "withdrawn"].includes(stage)) {
        return "badge-error";
    }
    if (["submitted", "screen"].includes(stage)) {
        return "badge-success";
    }
    return "badge-ghost";
}

// Format relative time
function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 30) {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    }
    if (diffDays > 0) {
        return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    }
    if (diffHours > 0) {
        return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    }
    if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    }
    return "Just now";
}

// Format salary range
function formatSalaryRange(min?: number, max?: number): string | null {
    if (!min && !max) return null;
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    if (min && max) {
        return `${formatter.format(min)} - ${formatter.format(max)}`;
    }
    if (min) {
        return `${formatter.format(min)}+`;
    }
    return null;
}

export default function ApplicationListItem({
    application,
    onChatClick,
    presenceStatus,
    startingChat = false,
}: ApplicationListItemProps) {
    const progress = getStageProgress(application.status);
    const statusColor = getStatusColor(application.status);
    const badgeClass = getStatusBadgeClass(application.status);
    const appliedTime = getRelativeTime(application.applied_at);
    const updatedTime = application.updated_at
        ? getRelativeTime(application.updated_at)
        : null;
    const salaryRange = formatSalaryRange(
        application.salary_min,
        application.salary_max,
    );
    const canChat = Boolean(application.recruiter_user_id);

    return (
        <Link href={`/portal/applications?applicationId=${application.id}`}>
            <div className="group relative p-2.5 bg-base-100 rounded-lg hover:bg-base-200/70 hover:shadow-lg hover:border-coral/50 border border-transparent transition-all cursor-pointer">
                {/* Header row with title and status dot */}
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors mb-0.5">
                            {application.job_title}
                        </h3>
                        <p className="text-xs text-base-content/70 truncate">
                            {application.company}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Status indicator dot */}
                        <div
                            className={`w-2.5 h-2.5 rounded-full ${statusColor} flex-shrink-0`}
                            title={application.status}
                        />
                        {/* Chat button */}
                        {canChat && (
                            <button
                                className="btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity relative"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onChatClick?.(e);
                                }}
                                disabled={startingChat}
                                title="Message recruiter"
                            >
                                <Presence
                                    status={presenceStatus}
                                    className="absolute -top-1 -right-1"
                                />
                                {startingChat ? (
                                    <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                    <i className="fa-duotone fa-regular fa-messages text-xs"></i>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-base-content/60 mb-1.5">
                    <span className="flex items-center gap-1">
                        <i className="fa-duotone fa-regular fa-clock text-[10px]"></i>
                        Applied {appliedTime}
                    </span>
                    {application.location && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-location-dot text-[10px]"></i>
                            {application.location}
                        </span>
                    )}
                    {application.employment_type && (
                        <span className="flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-briefcase text-[10px]"></i>
                            {application.employment_type}
                        </span>
                    )}
                    {salaryRange && (
                        <span className="flex items-center gap-1 font-medium text-base-content/80">
                            <i className="fa-duotone fa-regular fa-dollar-sign text-[10px]"></i>
                            {salaryRange}
                        </span>
                    )}
                </div>

                {/* Progress bar */}
                <div className="mb-1.5">
                    <div className="h-1 bg-base-300 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${statusColor} transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Status badge and progress percentage */}
                <div className="flex items-center justify-between">
                    <span className={`badge ${badgeClass} badge-xs uppercase`}>
                        {application.status.replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-2 text-[11px]">
                        {updatedTime && (
                            <span className="text-base-content/50">
                                Updated {updatedTime}
                            </span>
                        )}
                        <span className="font-medium text-base-content/70">
                            {progress}%
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
