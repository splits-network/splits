"use client";

import { Fragment } from "react";
import type { Candidate } from "../../types";
import {
    candidateName,
    candidateTitle,
    salaryDisplay,
    isNew,
    lastSeenAgo,
} from "../shared/helpers";
import { DetailLoader } from "../shared/candidate-detail";
import { statusBorder } from "../shared/status-color";
import CandidateActionsToolbar from "../shared/actions-toolbar";
import { SaveBookmark } from "@/components/save-bookmark";
import { relationshipBadge, jobTypeBadges, accountBadge } from "../shared/candidate-badges";
import { BaselBadge } from "@splits-network/basel-ui";
import {
    LevelBadge,
    useGamification,
} from "@splits-network/shared-gamification";
import { Presence } from "@/components/presense";
import { usePresenceStatus } from "@/contexts";
import { useUserProfile } from "@/contexts/user-profile-context";

export function TableRow({
    candidate,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
    onUpdateItem,
}: {
    candidate: Candidate;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Candidate>) => void;
}) {
    const { isRecruiter } = useUserProfile();
    const { getLevel } = useGamification();
    const level = getLevel(candidate.id);
    const candidateUserId = candidate.user_id;
    const presenceData = usePresenceStatus(candidateUserId);
    const presenceStatus = presenceData?.status;

    const rowBase = isSelected
        ? "bg-primary/5 border-l-4 border-l-primary"
        : `border-l-4 ${statusBorder(candidate.verification_status)} ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`;

    return (
        <Fragment>
            {/* Main row */}
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors ${rowBase}`}
            >
                {/* Chevron */}
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? "text-primary" : "text-base-content/30"}`}
                    />
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        {isNew(candidate) && (
                            <i
                                className="fa-duotone fa-regular fa-sparkles text-sm text-warning"
                                title="New in the last 7 days"
                            />
                        )}
                        <span className="font-bold text-sm text-base-content">
                            {candidateName(candidate)}
                        </span>
                        {isRecruiter && (
                            <SaveBookmark
                                entityType="candidate"
                                entityId={candidate.id}
                                isSaved={!!candidate.is_saved}
                                savedRecordId={candidate.saved_record_id ?? null}
                                size="xs"
                                onToggle={(saved, recordId) => onUpdateItem?.(candidate.id, { is_saved: saved, saved_record_id: recordId })}
                            />
                        )}
                        {level && <span className="ml-1.5 inline-block align-middle"><LevelBadge level={level} size="sm" /></span>}
                        {accountBadge(candidate) && (
                            <span
                                className="ml-1.5 inline-block align-middle text-error"
                                title="No account — candidate is not a registered user"
                            >
                                <i className="fa-duotone fa-regular fa-user-slash text-xs" />
                            </span>
                        )}
                    </div>
                </td>

                {/* Title */}
                <td className="px-4 py-3 text-sm font-semibold text-base-content/70">
                    {candidateTitle(candidate) || <span className="text-base-content/30">No title</span>}
                </td>

                {/* Location */}
                <td className="px-4 py-3 text-sm text-base-content/60">
                    {candidate.location || <span className="text-base-content/30">No location</span>}
                </td>

                {/* Info: relationship + presence + work type */}
                <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                        {(() => {
                            const rel = relationshipBadge(candidate);
                            return rel ? (
                                <BaselBadge color={rel.color} size="xs" variant={rel.variant}>
                                    {rel.label}
                                </BaselBadge>
                            ) : null;
                        })()}
                        <Presence
                            variant="badge"
                            size="xs"
                            status={presenceStatus}
                        />
                        {jobTypeBadges(candidate.desired_job_type).map((jt) => (
                            <BaselBadge key={jt.label} color={jt.color} size="xs" variant={jt.variant}>
                                {jt.label}
                            </BaselBadge>
                        ))}
                    </div>
                </td>

                {/* Salary */}
                <td className="px-4 py-3 text-sm font-bold text-base-content">
                    {salaryDisplay(candidate) || <span className="text-base-content/30 font-normal">Not specified</span>}
                </td>

                {/* Last Online */}
                <td className="px-4 py-3 text-sm text-base-content/50">
                    {lastSeenAgo(
                        presenceData?.lastSeenAt ?? null,
                        candidate.last_active_at,
                    )}
                </td>

                {/* Actions */}
                <td
                    className="px-4 py-3 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap">
                        <CandidateActionsToolbar
                            candidate={candidate}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                            onUpdateItem={onUpdateItem}
                            showActions={{
                                viewDetails: false,
                            }}
                        />
                    </div>
                </td>
            </tr>

            {/* Expanded detail row */}
            {isSelected && (
                <tr>
                    <td
                        colSpan={colSpan}
                        className="p-0 bg-base-100 border-t-2 border-b-2 border-primary"
                    >
                        <DetailLoader
                            candidateId={candidate.id}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
