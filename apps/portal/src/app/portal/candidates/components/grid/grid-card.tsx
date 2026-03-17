"use client";

import type { Candidate } from "../../types";
import {
    formatVerificationStatus,
    formatJobType,
    formatAvailability,
} from "../../types";
import { statusColorName, statusBorder } from "../shared/status-color";
import { relationshipBadge, accountBadge } from "../shared/candidate-badges";
import { BaselBadge, BaselAvatar, BaselLevelIndicator } from "@splits-network/basel-ui";
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
import { SaveBookmark } from "@/components/save-bookmark";
import {
    useGamification,
} from "@splits-network/shared-gamification";
import { usePresenceStatus } from "@/contexts";
import { useUserProfile } from "@/contexts/user-profile-context";

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
    const { isRecruiter } = useUserProfile();
    const { getLevel } = useGamification();
    const level = getLevel(candidate.id);
    const name = candidateName(candidate);
    const initials = candidateInitials(name);
    const title = candidateTitle(candidate);
    const company = candidateCompany(candidate);
    const salary = salaryDisplay(candidate);
    const skills = skillsList(candidate);
    const candidateUserId = candidate.user_id;
    const presenceData = usePresenceStatus(candidateUserId);
    const presenceStatus = presenceData?.status;
    const lastSeen = lastSeenAgo(
        presenceData?.lastSeenAt ?? null,
        candidate.last_active_at,
    );

    // Inline metadata — always show all, muted when empty (matches recruiter card pattern)
    const metaItems: { icon: string; color: string; value: string; muted: boolean; tooltip: string }[] = [
        { icon: "fa-dollar-sign", color: "text-success", value: salary || "\u2014", muted: !salary, tooltip: "Desired salary" },
        { icon: "fa-briefcase", color: "text-primary", value: formatJobType(candidate.desired_job_type), muted: !candidate.desired_job_type, tooltip: "Desired job type" },
        { icon: "fa-clock", color: "text-info", value: formatAvailability(candidate.availability), muted: !candidate.availability, tooltip: "Availability" },
    ];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-colors",
                isSelected
                    ? "border-primary border-l-primary bg-primary/5"
                    : `${statusBorder(candidate.verification_status)} hover:border-base-content/20`,
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="relative bg-base-300 px-5 pt-4 pb-4">
                {/* Utility icons: absolute top-right */}
                {isRecruiter && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <SaveBookmark
                            entityType="candidate"
                            entityId={candidate.id}
                            isSaved={!!candidate.is_saved}
                            savedRecordId={candidate.saved_record_id ?? null}
                            size="sm"
                            onToggle={(saved, recordId) => onUpdateItem?.(candidate.id, { is_saved: saved, saved_record_id: recordId })}
                        />
                    </div>
                )}

                {/* Avatar + Name block */}
                <div className="flex items-start gap-3">
                    <BaselAvatar
                        initials={initials}
                        size="md"
                        presence={presenceStatus}
                        className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            {company || "Candidate"}
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                        <p className={`text-sm truncate mt-0.5 ${title ? "text-base-content/50" : "text-base-content/30"}`}>
                            {title || "No title specified"}
                        </p>
                    </div>
                </div>

                {/* Location + last seen */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/50">
                    <span className="flex items-center gap-1.5 truncate">
                        <i className="fa-duotone fa-regular fa-location-dot text-xs text-secondary" />
                        {candidate.location || "Location not specified"}
                    </span>
                    {lastSeen && (
                        <>
                            <span className="text-base-content/20">|</span>
                            <span className="flex items-center gap-1.5 shrink-0">
                                <i className="fa-duotone fa-regular fa-calendar text-xs text-accent" />
                                {lastSeen}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Inline metadata: salary · type · availability */}
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                {level && (
                    <>
                        <BaselLevelIndicator level={level.current_level} title={level.title} totalXp={level.total_xp} />
                        <span className="text-base-content/20">&middot;</span>
                    </>
                )}
                {metaItems.map((item, i) => (
                    <span key={i} className={`tooltip tooltip-bottom flex items-center gap-1 ${item.muted ? "text-base-content/30" : "text-base-content/60"}`} data-tip={item.tooltip}>
                        <i className={`fa-duotone fa-regular ${item.icon} ${item.muted ? "text-base-content/20" : item.color} text-xs`} />
                        <span className="truncate">{item.value}</span>
                    </span>
                ))}
            </div>

            {/* About snippet */}
            <div className="px-5 py-3 border-b border-base-300">
                {candidate.description ? (
                    <p className="text-sm text-base-content/60 leading-relaxed line-clamp-2">
                        {candidate.description}
                    </p>
                ) : (
                    <p className="text-sm text-base-content/30">No bio available</p>
                )}
            </div>

            {/* Badge row: emphasis (soft-outline) + default (soft) */}
            <div className="px-5 py-3 flex-1">
                <div className="flex flex-wrap gap-1.5">
                    {/* Single status badge: No Account > Pending Invite > verification status */}
                    {(() => {
                        const acct = accountBadge(candidate);
                        if (acct) {
                            return (
                                <BaselBadge color={acct.color} variant="soft-outline" size="sm" icon={acct.icon}>
                                    {acct.label}
                                </BaselBadge>
                            );
                        }
                        if (candidate.has_pending_invitation) {
                            return (
                                <BaselBadge color="warning" variant="soft-outline" size="sm" icon="fa-clock">
                                    Pending
                                </BaselBadge>
                            );
                        }
                        return (
                            <BaselBadge
                                color={statusColorName(candidate.verification_status)}
                                variant="soft-outline"
                                size="sm"
                            >
                                {formatVerificationStatus(candidate.verification_status)}
                            </BaselBadge>
                        );
                    })()}
                    {isNew(candidate) && !accountBadge(candidate) && !candidate.has_pending_invitation && (
                        <BaselBadge color="warning" variant="soft-outline" size="sm" icon="fa-sparkles">
                            New
                        </BaselBadge>
                    )}
                    {/* Relationship badge: only Mine or Sourced (Pending folded into status above) */}
                    {(() => {
                        const rel = relationshipBadge(candidate);
                        return rel && rel.label !== "Pending" ? (
                            <BaselBadge color={rel.color} variant="soft-outline" size="sm" icon={rel.icon}>
                                {rel.label}
                            </BaselBadge>
                        ) : null;
                    })()}
                    {candidate.open_to_remote && (
                        <BaselBadge color="neutral" variant="soft" size="sm" icon="fa-house-laptop">
                            Remote
                        </BaselBadge>
                    )}
                    {candidate.open_to_relocation && (
                        <BaselBadge color="neutral" variant="soft" size="sm" icon="fa-truck-moving">
                            Relocatable
                        </BaselBadge>
                    )}
                    {!candidate.open_to_remote && !candidate.open_to_relocation && (
                        <BaselBadge variant="soft" color="neutral" size="sm" icon="fa-building">
                            On-Site Only
                        </BaselBadge>
                    )}
                    {skills.slice(0, 3).map((skill) => (
                        <BaselBadge key={skill} variant="soft" color="neutral" size="sm">
                            {skill}
                        </BaselBadge>
                    ))}
                    {skills.length > 3 && (
                        <span className="text-sm font-semibold text-base-content/50 self-center">
                            +{skills.length - 3} more
                        </span>
                    )}
                    {skills.length === 0 && (
                        <span className="text-sm text-base-content/30">No skills listed</span>
                    )}
                </div>
            </div>

            {/* Footer: view link + actions */}
            <div
                className="flex items-center justify-between gap-3 px-5 py-3 border-t border-base-300"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onSelect}
                    className="text-sm font-semibold text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
                >
                    View Details
                    <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                </button>
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
        </article>
    );
}
