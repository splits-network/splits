"use client";

import type { Job } from "../../types";
import { formatJobLevel, formatCommuteTypes } from "../../types";
import { BaselBadge, BaselAvatar } from "@splits-network/basel-ui";
import {
    salaryDisplay,
    formatEmploymentType,
    isNew,
    companyName,
    companyInitials,
    isFirmJob,
    postedAgo,
    requiredSkillNames,
    truncateDescription,
    matchScoreTextColor,
} from "../shared/helpers";

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
    const logoUrl = job.company?.logo_url || job.firm?.logo_url;
    const firmJob = isFirmJob(job);
    const posted = postedAgo(job);
    const desc = truncateDescription(job, 140);
    const commute = formatCommuteTypes(job.commute_types);
    const score = job.match_score ?? null;

    // Inline metadata with semantic icons — always show all fields
    const metaItems: { icon: string; color: string; value: string; muted: boolean; tooltip: string }[] = [
        { icon: "fa-dollar-sign", color: "text-success", value: salary || "Not listed", muted: !salary, tooltip: "Salary range" },
        { icon: "fa-layer-group", color: "text-primary", value: jobLevel || "Not listed", muted: !jobLevel, tooltip: "Job level" },
        { icon: "fa-briefcase", color: "text-secondary", value: formatEmploymentType(job.employment_type), muted: !job.employment_type, tooltip: "Employment type" },
        { icon: "fa-building", color: "text-info", value: commute || "Not listed", muted: !commute, tooltip: "Work arrangement" },
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
                {/* Posted date */}
                <div className="flex items-center justify-end mb-3">
                    <span className="text-sm text-base-content/40 shrink-0">
                        {posted}
                    </span>
                </div>

                {/* Editorial block: Kicker → Display heading → Subtitle */}
                <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                        <BaselAvatar
                            initials={companyInitials(name)}
                            src={logoUrl}
                            alt={name}
                            size="md"
                        />
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
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                {metaItems.map((item, i) => (
                    <span key={i} className={`tooltip tooltip-bottom flex items-center gap-1 ${item.muted ? "text-base-content/30" : "text-base-content/50"}`} data-tip={item.tooltip}>
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

            {/* Badge row: emphasis (soft-outline) + default (soft) */}
            <div className="px-5 py-3 flex-1">
                <div className="flex flex-wrap gap-1.5">
                    {firmJob && (
                        <BaselBadge color="secondary" variant="soft-outline" size="sm" icon="fa-handshake">
                            3rd Party
                        </BaselBadge>
                    )}
                    {isNew(job) && (
                        <BaselBadge color="warning" variant="soft-outline" size="sm" icon="fa-sparkles">
                            New
                        </BaselBadge>
                    )}
                    {skills.slice(0, 4).map((skill) => (
                        <BaselBadge key={skill} variant="soft" color="neutral" size="sm">
                            {skill}
                        </BaselBadge>
                    ))}
                    {skills.length > 4 && (
                        <span className="text-sm font-semibold text-base-content/40 self-center">
                            +{skills.length - 4} more
                        </span>
                    )}
                    {!firmJob && !isNew(job) && skills.length === 0 && (
                        <span className="text-sm text-base-content/30">No details listed</span>
                    )}
                </div>
            </div>

            {/* Footer: industry tag */}
            <div className="px-5 py-3 border-t border-base-300">
                <span className={`text-sm truncate ${job.company?.industry ? "text-base-content/40" : "text-base-content/30"}`}>
                    {job.company?.industry || "Industry not specified"}
                </span>
            </div>
        </article>
    );
}
