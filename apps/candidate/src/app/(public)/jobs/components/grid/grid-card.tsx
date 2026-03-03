"use client";

import type { Job } from "../../types";
import { formatJobLevel } from "../../types";
import { statusSemanticColor } from "../shared/status-color";
import { BaselBadge } from "@splits-network/basel-ui";
import {
    salaryDisplay,
    formatEmploymentType,
    formatStatusLabel,
    isNew,
    companyName,
    companyInitials,
    truncateDescription,
    postedAgo,
    requiredSkillNames,
} from "../shared/helpers";
import {
    LevelBadge,
    useGamification,
} from "@splits-network/shared-gamification";

interface GridCardProps {
    job: Job;
    isSelected: boolean;
    onSelect: () => void;
}

export function GridCard({ job, isSelected, onSelect }: GridCardProps) {
    const name = companyName(job);
    const salary = salaryDisplay(job);
    const jobLevel = formatJobLevel(job.job_level);
    const desc = truncateDescription(job);
    const skills = requiredSkillNames(job);
    const { getLevel } = useGamification();
    const companyLevel = job.company?.id ? getLevel(job.company.id) : undefined;
    const posted = postedAgo(job);

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-all hover:shadow-md",
                isSelected
                    ? "border-l-primary border-primary"
                    : "border-l-primary",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-5 pb-4">
                {/* Kicker row: status + NEW badge */}
                <div className="flex items-center justify-between mb-3">
                    {job.company?.industry && (
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40">
                            {job.company.industry}
                        </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap ml-auto">
                        <BaselBadge
                            color={statusSemanticColor(job.status)}
                            size="sm"
                        >
                            {formatStatusLabel(job.status)}
                        </BaselBadge>
                        {isNew(job) && (
                            <BaselBadge
                                color="warning"
                                variant="soft"
                                size="sm"
                                icon="fa-sparkles"
                            >
                                New
                            </BaselBadge>
                        )}
                    </div>
                </div>

                {/* Avatar + Title block */}
                <div className="flex items-end gap-3">
                    <div className="relative shrink-0">
                        {job.company?.logo_url ? (
                            <img
                                src={job.company.logo_url}
                                alt={name}
                                className="w-14 h-14 object-contain bg-base-100 border border-base-300 p-1"
                            />
                        ) : (
                            <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
                                {companyInitials(name)}
                            </div>
                        )}
                        {companyLevel && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={companyLevel} size="sm" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Role
                        </p>
                        <h3 className="text-xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {job.title}
                        </h3>
                    </div>
                </div>

                {/* Location + posted date */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/40">
                    {job.location && (
                        <span className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                            {job.location}
                        </span>
                    )}
                    {job.location && posted && (
                        <span className="text-base-content/20">|</span>
                    )}
                    {posted && (
                        <span className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-calendar text-xs" />
                            {posted}
                        </span>
                    )}
                </div>
            </div>

            {/* Description */}
            {desc && (
                <div className="px-6 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
                        About
                    </p>
                    <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        {desc}
                    </p>
                </div>
            )}

            {/* Stats Row */}
            {salary && (
                <div className="border-b border-base-300">
                    <div className="grid grid-cols-1 divide-x divide-base-300">
                        <div className="flex flex-col items-center justify-center px-1.5 py-3 gap-1 text-center min-w-0 overflow-hidden">
                            <i className="fa-duotone fa-regular fa-dollar-sign text-primary text-sm" />
                            <span className="text-sm font-black text-base-content leading-none truncate w-full">
                                {salary}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none truncate w-full">
                                Salary
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <div className="px-6 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                        Required Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 4).map((skill) => (
                            <BaselBadge key={skill} variant="outline" size="sm">
                                {skill}
                            </BaselBadge>
                        ))}
                        {skills.length > 4 && (
                            <BaselBadge variant="outline" size="sm">
                                +{skills.length - 4}
                            </BaselBadge>
                        )}
                    </div>
                </div>
            )}

            {/* Detail Badges */}
            {(job.employment_type || jobLevel) && (
                <div className="px-6 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                        Details
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {job.employment_type && (
                            <BaselBadge color="primary" icon="fa-briefcase">
                                {formatEmploymentType(job.employment_type)}
                            </BaselBadge>
                        )}
                        {jobLevel && (
                            <BaselBadge color="secondary" icon="fa-layer-group">
                                {jobLevel}
                            </BaselBadge>
                        )}
                    </div>
                </div>
            )}

            {/* Footer: company info */}
            <div className="mt-auto flex items-center gap-3 px-6 py-4">
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-base-content truncate">
                        {name}
                    </div>
                    {job.company?.industry && (
                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 truncate">
                            {job.company.industry}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
