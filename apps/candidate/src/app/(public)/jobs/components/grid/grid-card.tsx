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
    matchScoreColor,
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
            {/* Title — full wrap, no truncation */}
            <div className="px-5 pt-5 pb-3">
                <h3 className="text-lg font-black tracking-tight leading-tight text-base-content group-hover:text-primary transition-colors">
                    {job.title}
                </h3>

                {/* Location · date · match score */}
                <div className="flex items-center gap-2 mt-2 text-sm text-base-content/50 flex-wrap">
                    <span className={job.location ? "" : "text-base-content/30"}>
                        <i className="fa-duotone fa-regular fa-location-dot text-xs mr-1" />
                        {job.location || "Not specified"}
                    </span>
                    <span className="text-base-content/20">·</span>
                    <span className="text-base-content/40">{posted}</span>
                    {score !== null && (
                        <>
                            <span className="text-base-content/20">·</span>
                            <BaselBadge color={matchScoreColor(score)} variant="soft" size="xs">
                                {Math.round(score)}% Match
                            </BaselBadge>
                        </>
                    )}
                </div>
            </div>

            {/* Inline metadata: salary · level · type · commute */}
            <div className="px-5 py-2.5 border-y border-base-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
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

            {/* Badge row */}
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

            {/* Footer: company info */}
            <div className="px-5 py-3 border-t border-base-300 flex items-center gap-2.5">
                <BaselAvatar
                    initials={companyInitials(name)}
                    src={logoUrl}
                    alt={name}
                    size="xs"
                />
                <span className="text-sm font-semibold text-base-content/60 truncate">
                    {name}
                </span>
                {job.company?.industry && (
                    <>
                        <span className="text-base-content/20">·</span>
                        <span className="text-sm text-base-content/40 truncate">
                            {job.company.industry}
                        </span>
                    </>
                )}
            </div>
        </article>
    );
}
