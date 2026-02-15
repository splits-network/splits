"use client";

import { Badge, Button } from "@splits-network/memphis-ui";
import type { AccentColor } from "@splits-network/memphis-ui";
import { formatRelativeTime } from "@/lib/utils";
import { Job, formatCommuteTypes, formatJobLevel } from "../../roles/types";

interface MemphisRoleCardProps {
    job: Job;
    accent?: AccentColor;
    userRole: string | null;
    canManageRole: boolean | undefined;
    onViewDetails?: (jobId: string) => void;
    onViewPipeline?: (jobId: string) => void;
}

const STATUS_ACCENT: Record<string, AccentColor> = {
    active: "teal",
    paused: "yellow",
    filled: "purple",
    closed: "coral",
};

// Accent → Tailwind class mappings (avoids inline style hex)
const BG_CLASSES: Record<string, string> = {
    coral: "bg-coral",
    teal: "bg-teal",
    yellow: "bg-yellow",
    purple: "bg-purple",
};

const BG_FAINT_CLASSES: Record<string, string> = {
    coral: "bg-coral/20",
    teal: "bg-teal/20",
    yellow: "bg-yellow/20",
    purple: "bg-purple/20",
};

const BG_SUBTLE_CLASSES: Record<string, string> = {
    coral: "bg-coral/10",
    teal: "bg-teal/10",
    yellow: "bg-yellow/10",
    purple: "bg-purple/10",
};

const TEXT_CLASSES: Record<string, string> = {
    coral: "text-coral",
    teal: "text-teal",
    yellow: "text-yellow",
    purple: "text-purple",
};

export function MemphisRoleCard({
    job,
    accent = "coral",
    userRole,
    canManageRole,
    onViewDetails,
    onViewPipeline,
}: MemphisRoleCardProps) {
    const statusAccent = STATUS_ACCENT[job.status] || "dark";
    const isRecruiterView = userRole === "recruiter" || userRole === "platform_admin";
    const maxPayout = job.salary_max
        ? Math.round((job.fee_percentage * job.salary_max) / 100)
        : null;

    return (
        <div
            className="memphis-card bg-white relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1"
            onClick={() => onViewDetails?.(job.id)}
        >
            {/* Top color strip */}
            <div className={`h-2 ${BG_CLASSES[accent] || "bg-coral"}`} />

            {/* Status badge - top right */}
            <div className="absolute top-4 right-4">
                <Badge variant={statusAccent}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
            </div>

            <div className="p-5">
                {/* Company avatar + title */}
                <div className="flex items-start gap-3 mb-4 pr-20">
                    <div
                        className={`w-10 h-10 border-memphis-detail border-dark flex items-center justify-center flex-shrink-0 overflow-hidden ${BG_FAINT_CLASSES[accent] || "bg-coral/20"}`}
                    >
                        {job.company?.logo_url ? (
                            <img
                                src={job.company.logo_url}
                                alt={job.company.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement!.textContent =
                                        (job.company?.name || "C")[0].toUpperCase();
                                }}
                            />
                        ) : (
                            <span className="text-sm font-black text-dark">
                                {(job.company?.name || "C")[0].toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base font-black uppercase tracking-wide text-dark leading-tight truncate">
                            {job.title}
                        </h3>
                        <p className="text-xs font-semibold text-dark/50 truncate">
                            {job.company?.name || "Confidential"}
                        </p>
                    </div>
                </div>

                {/* Key metric - commission/fee */}
                <div className={`border-memphis-detail border-dark/10 p-3 mb-4 ${BG_SUBTLE_CLASSES[accent] || "bg-coral/10"}`}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-dark/50">
                            {isRecruiterView ? "Potential Commission" : "Placement Fee"}
                        </span>
                        <span className={`text-lg font-black ${TEXT_CLASSES[accent] || "text-coral"}`}>
                            {isRecruiterView && maxPayout
                                ? `$${maxPayout.toLocaleString()}`
                                : `${job.fee_percentage}%`}
                        </span>
                    </div>
                </div>

                {/* Data rows */}
                <div className="space-y-2 mb-4">
                    {job.location && (
                        <div className="flex items-center gap-2 text-xs">
                            <i className="fa-duotone fa-regular fa-location-dot text-dark/40 w-4 text-center" />
                            <span className="font-semibold text-dark/70">{job.location}</span>
                        </div>
                    )}
                    {job.salary_min && job.salary_max && (
                        <div className="flex items-center gap-2 text-xs">
                            <i className="fa-duotone fa-regular fa-dollar-sign text-dark/40 w-4 text-center" />
                            <span className="font-semibold text-dark/70">
                                ${(job.salary_min / 1000).toFixed(0)}k &ndash; ${(job.salary_max / 1000).toFixed(0)}k
                            </span>
                        </div>
                    )}
                    {formatCommuteTypes(job.commute_types) && (
                        <div className="flex items-center gap-2 text-xs">
                            <i className="fa-duotone fa-regular fa-building-user text-dark/40 w-4 text-center" />
                            <span className="font-semibold text-dark/70">
                                {formatCommuteTypes(job.commute_types)}
                            </span>
                        </div>
                    )}
                    {formatJobLevel(job.job_level) && (
                        <div className="flex items-center gap-2 text-xs">
                            <i className="fa-duotone fa-regular fa-signal text-dark/40 w-4 text-center" />
                            <span className="font-semibold text-dark/70">
                                {formatJobLevel(job.job_level)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t-2 border-dark/10">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase text-dark/40">
                            <i className="fa-duotone fa-regular fa-users mr-1" />
                            {job.application_count || 0} applied
                        </span>
                        <span className="text-[10px] font-bold uppercase text-dark/40">
                            {formatRelativeTime(job.created_at)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {onViewPipeline && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewPipeline(job.id);
                                }}
                                className="w-7 h-7 flex items-center justify-center border-2 border-dark/20 text-dark/40 hover:border-teal hover:text-teal transition-colors"
                                title="View Pipeline"
                            >
                                <i className="fa-duotone fa-regular fa-diagram-project text-xs" />
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails?.(job.id);
                            }}
                            className="w-7 h-7 flex items-center justify-center border-2 border-dark/20 text-dark/40 hover:border-coral hover:text-coral transition-colors"
                            title="View Details"
                        >
                            <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
