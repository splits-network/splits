"use client";

import Link from "next/link";
import type { Recruiter } from "../marketplace-client";
import { getInitials } from "./status-color";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import { BaselBadge, BaselAvatar, BaselLevelIndicator } from "@splits-network/basel-ui";
import { useGamification } from "@splits-network/shared-gamification";
import { usePresenceStatus } from "@/contexts";

interface GridCardProps {
    recruiter: Recruiter;
    isSelected?: boolean;
    onSelect?: (recruiter: Recruiter) => void;
}

function memberSinceDisplay(recruiter: Recruiter) {
    if (!recruiter.created_at) return null;
    const date = new Date(recruiter.created_at);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function isNew(recruiter: Recruiter) {
    if (!recruiter.created_at) return false;
    const created = new Date(recruiter.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created > thirtyDaysAgo;
}

function placementsDisplay(recruiter: Recruiter) {
    if (recruiter.total_placements == null) return "\u2014";
    return String(recruiter.total_placements);
}

function successRateDisplay(recruiter: Recruiter) {
    if (recruiter.success_rate == null) return null;
    return `${Math.round(recruiter.success_rate)}%`;
}

function reputationDisplay(recruiter: Recruiter) {
    if (recruiter.reputation_score == null) return null;
    return recruiter.reputation_score.toFixed(1);
}

function experienceDisplay(recruiter: Recruiter) {
    if (recruiter.years_experience == null || recruiter.years_experience <= 0) return null;
    return `${recruiter.years_experience}yr`;
}

export default function GridCard({
    recruiter,
    isSelected,
    onSelect,
}: GridCardProps) {
    const { getLevel } = useGamification();
    const level = getLevel(recruiter.id);
    const presenceData = usePresenceStatus(recruiter.users?.id);
    const presenceStatus = presenceData?.status;
    const name = recruiter.users?.name || recruiter.name || "Unknown Recruiter";
    const location = recruiter.location;
    const memberSince = memberSinceDisplay(recruiter);

    const successRate = successRateDisplay(recruiter);
    const reputation = reputationDisplay(recruiter);
    const experience = experienceDisplay(recruiter);

    const metaItems: { icon: string; color: string; value: string; muted: boolean; tooltip: string }[] = [
        { icon: "fa-handshake", color: "text-success", value: placementsDisplay(recruiter), muted: recruiter.total_placements == null, tooltip: "Total placements" },
        { icon: "fa-bullseye", color: "text-primary", value: successRate || "\u2014", muted: !successRate, tooltip: "Hire success rate" },
        { icon: "fa-star", color: "text-warning", value: reputation || "\u2014", muted: !reputation, tooltip: "Reputation score" },
        { icon: "fa-clock", color: "text-info", value: experience || "\u2014", muted: !experience, tooltip: "Years of experience" },
    ];

    const specialties = recruiter.specialties || [];
    const industries = recruiter.industries || [];

    return (
        <article
            onClick={() => onSelect?.(recruiter)}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-colors",
                isSelected
                    ? "border-primary border-l-primary"
                    : "border-l-primary hover:border-base-content/20",
            ].join(" ")}
        >
            {/* Zone 1: Header Band */}
            <div className="relative bg-base-300 px-5 pt-4 pb-4">
                {/* Modifier badges */}
                {isNew(recruiter) && (
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                        <BaselBadge color="warning" variant="soft" size="sm" icon="fa-sparkles">
                            New
                        </BaselBadge>
                    </div>
                )}

                {/* Editorial block: Avatar + Firm kicker + Name + Location */}
                <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                        <BaselAvatar
                            initials={getInitials(name)}
                            src={recruiter.users?.profile_image_url}
                            alt={name}
                            size="md"
                            presence={presenceStatus}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            {recruiter.firm_name || "Independent"}
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                        <p className={`text-sm truncate mt-0.5 ${location ? "text-base-content/50" : "text-base-content/30"}`}>
                            {location ? (
                                <span className="flex items-center gap-1.5">
                                    <i className="fa-duotone fa-regular fa-location-dot" />
                                    {location}
                                </span>
                            ) : (
                                "No location specified"
                            )}
                        </p>
                    </div>
                </div>

                {/* Member since — always shown */}
                <div className="mt-2.5">
                    <span className={`text-sm ${memberSince ? "text-base-content/40" : "text-base-content/20"}`}>
                        {memberSince ? `Member since ${memberSince}` : "Join date unknown"}
                    </span>
                </div>
            </div>

            {/* Zone 2: Inline metadata bar */}
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                {level && (
                    <BaselLevelIndicator level={level.current_level} title={level.title} totalXp={level.total_xp} xpToNextLevel={level.xp_to_next_level} />
                )}
                {metaItems.map((item, i) => (
                    <span key={i} className={`tooltip tooltip-bottom flex items-center gap-1 ${item.muted ? "text-base-content/30" : "text-base-content/50"}`} data-tip={item.tooltip}>
                        <i className={`fa-duotone fa-regular ${item.icon} ${item.muted ? "text-base-content/20" : item.color} text-xs`} />
                        <span className="truncate">{item.value}</span>
                    </span>
                ))}
            </div>

            {/* Zone 3: About snippet */}
            <div className="px-5 py-3 border-b border-base-300">
                {recruiter.bio ? (
                    <div className="text-sm text-base-content/60 leading-relaxed line-clamp-2">
                        <MarkdownRenderer content={recruiter.bio} />
                    </div>
                ) : (
                    <p className="text-sm text-base-content/30">No bio provided</p>
                )}
            </div>

            {/* Zone 4: Tags — partnership + specialties + industries */}
            <div className="px-5 py-3 border-b border-base-300">
                <div className="flex flex-wrap gap-1.5">
                    {recruiter.company_recruiter && (
                        <BaselBadge color="primary" size="sm" icon="fa-building">
                            Company
                        </BaselBadge>
                    )}
                    {recruiter.candidate_recruiter && (
                        <BaselBadge color="secondary" size="sm" icon="fa-user-tie">
                            Candidate
                        </BaselBadge>
                    )}
                    {specialties.slice(0, 3).map((spec) => (
                        <BaselBadge key={spec} variant="outline" size="sm">
                            {spec}
                        </BaselBadge>
                    ))}
                    {specialties.length > 3 && (
                        <span className="text-sm font-semibold text-base-content/40 self-center">
                            +{specialties.length - 3} more
                        </span>
                    )}
                    {industries.slice(0, 2).map((ind) => (
                        <BaselBadge key={ind} color="info" variant="soft" size="sm">
                            {ind}
                        </BaselBadge>
                    ))}
                    {industries.length > 2 && (
                        <span className="text-sm font-semibold text-base-content/40 self-center">
                            +{industries.length - 2}
                        </span>
                    )}
                    {!recruiter.company_recruiter && !recruiter.candidate_recruiter && specialties.length === 0 && industries.length === 0 && (
                        <span className="text-sm text-base-content/30">No details listed</span>
                    )}
                </div>
            </div>

            {/* Zone 5: Footer — profile link */}
            <div
                className="mt-auto flex items-center justify-between gap-3 px-5 py-3"
                onClick={(e) => e.stopPropagation()}
            >
                <Link
                    href={`/marketplace/${recruiter.slug || recruiter.id}`}
                    className="text-sm font-semibold text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
                >
                    View Profile
                    <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-xs" />
                </Link>
            </div>
        </article>
    );
}
