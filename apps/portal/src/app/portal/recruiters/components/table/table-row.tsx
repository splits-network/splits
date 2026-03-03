"use client";

import { Fragment } from "react";
import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
import { statusColor, statusBorder } from "../shared/status-color";
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
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";

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
    const name = getDisplayName(recruiter);
    const location = recruiterLocation(recruiter);
    const status = recruiter.status || "active";

    return (
        <Fragment>
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors border-l-4 ${
                    isSelected
                        ? `bg-primary/5 ${statusBorder(status)}`
                        : `border-transparent ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`
                }`}
            >
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? "text-primary" : "text-base-content/40"}`}
                    />
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        {recruiter.users?.profile_image_url ? (
                            <img
                                src={recruiter.users.profile_image_url}
                                alt={name}
                                className="w-8 h-8 object-cover border border-base-300"
                            />
                        ) : (
                            <div className="w-8 h-8 flex items-center justify-center border border-base-300 bg-base-200 text-xs font-bold text-base-content/60">
                                {getInitials(name)}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {isNew(recruiter) && (
                                <i className="fa-duotone fa-regular fa-sparkles text-sm text-warning" />
                            )}
                            <span className="font-bold text-sm">{name}</span>
                            {level && <span className="ml-1.5 inline-block align-middle"><LevelBadge level={level} size="sm" /></span>}
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3 text-sm text-base-content/70">
                    {location || "\u2014"}
                </td>
                <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                        {(recruiter.specialties || [])
                            .slice(0, 2)
                            .map((s, i) => (
                                <span
                                    key={i}
                                    className="text-sm uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5"
                                >
                                    {s}
                                </span>
                            ))}
                        {(recruiter.specialties || []).length > 2 && (
                            <span className="text-sm text-base-content/40">
                                +{(recruiter.specialties || []).length - 2}
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-4 py-3 text-sm font-bold">
                    {placementsDisplay(recruiter)}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-accent">
                    {reputationDisplay(recruiter) || "\u2014"}
                </td>
                <td className="px-4 py-3 text-sm font-bold">
                    {experienceDisplay(recruiter) || "\u2014"}
                </td>
                <td className="px-4 py-3">
                    <span className={`badge ${statusColor(status)}`}>
                        {formatStatus(status)}
                    </span>
                </td>
                <td className="px-4 py-3 text-sm text-base-content/60">
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
