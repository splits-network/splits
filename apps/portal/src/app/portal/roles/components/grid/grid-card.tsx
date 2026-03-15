"use client";

import type { Job } from "../../types";
import { formatJobLevel } from "../../types";
import { statusBadgeColor } from "../shared/status-color";
import { BaselBadge } from "@splits-network/basel-ui";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import {
    salaryDisplay,
    formatStatus,
    formatEmploymentType,
    isNew,
    companyName,
    companyInitials,
    estimatedPayoutRange,
    postedAgo,
    requiredSkillNames,
} from "../shared/helpers";
import RoleActionsToolbar from "../shared/actions-toolbar";
import { SaveBookmark } from "@/components/save-bookmark";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import { useUserProfile } from "@/contexts/user-profile-context";

export function GridCard({
    job,
    isSelected,
    onSelect,
    onRefresh,
    onUpdateItem,
}: {
    job: Job;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Job>) => void;
}) {
    const { isRecruiter } = useUserProfile();
    const { getLevel } = useGamification();
    const companyLevel = job.company_id ? getLevel(job.company_id) : undefined;
    const name = companyName(job);
    const salary = salaryDisplay(job);
    const level = formatJobLevel(job.job_level);
    const payout = estimatedPayoutRange(job);
    const posted = postedAgo(job);
    const skills = requiredSkillNames(job);

    const stats = [
        {
            label: "Salary",
            value: salary || "TBD",
            icon: "fa-duotone fa-regular fa-dollar-sign",
        },
        {
            label: "Split Fee",
            value: `${job.fee_percentage}%`,
            icon: "fa-duotone fa-regular fa-handshake",
        },
        ...(payout
            ? [
                  {
                      label: "Est. Payout",
                      value: payout,
                      icon: "fa-duotone fa-regular fa-coins",
                  },
              ]
            : []),
        ...(job.application_count !== undefined
            ? [
                  {
                      label: "Applicants",
                      value: String(job.application_count),
                      icon: "fa-duotone fa-regular fa-users",
                  },
              ]
            : []),
    ];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-shadow hover:shadow-md",
                isSelected ? "border-l-primary border-primary" : "border-l-primary",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-5 pb-4">
                {/* Kicker row: status + NEW badge */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <BaselBadge color={statusBadgeColor(job.status)} variant="soft" size="sm">
                            {formatStatus(job.status)}
                        </BaselBadge>

                        {job.is_early_access && (
                            <BaselBadge color="accent" variant="soft" size="sm" icon="fa-lock-open">
                                Early Access
                            </BaselBadge>
                        )}

                        {job.is_priority && (
                            <BaselBadge color="primary" variant="soft" size="sm" icon="fa-star">
                                Priority
                            </BaselBadge>
                        )}

                        {isNew(job) && (
                            <BaselBadge color="warning" variant="soft" size="sm" icon="fa-sparkles">
                                New
                            </BaselBadge>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {!job.company_id && job.source_firm_id && (
                            <BaselBadge color="warning" variant="soft" size="sm">
                                3rd Party
                            </BaselBadge>
                        )}
                        {isRecruiter && (
                            <SaveBookmark
                                entityType="job"
                                entityId={job.id}
                                isSaved={!!job.is_saved}
                                savedRecordId={job.saved_record_id ?? null}
                                size="sm"
                                onToggle={(saved, recordId) => onUpdateItem?.(job.id, { is_saved: saved, saved_record_id: recordId })}
                            />
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
                {job.recruiter_description || job.description ? (
                    <div className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        <MarkdownRenderer content={job.recruiter_description || job.description || ""} />
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No description added yet</p>
                )}
            </div>

            {/* Stats Grid */}
            {stats.length > 0 && (
                <div className="border-b border-base-300">
                    <div className="grid grid-cols-2 divide-x divide-y divide-base-300">
                        {stats.map((stat, i) => {
                            const iconStyles = [
                                "bg-primary text-primary-content",
                                "bg-secondary text-secondary-content",
                                "bg-accent text-accent-content",
                                "bg-warning text-warning-content",
                            ];
                            return (
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
                            );
                        })}
                    </div>
                </div>
            )}

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
                            <BaselBadge variant="outline" size="sm">
                                +{skills.length - 4}
                            </BaselBadge>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No skills listed</p>
                )}
            </div>

            {/* Detail Badges */}
            <div className="px-6 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    Details
                </p>
                {job.employment_type || level ? (
                    <div className="flex flex-wrap gap-2">
                        {job.employment_type && (
                            <BaselBadge color="primary" size="sm" icon="fa-briefcase">
                                {formatEmploymentType(job.employment_type)}
                            </BaselBadge>
                        )}
                        {level && (
                            <BaselBadge color="secondary" size="sm" icon="fa-layer-group">
                                {level}
                            </BaselBadge>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No details available</p>
                )}
            </div>

            {/* Footer: company name + actions */}
            <div className="mt-auto flex items-center justify-between gap-3 px-6 py-4">
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

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <RoleActionsToolbar
                        job={job}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        onUpdateItem={onUpdateItem}
                        showActions={{
                            viewDetails: false,
                            statusActions: true,
                            share: true,
                            viewPipeline: true,
                        }}
                    />
                </div>
            </div>
        </article>
    );
}
