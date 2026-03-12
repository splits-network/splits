"use client";

import type { Candidate } from "../../types";
import {
    formatVerificationStatus,
    formatJobType,
    formatAvailability,
} from "../../types";
import { statusColorName } from "../shared/status-color";
import { relationshipBadge, accountBadge } from "../shared/candidate-badges";
import { BaselBadge } from "@splits-network/basel-ui";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import {
    candidateName,
    candidateInitials,
    candidateTitle,
    candidateCompany,
    salaryDisplay,
    isNew,
    lastSeenAgo,
    skillsList,
} from "../shared/helpers";
import CandidateActionsToolbar from "../shared/actions-toolbar";
import {
    LevelBadge,
    useGamification,
} from "@splits-network/shared-gamification";
import { Presence } from "@/components/presense";
import { usePresence } from "@/hooks/use-presence";

const iconStyles = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-warning text-warning-content",
];

export function GridCard({
    candidate,
    isSelected,
    onSelect,
    onRefresh,
    onUpdateItem,
}: {
    candidate: Candidate;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Candidate>) => void;
}) {
    const { getLevel } = useGamification();
    const level = getLevel(candidate.id);
    const name = candidateName(candidate);
    const initials = candidateInitials(name);
    const title = candidateTitle(candidate);
    const company = candidateCompany(candidate);
    const salary = salaryDisplay(candidate);
    const skills = skillsList(candidate);
    const candidateUserId = candidate.user_id;
    const presence = usePresence([candidateUserId], {
        enabled: Boolean(candidateUserId),
    });

    const presenceStatus = candidateUserId
        ? presence[candidateUserId]?.status
        : undefined;
    const lastSeen = lastSeenAgo(
        candidateUserId ? presence[candidateUserId]?.lastSeenAt : null,
        candidate.last_active_at,
    );

    const stats = [
        {
            label: "Salary",
            value: salary || "N/A",
            icon: "fa-duotone fa-regular fa-dollar-sign",
        },
        {
            label: "Type",
            value: formatJobType(candidate.desired_job_type),
            icon: "fa-duotone fa-regular fa-briefcase",
        },
        {
            label: "Availability",
            value: formatAvailability(candidate.availability),
            icon: "fa-duotone fa-regular fa-clock",
        },
        {
            label: "Status",
            value: formatVerificationStatus(candidate.verification_status),
            icon: "fa-duotone fa-regular fa-shield-check",
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
                {/* Kicker row: company + badges */}
                <div className="flex items-center justify-between mb-3 gap-2">
                    {company && (
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 truncate min-w-0">
                            {company}
                        </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap ml-auto">
                        <BaselBadge
                            color={statusColorName(candidate.verification_status)}
                            variant="soft"
                            size="sm"
                        >
                            {formatVerificationStatus(candidate.verification_status)}
                        </BaselBadge>
                        {isNew(candidate) && (
                            <BaselBadge
                                color="warning"
                                variant="soft"
                                size="sm"
                                icon="fa-sparkles"
                            >
                                New
                            </BaselBadge>
                        )}
                        {(() => {
                            const acct = accountBadge(candidate);
                            return acct ? (
                                <BaselBadge color={acct.color} size="sm" icon={acct.icon}>
                                    {acct.label}
                                </BaselBadge>
                            ) : null;
                        })()}
                        {(() => {
                            const rel = relationshipBadge(candidate);
                            return rel ? (
                                <BaselBadge color={rel.color} size="sm" icon={rel.icon} variant={rel.variant}>
                                    {rel.label}
                                </BaselBadge>
                            ) : null;
                        })()}
                        <Presence
                            variant="badge"
                            size="sm"
                            status={presenceStatus}
                        />
                    </div>
                </div>

                {/* Avatar + Name block */}
                <div className="flex items-end gap-3">
                    <div className="relative shrink-0">
                        <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
                            {initials}
                        </div>
                        {level && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={level} size="sm" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Candidate
                        </p>
                        <h3 className="text-xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                            {candidate.is_saved && (
                                <i className="fa-solid fa-bookmark text-warning text-sm ml-2 align-middle" title="Saved" />
                            )}
                        </h3>
                    </div>
                </div>

                {/* Title + Location + date */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/40">
                    {title && (
                        <span className="flex items-center gap-1.5 truncate">
                            <i className="fa-duotone fa-regular fa-id-badge text-xs" />
                            {title}
                        </span>
                    )}
                    {title && (
                        <span className="text-base-content/20">|</span>
                    )}
                    <span className="flex items-center gap-1.5 truncate">
                        <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                        {candidate.location || "Location not specified"}
                    </span>
                    {lastSeen && (
                        <>
                            <span className="text-base-content/20">|</span>
                            <span className="flex items-center gap-1.5 shrink-0">
                                <i className="fa-duotone fa-regular fa-calendar text-xs" />
                                {lastSeen}
                            </span>
                        </>
                    )}
                </div>

                {/* Email */}
                {candidate.email && (
                    <div className="text-sm text-base-content/30 truncate mt-1">
                        {candidate.email}
                    </div>
                )}
            </div>

            {/* About snippet */}
            <div className="px-6 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
                    About
                </p>
                {candidate.bio ? (
                    <div className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        <MarkdownRenderer content={candidate.bio} />
                    </div>
                ) : (
                    <p className="text-sm text-base-content/20 italic">No bio added yet</p>
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
                    Skills
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

            {/* Preferences */}
            <div className="px-6 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    Preferences
                </p>
                {candidate.open_to_remote || candidate.open_to_relocation ? (
                    <div className="flex flex-wrap gap-1.5">
                        {candidate.open_to_remote && (
                            <BaselBadge color="primary" size="sm" icon="fa-house-laptop">
                                Remote
                            </BaselBadge>
                        )}
                        {candidate.open_to_relocation && (
                            <BaselBadge color="secondary" size="sm" icon="fa-truck-moving">
                                Relocatable
                            </BaselBadge>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-1.5">
                        <BaselBadge variant="outline" size="sm" icon="fa-building">
                            On-Site Only
                        </BaselBadge>
                    </div>
                )}
            </div>

            {/* Footer: actions */}
            <div className="mt-auto flex items-center justify-end px-6 py-4">
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <CandidateActionsToolbar
                        candidate={candidate}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        onUpdateItem={onUpdateItem}
                        showActions={{
                            viewDetails: false,
                        }}
                    />
                </div>
            </div>
        </article>
    );
}
