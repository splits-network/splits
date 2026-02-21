"use client";

import type { Job } from "../../types";
import { formatJobLevel } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    salaryDisplay,
    formatEmploymentType,
    formatStatusLabel,
    isNew,
    companyName,
    companyInitials,
    truncateDescription,
} from "../shared/helpers";

interface GridCardProps {
    job: Job;
    isSelected: boolean;
    onSelect: () => void;
}

export function GridCard({ job, isSelected, onSelect }: GridCardProps) {
    const name = companyName(job);
    const salary = salaryDisplay(job);
    const level = formatJobLevel(job.job_level);
    const desc = truncateDescription(job);

    return (
        <div
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected
                    ? "border-primary border-l-4"
                    : "border-base-200",
            ].join(" ")}
        >
            {/* Status + NEW badge */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(job.status)}`}
                >
                    {formatStatusLabel(job.status)}
                </span>
                {isNew(job) && (
                    <span className="text-[10px] uppercase tracking-wider bg-warning/15 text-warning px-2 py-1">
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </span>
                )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors mb-1">
                {job.title}
            </h3>

            {/* Company */}
            <div className="text-sm font-semibold text-base-content/60 mb-2">
                {name}
            </div>

            {/* Location */}
            {job.location && (
                <div className="flex items-center gap-1 text-sm text-base-content/50 mb-3">
                    <i className="fa-duotone fa-regular fa-location-dot" />
                    {job.location}
                </div>
            )}

            {/* Salary */}
            <div className="text-base font-black tracking-tight text-primary mb-3">
                {salary || "Competitive"}
            </div>

            {/* Description excerpt */}
            {desc && (
                <p className="text-sm text-base-content/60 leading-relaxed mb-4 line-clamp-2">
                    {desc}
                </p>
            )}

            {/* Tags */}
            {(job.employment_type || level) && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {job.employment_type && (
                        <span className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1">
                            {formatEmploymentType(job.employment_type)}
                        </span>
                    )}
                    {level && (
                        <span className="text-[9px] uppercase tracking-wider bg-base-200 text-base-content/50 px-2 py-1">
                            {level}
                        </span>
                    )}
                </div>
            )}

            {/* Footer: company logo */}
            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-base-200">
                {job.company?.logo_url ? (
                    <img
                        src={job.company.logo_url}
                        alt={name}
                        className="w-9 h-9 shrink-0 object-contain bg-base-200 border border-base-300 p-1"
                    />
                ) : (
                    <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-base-200 border border-base-300 text-xs font-bold text-base-content/60">
                        {companyInitials(name)}
                    </div>
                )}
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-base-content truncate">
                        {name}
                    </div>
                    {job.company?.industry && (
                        <div className="text-xs text-base-content/40 truncate">
                            {job.company.industry}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
