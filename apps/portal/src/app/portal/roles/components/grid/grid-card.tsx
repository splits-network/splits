"use client";

import type { Job } from "../../types";
import { formatJobLevel } from "../../types";
import { statusColor } from "../shared/status-color";
import {
    salaryDisplay,
    formatStatus,
    formatEmploymentType,
    isNew,
    companyName,
    companyInitials,
} from "../shared/helpers";
import RoleActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
    job,
    isSelected,
    onSelect,
    onRefresh,
}: {
    job: Job;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const name = companyName(job);
    const salary = salaryDisplay(job);
    const level = formatJobLevel(job.job_level);

    return (
        <div
            onClick={onSelect}
            className={[
                "group cursor-pointer bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected ? "border-primary border-l-4" : "border-base-200",
            ].join(" ")}
        >
            {/* Top row: status pill + NEW badge */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(job.status)}`}
                >
                    {formatStatus(job.status)}
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
                <div className="flex items-center gap-1 text-sm text-base-content/50 mb-4">
                    <i className="fa-duotone fa-regular fa-location-dot" />
                    {job.location}
                </div>
            )}

            {/* Salary */}
            <div className="text-base font-black tracking-tight text-primary mb-3">
                {salary || "Competitive"}
            </div>

            {/* Fee + Apps row */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-bold text-accent">
                    <i className="fa-duotone fa-regular fa-percent mr-1" />
                    {job.fee_percentage}% fee
                </span>
                <span className="text-sm font-bold text-base-content/60">
                    <i className="fa-duotone fa-regular fa-users mr-1" />
                    {job.application_count ?? 0} apps
                </span>
            </div>

            {/* Tags: employment type + job level */}
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

            {/* Footer: company logo / initials left, actions right */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-base-200">
                <div className="flex items-center gap-2 min-w-0">
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

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <RoleActionsToolbar
                        job={job}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            viewDetails: false,
                            statusActions: true,
                            share: true,
                            viewPipeline: true,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
