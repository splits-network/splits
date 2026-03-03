"use client";

import type { Candidate } from "../../types";
import {
    formatVerificationStatus,
    formatJobType,
    formatAvailability,
} from "../../types";
import { statusColorName } from "../shared/status-color";
import { BaselBadge } from "@splits-network/basel-ui";
import {
    candidateName,
    candidateInitials,
    candidateTitle,
    candidateCompany,
    salaryDisplay,
    isNew,
    skillsList,
} from "../shared/helpers";
import CandidateActionsToolbar from "../shared/actions-toolbar";
import {
    LevelBadge,
    useGamification,
} from "@splits-network/shared-gamification";

export function GridCard({
    candidate,
    isSelected,
    onSelect,
    onRefresh,
}: {
    candidate: Candidate;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { getLevel } = useGamification();
    const level = getLevel(candidate.id);
    const name = candidateName(candidate);
    const initials = candidateInitials(name);
    const title = candidateTitle(candidate);
    const company = candidateCompany(candidate);
    const salary = salaryDisplay(candidate);
    const skills = skillsList(candidate);

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
    ];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 w-full transition-all hover:shadow-md",
                isSelected
                    ? "border-l-primary shadow-md"
                    : "border-l-primary/40 shadow-sm",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-5 pt-5 pb-4">
                {/* Kicker row: verification status + NEW badge + availability dot */}
                <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <BaselBadge
                            color={statusColorName(candidate.verification_status)}
                            variant="soft"
                            size="sm"
                        >
                            {formatVerificationStatus(
                                candidate.verification_status
                            )}
                        </BaselBadge>
                        {isNew(candidate) && (
                            <BaselBadge color="warning" variant="soft" size="sm" icon="fa-sparkles">
                                New
                            </BaselBadge>
                        )}
                    </div>
                    {company && (
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 truncate min-w-0">
                            {company}
                        </p>
                    )}
                </div>

                {/* Avatar + Name block */}
                <div className="flex items-end gap-3">
                    <div className="relative shrink-0">
                        <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
                            {initials}
                        </div>
                        {level && (
                            <span className="absolute -bottom-1 -right-1">
                                <LevelBadge level={level} size="sm" />
                            </span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Candidate
                        </p>
                        <h3 className="text-2xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                    </div>
                </div>

                {/* Title + Location below header */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/40 flex-wrap">
                    {title && (
                        <>
                            <span className="flex items-center gap-1.5 truncate">
                                <i className="fa-duotone fa-regular fa-id-badge text-xs" />
                                {title}
                            </span>
                            <span className="text-base-content/20">|</span>
                        </>
                    )}
                    <span className="flex items-center gap-1.5 truncate">
                        <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                        {candidate.location || "Location not specified"}
                    </span>
                </div>

                {/* Email */}
                {candidate.email && (
                    <div className="text-sm text-base-content/30 truncate mt-1">
                        {candidate.email}
                    </div>
                )}
            </div>

            {/* About snippet */}
            {candidate.bio && (
                <div className="px-5 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
                        About
                    </p>
                    <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        {candidate.bio}
                    </p>
                </div>
            )}

            {/* Stats Row */}
            <div className="border-b border-base-300">
                <div className="grid grid-cols-3 divide-x divide-base-300">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex flex-col items-center justify-center px-1.5 py-3 gap-1 text-center min-w-0 overflow-hidden"
                        >
                            <i
                                className={`${stat.icon} text-primary text-sm`}
                            />
                            <span className="text-sm font-black leading-none truncate w-full text-base-content">
                                {stat.value}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none truncate w-full">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
                <div className="px-5 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                        Skills
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

            {/* Preference Badges + Actions */}
            <div className="px-5 py-4 mt-auto flex items-center justify-between gap-3">
                <div className="flex flex-col gap-2 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30">
                        Preferences
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {candidate.open_to_remote && (
                            <BaselBadge color="primary" icon="fa-house-laptop">
                                Remote
                            </BaselBadge>
                        )}
                        {candidate.open_to_relocation && (
                            <BaselBadge color="secondary" icon="fa-truck-moving">
                                Relocatable
                            </BaselBadge>
                        )}
                        {!candidate.open_to_remote && !candidate.open_to_relocation && (
                            <BaselBadge variant="outline" icon="fa-building" className="opacity-30">
                                On-Site
                            </BaselBadge>
                        )}
                    </div>
                </div>
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <CandidateActionsToolbar
                        candidate={candidate}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            viewDetails: false,
                        }}
                    />
                </div>
            </div>
        </article>
    );
}
