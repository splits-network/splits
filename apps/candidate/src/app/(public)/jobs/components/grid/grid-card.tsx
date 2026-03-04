"use client";

import type { Job } from "../../types";
import { formatJobLevel, formatCommuteTypes } from "../../types";
import { statusSemanticColor } from "../shared/status-color";
import { BaselBadge } from "@splits-network/basel-ui";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import {
    salaryDisplay,
    formatEmploymentType,
    formatStatusLabel,
    isNew,
    companyName,
    companyInitials,
    postedAgo,
    requiredSkillNames,
} from "../shared/helpers";
import {
    LevelBadge,
    useGamification,
} from "@splits-network/shared-gamification";

const iconStyles = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-warning text-warning-content",
];

interface GridCardProps {
    job: Job;
    isSelected: boolean;
    onSelect: () => void;
}

export function GridCard({ job, isSelected, onSelect }: GridCardProps) {
    const name = companyName(job);
    const salary = salaryDisplay(job);
    const jobLevel = formatJobLevel(job.job_level);
    const skills = requiredSkillNames(job);
    const { getLevel } = useGamification();
    const companyLevel = job.company?.id ? getLevel(job.company.id) : undefined;
    const posted = postedAgo(job);
    const desc = job.candidate_description || job.description;
    const commute = formatCommuteTypes(job.commute_types);

    const stats = [
        {
            label: "Salary",
            value: salary || "TBD",
            icon: "fa-duotone fa-regular fa-dollar-sign",
        },
        {
            label: "Level",
            value: jobLevel || "N/A",
            icon: "fa-duotone fa-regular fa-layer-group",
        },
        {
            label: "Type",
            value: formatEmploymentType(job.employment_type),
            icon: "fa-duotone fa-regular fa-briefcase",
        },
        {
            label: "Commute",
            value: commute || "N/A",
            icon: "fa-duotone fa-regular fa-building",
        },
    ];

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
                {/* Kicker row: industry + status badges */}
                <div className="flex items-center justify-between mb-3">
                    {job.company?.industry && (
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40">
                            {job.company.industry}
                        </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap ml-auto">
                        <BaselBadge
                            color={statusSemanticColor(job.status)}
                            variant="soft"
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

            {/* About snippet */}
            <div className="px-6 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
                    About
                </p>
                {desc ? (
                    <div className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        <MarkdownRenderer content={desc} />
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No description added yet</p>
                )}
            </div>

            {/* Stats Grid */}
            <div className="border-b border-base-300">
                <div className="grid grid-cols-2 divide-x divide-y divide-base-300">
                    {stats.map((stat, i) => (
                        <div
                            key={stat.label}
                            className="flex items-center gap-2 px-2 py-3 min-w-0 overflow-hidden"
                        >
                            <div
                                className={`w-7 h-7 flex items-center justify-center shrink-0 ${iconStyles[i % iconStyles.length]}`}
                            >
                                <i className={`${stat.icon} text-xs`} />
                            </div>
                            <div className="min-w-0">
                                <span className="text-sm font-black text-base-content leading-none block truncate">
                                    {stat.value}
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none truncate block">
                                    {stat.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div className="px-6 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    Required Skills
                </p>
                {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 4).map((skill) => (
                            <BaselBadge key={skill} variant="outline" size="sm">
                                {skill}
                            </BaselBadge>
                        ))}
                        {skills.length > 4 && (
                            <span className="text-sm font-semibold text-base-content/40 self-center">
                                +{skills.length - 4} more
                            </span>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No skills listed</p>
                )}
            </div>

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
