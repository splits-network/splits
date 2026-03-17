"use client";

import Link from "next/link";
import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
import { statusBorder } from "../shared/status-color";
import { BaselBadge, BaselAvatar, BaselLevelIndicator } from "@splits-network/basel-ui";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import {
    recruiterLocation,
    formatStatus,
    placementsDisplay,
    successRateDisplay,
    reputationDisplay,
    experienceDisplay,
    memberSinceDisplay,
    isNew,
} from "../shared/helpers";
import RecruiterActionsToolbar from "../shared/actions-toolbar";
import { usePresenceStatus } from "@/contexts";
import {
    useGamification,
} from "@splits-network/shared-gamification";
import { PlanBadge } from "@/components/entitlements/plan-badge";
import type { PlanTier } from "@/contexts/user-profile-context";

export function GridCard({
    recruiter,
    isSelected,
    onSelect,
    onRefresh,
}: {
    recruiter: RecruiterWithUser;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { getLevel } = useGamification();
    const level = getLevel(recruiter.id);
    const name = getDisplayName(recruiter);
    const location = recruiterLocation(recruiter);
    const status = recruiter.status || "active";
    const memberSince = memberSinceDisplay(recruiter);
    const recruiterUserId = recruiter.users?.id;
    const presenceData = usePresenceStatus(recruiterUserId);
    const presenceStatus = presenceData?.status;

    const successRate = successRateDisplay(recruiter);
    const reputation = reputationDisplay(recruiter);
    const experience = experienceDisplay(recruiter);

    // Inline metadata — always show all 4, muted when empty
    const metaItems: { icon: string; color: string; value: string; muted: boolean; tooltip: string }[] = [
        { icon: "fa-handshake", color: "text-success", value: placementsDisplay(recruiter), muted: false, tooltip: "Total placements" },
        { icon: "fa-bullseye", color: "text-primary", value: successRate || "\u2014", muted: !successRate, tooltip: "Hire success rate" },
        { icon: "fa-star", color: "text-warning", value: reputation || "\u2014", muted: !reputation, tooltip: "Reputation score" },
        { icon: "fa-clock", color: "text-info", value: experience || "\u2014", muted: !experience, tooltip: "Years of experience" },
    ];

    const specialties = recruiter.specialties || [];
    const industries = recruiter.industries || [];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-colors",
                isSelected
                    ? "border-primary border-l-primary"
                    : `${statusBorder(status)} hover:border-base-content/20`,
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="relative bg-base-300 px-5 pt-4 pb-4">
                {/* Kicker row: status + modifier badges */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                    <BaselBadge color={status === "active" ? "success" : status === "pending" ? "warning" : status === "suspended" ? "error" : "neutral"} variant="soft" size="sm">
                        {formatStatus(status)}
                    </BaselBadge>

                    {recruiter.plan_tier && (
                        <PlanBadge tier={recruiter.plan_tier as PlanTier} />
                    )}

                    {isNew(recruiter) && (
                        <BaselBadge color="warning" variant="soft" size="sm" icon="fa-sparkles">
                            New
                        </BaselBadge>
                    )}
                </div>

                {/* Editorial block: Avatar + Firm kicker → Name → Location */}
                <div className="flex items-start gap-3">
                    <BaselAvatar
                        initials={getInitials(name)}
                        src={recruiter.users?.profile_image_url}
                        alt={name}
                        size="md"
                        presence={presenceStatus}
                        className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            {recruiter.firm_name || "Independent"}
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                        <p className={`text-sm truncate mt-0.5 ${location ? "text-base-content/50" : "text-base-content/30"}`}>
                            {location || "No location specified"}
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

            {/* Inline metadata: placements · success · rating · experience */}
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                {level && (
                    <>
                        <BaselLevelIndicator level={level.current_level} title={level.title} totalXp={level.total_xp} />
                        <span className="text-base-content/20">&middot;</span>
                    </>
                )}
                {metaItems.map((item, i) => (
                    <span key={i} className={`tooltip tooltip-bottom flex items-center gap-1 ${item.muted ? "text-base-content/30" : "text-base-content/50"}`} data-tip={item.tooltip}>
                        <i className={`fa-duotone fa-regular ${item.icon} ${item.muted ? "text-base-content/20" : item.color} text-xs`} />
                        <span className="truncate">{item.value}</span>
                    </span>
                ))}
            </div>

            {/* About snippet */}
            <div className="px-5 py-3 border-b border-base-300">
                {recruiter.bio ? (
                    <div className="text-sm text-base-content/60 leading-relaxed line-clamp-2">
                        <MarkdownRenderer content={recruiter.bio} />
                    </div>
                ) : (
                    <p className="text-sm text-base-content/30">No bio provided</p>
                )}
            </div>

            {/* Tags: partnership + specialties + industries */}
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

            {/* Footer: profile link + actions */}
            <div
                className="mt-auto flex items-center justify-between gap-3 px-5 py-3"
                onClick={(e) => e.stopPropagation()}
            >
                <Link
                    href={`/recruiters/${recruiter.slug || recruiter.id}`}
                    className="text-sm font-semibold text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
                >
                    View Profile
                    <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-xs" />
                </Link>
                <RecruiterActionsToolbar
                    recruiter={recruiter}
                    variant="icon-only"
                    size="sm"
                    onRefresh={onRefresh}
                    showActions={{
                        viewDetails: false,
                    }}
                />
            </div>
        </article>
    );
}
