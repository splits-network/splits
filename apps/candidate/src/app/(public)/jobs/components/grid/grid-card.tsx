"use client";

import type { Job } from "../../types";
import { formatJobLevel, formatCommuteTypes } from "../../types";
import { BaselBadge } from "@splits-network/basel-ui";
import {
    salaryDisplay,
    formatEmploymentType,
    isNew,
    companyName,
    companyInitials,
    postedAgo,
    requiredSkillNames,
    truncateDescription,
    matchScoreTextColor,
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
    const skills = requiredSkillNames(job);
    const { getLevel } = useGamification();
    const companyLevel = job.company?.id ? getLevel(job.company.id) : undefined;
    const posted = postedAgo(job);
    const desc = truncateDescription(job, 140);
    const commute = formatCommuteTypes(job.commute_types);
    const score = job.match_score ?? null;

    // Inline metadata with semantic icons — always show all fields
    const metaItems: { icon: string; color: string; value: string; muted: boolean }[] = [
        { icon: "fa-dollar-sign", color: "text-success", value: salary || "Not listed", muted: !salary },
        { icon: "fa-layer-group", color: "text-primary", value: jobLevel || "Not listed", muted: !jobLevel },
        { icon: "fa-briefcase", color: "text-secondary", value: formatEmploymentType(job.employment_type), muted: !job.employment_type },
        { icon: "fa-building", color: "text-info", value: commute || "Not listed", muted: !commute },
    ];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border transition-colors",
                isSelected
                    ? "border-primary"
                    : "border-base-300 hover:border-base-content/20",
            ].join(" ")}
        >
            {/* Header */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                {/* Status bar */}
                <div className="flex items-center gap-2 mb-3">
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
                    <span className="text-sm text-base-content/40 ml-auto shrink-0">
                        {posted}
                    </span>
                </div>

                {/* Editorial block: Kicker → Display heading → Subtitle */}
                <div className="flex items-start gap-3">
                    <div className="relative shrink-0 mt-0.5">
                        {job.company?.logo_url ? (
                            <img
                                src={job.company.logo_url}
                                alt={name}
                                className="w-12 h-12 object-contain bg-base-100 border border-base-300 p-0.5"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center text-sm font-black tracking-tight select-none">
                                {companyInitials(name)}
                            </div>
                        )}
                        {companyLevel && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={companyLevel} size="sm" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            {name}
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {job.title}
                        </h3>
                        <p className={`text-sm truncate mt-0.5 ${job.location ? "text-base-content/50" : "text-base-content/30"}`}>
                            {job.location || "Location not specified"}
                        </p>
                    </div>
                    {/* Match score */}
                    <div className="text-right shrink-0 pl-2 pt-0.5">
                        {score !== null ? (
                            <>
                                <span className={`text-xl font-black leading-none ${matchScoreTextColor(score)}`}>
                                    {Math.round(score)}%
                                </span>
                                <span className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/30 block mt-0.5">
                                    Match
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-xl font-black leading-none text-base-content/20">
                                    &mdash;
                                </span>
                                <span className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/20 block mt-0.5">
                                    Match
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Inline metadata: salary · level · type · commute */}
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex items-center gap-3 overflow-hidden">
                {metaItems.map((item, i) => (
                    <span key={i} className={`flex items-center gap-1 shrink-0 ${item.muted ? "text-base-content/30" : "text-base-content/50"}`}>
                        <i className={`fa-duotone fa-regular ${item.icon} ${item.muted ? "text-base-content/20" : item.color} text-xs`} />
                        <span className="truncate">{item.value}</span>
                    </span>
                ))}
            </div>

            {/* About snippet */}
            <div className="px-5 py-3 border-b border-base-300">
                <p className={`text-sm leading-relaxed line-clamp-2 ${desc ? "text-base-content/60" : "text-base-content/30"}`}>
                    {desc || "No description provided"}
                </p>
            </div>

            {/* Skills */}
            <div className="px-5 py-3 border-b border-base-300">
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
                    <span className="text-sm text-base-content/30">No skills listed</span>
                )}
            </div>

            {/* Footer: industry tag */}
            <div className="mt-auto px-5 py-3">
                <span className={`text-sm truncate ${job.company?.industry ? "text-base-content/40" : "text-base-content/30"}`}>
                    {job.company?.industry || "Industry not specified"}
                </span>
            </div>
        </article>
    );
}
