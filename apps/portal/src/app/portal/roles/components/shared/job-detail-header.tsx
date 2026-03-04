"use client";

import type { Job } from "../../types";
import { formatJobLevel } from "../../types";
import { statusBadgeColor } from "./status-color";
import {
    salaryDisplay,
    formatEmploymentType,
    formatStatus,
    isNew,
    companyName,
    companyInitials,
} from "./helpers";
import { BaselBadge } from "@splits-network/basel-ui";
import RoleActionsToolbar from "./actions-toolbar";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";

/* ─── Hero Header ────────────────────────────────────────────────────────── */

export function JobHeroHeader({
    job,
    onClose,
    onRefresh,
    onUpdateItem,
}: {
    job: Job;
    onClose?: () => void;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Job>) => void;
}) {
    const { getLevel } = useGamification();
    const name = companyName(job);
    const salary = salaryDisplay(job);
    const level = formatJobLevel(job.job_level);
    const companyLevel = job.company_id ? getLevel(job.company_id) : undefined;

    const stats = [
        { label: "Compensation", value: salary || "N/A", icon: "fa-duotone fa-regular fa-sack-dollar" },
        { label: "Fee", value: `${job.fee_percentage}%`, icon: "fa-duotone fa-regular fa-percent" },
        { label: "Candidates", value: String(job.application_count ?? 0), icon: "fa-duotone fa-regular fa-users" },
    ];

    return (
        <header className="relative bg-neutral text-neutral-content border-l-4 border-l-primary">
            {/* Diagonal accent */}
            <div
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{ clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)" }}
            />

            <div className="relative px-6 pt-6 pb-0">
                {/* Close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 btn btn-sm btn-square btn-ghost text-neutral-content/60 hover:text-neutral-content z-10"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                )}

                {/* Kicker row: department/company + badges */}
                <div className="flex items-center justify-between mb-6 pr-10">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-content/40 truncate">
                        {job.department || name}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        <BaselBadge color={statusBadgeColor(job.status)} variant="soft" size="sm">
                            {formatStatus(job.status)}
                        </BaselBadge>
                        {isNew(job) && (
                            <BaselBadge color="warning" variant="soft" size="sm" icon="fa-sparkles">
                                New
                            </BaselBadge>
                        )}
                        {job.employment_type && (
                            <BaselBadge color="neutral" variant="soft" size="sm">
                                {formatEmploymentType(job.employment_type)}
                            </BaselBadge>
                        )}
                        {level && (
                            <BaselBadge color="neutral" variant="soft" size="sm">
                                {level}
                            </BaselBadge>
                        )}
                    </div>
                </div>

                {/* Avatar + Title */}
                <div className="flex items-end gap-5">
                    <div className="relative shrink-0">
                        {job.company?.logo_url ? (
                            <img
                                src={job.company.logo_url}
                                alt={name}
                                className="w-20 h-20 object-contain border-2 border-primary"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-primary text-primary-content flex items-center justify-center text-2xl font-black tracking-tight select-none">
                                {companyInitials(name)}
                            </div>
                        )}
                        {companyLevel && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={companyLevel} size="sm" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 pb-1">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-1 truncate">
                            {name}
                        </p>
                        <h2 className="text-3xl font-black tracking-tight leading-none text-neutral-content mb-2 truncate">
                            {job.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-content/40">
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-building text-xs" />
                                {name}
                            </span>
                            {job.location && (
                                <>
                                    <span className="text-neutral-content/20">|</span>
                                    <span className="flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                                        {job.location}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions toolbar */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <RoleActionsToolbar
                        job={job}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                        onUpdateItem={onUpdateItem}
                        showActions={{ viewDetails: false }}
                    />
                </div>

                {/* Stats strip */}
                <div
                    className="grid divide-x divide-neutral-content/10 border-t border-neutral-content/10 mt-6"
                    style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
                >
                    {stats.map((stat, i) => {
                        const iconStyles = [
                            "bg-primary text-primary-content",
                            "bg-secondary text-secondary-content",
                            "bg-accent text-accent-content",
                            "bg-warning text-warning-content",
                        ];
                        const iconStyle = iconStyles[i % iconStyles.length];
                        return (
                            <div key={stat.label} className="flex items-center gap-2.5 px-3 py-4">
                                <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${iconStyle}`}>
                                    <i className={`${stat.icon} text-sm`} />
                                </div>
                                <div>
                                    <span className="text-lg font-black text-neutral-content leading-none block">
                                        {stat.value}
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-content/40 leading-none">
                                        {stat.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}
