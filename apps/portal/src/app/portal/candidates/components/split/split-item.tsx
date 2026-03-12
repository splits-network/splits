"use client";

import type { Candidate } from "../../types";
import { relationshipBadge, jobTypeBadges, accountBadge } from "../shared/candidate-badges";
import { BaselBadge } from "@splits-network/basel-ui";
import {
    candidateName,
    candidateTitle,
    salaryDisplay,
    isNew,
    lastSeenAgo,
} from "../shared/helpers";
import CandidateActionsToolbar from "../shared/actions-toolbar";
import {
    LevelBadge,
    useGamification,
} from "@splits-network/shared-gamification";
import { Presence } from "@/components/presense";
import { usePresence } from "@/hooks/use-presence";

export function SplitItem({
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
    const title = candidateTitle(candidate);
    const { getLevel } = useGamification();
    const level = getLevel(candidate.id);
    const candidateUserId = candidate.user_id;
    const presence = usePresence([candidateUserId], {
        enabled: Boolean(candidateUserId),
    });
    const presenceStatus = candidateUserId
        ? presence[candidateUserId]?.status
        : undefined;

    const rel = relationshipBadge(candidate);
    const acct = accountBadge(candidate);
    const jobTypes = jobTypeBadges(candidate.desired_job_type);

    return (
        <div
            onClick={onSelect}
            className={`relative cursor-pointer px-4 py-2.5 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Row 1: name + last seen */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    {isNew(candidate) && (
                        <i className="fa-duotone fa-regular fa-star text-primary text-sm flex-shrink-0" />
                    )}
                    <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                        {candidateName(candidate)}
                    </h4>
                    {candidate.is_saved && (
                        <i className="fa-solid fa-bookmark text-warning text-sm flex-shrink-0" title="Saved" />
                    )}
                    {level && <span className="ml-1 inline-block align-middle"><LevelBadge level={level} size="sm" /></span>}
                    {acct && (
                        <span
                            className="ml-1 inline-block align-middle text-error"
                            title="No account — candidate is not a registered user"
                        >
                            <i className="fa-duotone fa-regular fa-user-slash text-xs" />
                        </span>
                    )}
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {lastSeenAgo(
                        candidateUserId ? presence[candidateUserId]?.lastSeenAt : null,
                        candidate.last_active_at,
                    )}
                </span>
            </div>

            {/* Row 2: title + location */}
            <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-xs text-base-content/60 truncate">
                    {title || "No title"}
                </span>
                {candidate.location && (
                    <span className="text-sm text-base-content/40 flex-shrink-0 truncate max-w-[40%]">
                        <i className="fa-duotone fa-regular fa-location-dot mr-0.5" />
                        {candidate.location}
                    </span>
                )}
            </div>

            {/* Row 3: salary */}
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-base-content/60">
                    {salaryDisplay(candidate) || "Not specified"}
                </span>
            </div>

            {/* Row 4: badge bar — relationship, presence, job type, remote */}
            <div className="flex flex-wrap items-center gap-1 mt-1.5 pr-10">
                {rel && (
                    <BaselBadge color={rel.color} size="xs" variant={rel.variant}>
                        {rel.label}
                    </BaselBadge>
                )}
                <Presence
                    variant="badge"
                    size="xs"
                    status={presenceStatus}
                />
                {jobTypes.map((jt) => (
                    <BaselBadge key={jt.label} color={jt.color} size="xs" variant={jt.variant}>
                        {jt.label}
                    </BaselBadge>
                ))}
                {candidate.open_to_remote && (
                    <BaselBadge color="primary" size="xs" variant="outline">
                        Remote
                    </BaselBadge>
                )}
            </div>

            {/* Actions */}
            <div
                className="absolute bottom-2 right-2"
                onClick={(e) => e.stopPropagation()}
            >
                <CandidateActionsToolbar
                    candidate={candidate}
                    variant="icon-only"
                    size="xs"
                    showActions={{ viewDetails: false }}
                    onRefresh={onRefresh}
                    onUpdateItem={onUpdateItem}
                />
            </div>
        </div>
    );
}
