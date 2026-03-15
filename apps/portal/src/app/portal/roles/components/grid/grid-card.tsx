"use client";

import type { Job } from "../../types";
import { formatJobLevel, formatCommuteTypes } from "../../types";
import { statusBadgeColor, statusBorder } from "../shared/status-color";
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
    const commute = formatCommuteTypes(job.commute_types);

    // Inline metadata — always show all 4 items, muted when empty
    const metaItems: { icon: string; color: string; value: string; muted: boolean }[] = [
        { icon: "fa-dollar-sign", color: "text-success", value: salary || "TBD", muted: !salary },
        { icon: "fa-handshake", color: "text-secondary", value: `${job.fee_percentage}%`, muted: false },
        { icon: "fa-coins", color: "text-accent", value: payout || "N/A", muted: !payout },
        { icon: "fa-users", color: "text-info", value: job.application_count !== undefined ? String(job.application_count) : "\u2014", muted: job.application_count === undefined },
    ];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-colors",
                isSelected
                    ? "border-primary border-l-primary"
                    : `${statusBorder(job.status)} hover:border-base-content/20`,
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                {/* Kicker row: status + modifier badges */}
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

                {/* Editorial block: Avatar + Company kicker → Title → Location */}
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
                </div>

                {/* Posted date — always shown */}
                <div className="mt-2.5">
                    <span className={`text-sm ${posted ? "text-base-content/40" : "text-base-content/20"}`}>
                        {posted || "No date"}
                    </span>
                </div>
            </div>

            {/* Inline metadata: salary · fee · payout · applicants */}
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
                {job.recruiter_description || job.description ? (
                    <div className="text-sm text-base-content/60 leading-relaxed line-clamp-2">
                        <MarkdownRenderer content={job.recruiter_description || job.description || ""} />
                    </div>
                ) : (
                    <p className="text-sm text-base-content/30">No description provided</p>
                )}
            </div>

            {/* Skills + detail badges */}
            <div className="px-5 py-3 border-b border-base-300">
                <div className="flex flex-wrap gap-1.5">
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
                    {commute && (
                        <BaselBadge color="info" size="sm" icon="fa-building">
                            {commute}
                        </BaselBadge>
                    )}
                    {skills.slice(0, 3).map((skill) => (
                        <BaselBadge key={skill} variant="outline" size="sm">
                            {skill}
                        </BaselBadge>
                    ))}
                    {skills.length > 3 && (
                        <span className="text-sm font-semibold text-base-content/40 self-center">
                            +{skills.length - 3} more
                        </span>
                    )}
                    {!job.employment_type && !level && !commute && skills.length === 0 && (
                        <span className="text-sm text-base-content/30">No details listed</span>
                    )}
                </div>
            </div>

            {/* Footer: industry + actions */}
            <div className="mt-auto flex items-center justify-between gap-3 px-5 py-3">
                <span className={`text-sm truncate ${job.company?.industry ? "text-base-content/40" : "text-base-content/30"}`}>
                    {job.company?.industry || "Industry not specified"}
                </span>

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
