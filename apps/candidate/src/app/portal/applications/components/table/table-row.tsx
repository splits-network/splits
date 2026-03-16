"use client";

import { Fragment } from "react";
import type { Application } from "../../types";
import {
    companyName,
    companyInitials,
    recruiterName,
    appliedAgo,
} from "../shared/helpers";
import { getStageDisplay, semanticPill } from "@splits-network/basel-ui";
import { DetailLoader } from "../shared/application-detail";
import ActionsToolbar from "../shared/actions-toolbar";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";

export function TableRow({
    app,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    app: Application;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { getLevel } = useGamification();
    const rowBase = isSelected
        ? "bg-primary/5 border-l-4 border-l-primary"
        : `border-l-4 border-l-transparent ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`;

    const name = companyName(app);
    const companyLevel = app.job?.company?.id ? getLevel(app.job.company.id) : undefined;

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

                {/* Position */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                            {app.job?.company?.logo_url ? (
                                <img
                                    src={app.job.company.logo_url}
                                    alt={name}
                                    className="w-8 h-8 object-contain bg-base-200 border border-base-300 p-0.5"
                                />
                            ) : (
                                <div className="w-8 h-8 flex items-center justify-center bg-base-200 border border-base-300 text-sm font-bold text-base-content/60">
                                    {companyInitials(name)}
                                </div>
                            )}
                            {companyLevel && (
                                <div className="absolute -bottom-1 -right-1">
                                    <LevelBadge level={companyLevel} size="sm" />
                                </div>
                            )}
                        </div>
                        <span className="font-bold text-sm text-base-content">
                            {app.job?.title || "Untitled Position"}
                        </span>
                    </div>
                </td>

                {/* Company */}
                <td className="px-4 py-3 text-sm font-semibold text-base-content/70">
                    {name}
                </td>

                {/* Location */}
                <td className="px-4 py-3 text-sm text-base-content/60">
                    {app.job?.location || "\u2014"}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                    {(() => {
                        const s = getStageDisplay(app.stage, { acceptedByCandidate: app.accepted_by_candidate });
                        return (
                            <span className={`inline-flex items-center px-2 py-0.5 text-sm uppercase tracking-[0.15em] font-bold ${semanticPill[s.color]}`}>
                                {s.label}
                            </span>
                        );
                    })()}
                </td>

                {/* Recruiter */}
                <td className="px-4 py-3 text-sm text-base-content/60">
                    {recruiterName(app)}
                </td>

                {/* Applied */}
                <td className="px-4 py-3 text-sm text-base-content/50">
                    {appliedAgo(app)}
                </td>

                {/* Actions */}
                <td
                    className="px-4 py-3 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-y-0 right-4 flex items-center flex-nowrap">
                        <ActionsToolbar
                            item={app}
                            variant="icon-only"
                            size="xs"
                            onStageChange={onRefresh}
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
                            applicationId={app.id}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
