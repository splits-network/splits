"use client";

import { Fragment } from "react";
import { Badge } from "@splits-network/memphis-ui";
import type { RecruiterWithUser } from "../../types";
import { getDisplayName, getInitials } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
import {
    recruiterLocation,
    formatStatus,
    placementsDisplay,
    successRateDisplay,
    reputationDisplay,
    experienceDisplay,
    joinedAgo,
    isNew,
} from "../shared/helpers";
import { DetailLoader } from "../shared/recruiter-detail";
import RecruiterActionsToolbar from "../shared/actions-toolbar";

export function TableRow({
    recruiter,
    accent,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    recruiter: RecruiterWithUser;
    accent: AccentClasses;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;
    const name = getDisplayName(recruiter);
    const location = recruiterLocation(recruiter);

    return (
        <Fragment>
            <tr
                onClick={onSelect}
                className={`cursor-pointer transition-colors border-l-4 ${
                    isSelected
                        ? `${ac.bgLight} ${ac.border}`
                        : `border-transparent ${idx % 2 === 0 ? "bg-white" : "bg-cream"}`
                }`}
            >
                <td className="px-4 py-3 w-8">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-sm transition-transform ${isSelected ? ac.text : "text-dark/40"}`}
                    />
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        {recruiter.users?.profile_image_url ? (
                            <img
                                src={recruiter.users.profile_image_url}
                                alt={name}
                                className={`w-8 h-8 object-cover border-2 ${ac.border}`}
                            />
                        ) : (
                            <div
                                className={`w-8 h-8 flex items-center justify-center border-2 ${ac.border} bg-cream text-xs font-bold text-dark`}
                            >
                                {getInitials(name)}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {isNew(recruiter) && (
                                <i className="fa-duotone fa-regular fa-sparkles text-sm text-yellow" />
                            )}
                            <span className="font-bold text-sm text-dark">
                                {name}
                            </span>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3 text-sm text-dark/70">
                    {location || "\u2014"}
                </td>
                <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                        {(recruiter.specialties || []).slice(0, 2).map((s, i) => (
                            <Badge key={i} color={ac.name} variant="outline" size="sm">
                                {s}
                            </Badge>
                        ))}
                        {(recruiter.specialties || []).length > 2 && (
                            <span className="text-sm text-dark/40">
                                +{(recruiter.specialties || []).length - 2}
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-dark">
                    {placementsDisplay(recruiter)}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-purple">
                    {reputationDisplay(recruiter) || "\u2014"}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-dark">
                    {experienceDisplay(recruiter) || "\u2014"}
                </td>
                <td className="px-4 py-3">
                    <Badge color={statusVariant(recruiter.marketplace_profile?.status || "active")}>
                        {formatStatus(recruiter.marketplace_profile?.status || "active")}
                    </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-dark/60">
                    {joinedAgo(recruiter)}
                </td>
                <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap z-10">
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
                        className={`p-0 bg-white border-t-4 border-b-4 ${ac.border}`}
                    >
                        <DetailLoader
                            recruiterId={recruiter.id}
                            accent={ac}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
