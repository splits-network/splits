"use client";

import { Fragment } from "react";
import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
import { statusBorder } from "../shared/status-color";
import { BaselBadge, BaselAvatar, BaselLevelIndicator } from "@splits-network/basel-ui";
import {
    recruiterLocation,
    formatStatus,
    placementsDisplay,
    reputationDisplay,
    experienceDisplay,
    joinedAgo,
    isNew,
} from "../shared/helpers";
import { DetailLoader } from "../shared/recruiter-detail";
import RecruiterActionsToolbar from "../shared/actions-toolbar";
import { useGamification } from "@splits-network/shared-gamification";
import { PlanBadge } from "@/components/entitlements/plan-badge";
import type { PlanTier } from "@/contexts/user-profile-context";
import { usePresenceStatus } from "@/contexts";

export function TableRow({
    recruiter,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    recruiter: RecruiterWithUser;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { getLevel } = useGamification();
    const level = getLevel(recruiter.id);
    const recruiterUserId = recruiter.users?.id;
    const presenceData = usePresenceStatus(recruiterUserId);
    const presenceStatus = presenceData?.status;
    const name = getDisplayName(recruiter);
    const location = recruiterLocation(recruiter);
    const status = recruiter.status || "active";
    const reputation = reputationDisplay(recruiter);
    const experience = experienceDisplay(recruiter);
    const specialties = recruiter.specialties || [];

    return (
        <Fragment>
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors border-l-4 ${
                    isSelected
                        ? "bg-primary/5 border-l-primary"
                        : `${statusBorder(status)} ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`
                }`}
            >
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? "text-primary" : "text-base-content/30"}`}
                    />
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <BaselAvatar
                            initials={getInitials(name)}
                            src={recruiter.users?.profile_image_url}
                            alt={name}
                            size="sm"
                            presence={presenceStatus}
                        />
                        <div>
                            <div className="flex items-center gap-1.5">
                                {isNew(recruiter) && (
                                    <i className="fa-duotone fa-regular fa-sparkles text-sm text-warning" />
                                )}
                                <span className="font-bold text-sm">{name}</span>
                            </div>
                            {(level || recruiter.plan_tier) && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    {level && <BaselLevelIndicator level={level.current_level} title={level.title} totalXp={level.total_xp} xpToNextLevel={level.xp_to_next_level} />}
                                    {recruiter.plan_tier && <PlanBadge tier={recruiter.plan_tier as PlanTier} />}
                                </div>
                            )}
                        </div>
                    </div>
                </td>
                <td className={`px-4 py-3 text-sm ${location ? "text-base-content/70" : "text-base-content/30"}`}>
                    {location || "Not specified"}
                </td>
                <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                        {specialties.slice(0, 2).map((s) => (
                            <BaselBadge key={s} variant="outline" size="xs">
                                {s}
                            </BaselBadge>
                        ))}
                        {specialties.length > 2 && (
                            <span className="text-sm font-semibold text-base-content/40 self-center">
                                +{specialties.length - 2}
                            </span>
                        )}
                        {specialties.length === 0 && (
                            <span className="text-sm text-base-content/30">None</span>
                        )}
                    </div>
                </td>
                <td className="px-4 py-3 text-sm font-bold">
                    {placementsDisplay(recruiter)}
                </td>
                <td className={`px-4 py-3 text-sm font-bold ${reputation ? "text-accent" : "text-base-content/30"}`}>
                    {reputation || "N/A"}
                </td>
                <td className={`px-4 py-3 text-sm font-bold ${experience ? "text-base-content" : "text-base-content/30"}`}>
                    {experience || "N/A"}
                </td>
                <td className="px-4 py-3">
                    <BaselBadge color={status === "active" ? "success" : status === "pending" ? "warning" : status === "suspended" ? "error" : "neutral"} size="xs" variant="soft">
                        {formatStatus(status)}
                    </BaselBadge>
                </td>
                <td className="px-4 py-3 text-sm text-base-content/50">
                    {joinedAgo(recruiter)}
                </td>
                <td
                    className="px-4 py-3 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap">
                        <RecruiterActionsToolbar
                            recruiter={recruiter}
                            variant="icon-only"
                            size="xs"
                            onRefresh={onRefresh}
                            showActions={{
                                viewDetails: false,
                                message: false,
                            }}
                        />
                    </div>
                </td>
            </tr>
            {isSelected && (
                <tr>
                    <td
                        colSpan={colSpan}
                        className="p-0 bg-base-100 border-t-2 border-b-2 border-primary"
                    >
                        <DetailLoader
                            recruiterId={recruiter.id}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
