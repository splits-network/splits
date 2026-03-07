"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";

interface SavedJobCardProps {
    savedJob: any;
    onRemove: (id: string) => void;
    removing?: boolean;
}

function formatSalary(min: number | null, max: number | null): string {
    if (!min && !max) return "Salary not listed";
    const fmt = (n: number) =>
        n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
}

function formatEmploymentType(type: string): string {
    if (!type) return "";
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SavedJobCard({
    savedJob,
    onRemove,
    removing,
}: SavedJobCardProps) {
    const job = savedJob.job;
    const company = job?.company;
    const companyName = company?.name || "Company not listed";

    return (
        <div className="saved-job-card flex flex-col bg-base-100 border-2 border-base-200 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30 scroll-reveal fade-up relative group">
            {/* Remove button */}
            <button
                className="btn btn-circle btn-ghost btn-sm absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.preventDefault();
                    onRemove(savedJob.id);
                }}
                disabled={removing}
                title="Remove from saved jobs"
            >
                {removing ? (
                    <i className="fa-duotone fa-solid fa-spinner-third animate-spin" />
                ) : (
                    <i className="fa-regular fa-trash text-base-content/50 hover:text-error" />
                )}
            </button>

            {/* Job title */}
            <Link
                href={`/jobs/${job?.id}`}
                className="hover:text-primary transition-colors pr-8"
            >
                <h3 className="text-lg font-black tracking-tight leading-tight mb-1">
                    {job?.title || "Open position"}
                </h3>
            </Link>

            {/* Company */}
            <div className="text-sm font-semibold text-base-content/60 mb-2">
                {companyName}
            </div>

            {/* Location */}
            {job?.location && (
                <div className="flex items-center gap-1 text-sm text-base-content/50 mb-3">
                    <i className="fa-duotone fa-regular fa-location-dot" />
                    {job.location}
                </div>
            )}

            {/* Salary */}
            <div className="text-base font-black tracking-tight text-primary mb-3">
                {formatSalary(job?.salary_min ?? null, job?.salary_max ?? null)}
            </div>

            {/* Tags */}
            {(job?.employment_type || job?.job_level) && (
                <div className="flex flex-wrap gap-1 mb-4 mt-auto">
                    {job.employment_type && (
                        <span className="text-[10px] sm:text-xs uppercase tracking-wider bg-base-200 text-base-content/70 px-2 py-1 font-bold">
                            {formatEmploymentType(job.employment_type)}
                        </span>
                    )}
                    {job.job_level && (
                        <span className="text-[10px] sm:text-xs uppercase tracking-wider bg-base-200 text-base-content/70 px-2 py-1 font-bold">
                            {job.job_level}
                        </span>
                    )}
                </div>
            )}

            {/* Saved timestamp */}
            <div className="mt-4 pt-4 border-t-2 border-base-200 text-xs font-bold uppercase tracking-wider text-base-content/40">
                <i className="fa-duotone fa-regular fa-bookmark mr-2" />
                Saved {formatRelativeTime(savedJob.created_at)}
            </div>
        </div>
    );
}
