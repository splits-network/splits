"use client";

import { Fragment } from "react";
import type { Application } from "../../types";
import { BaselBadge } from "@splits-network/basel-ui";
import {
    candidateName,
    roleTitle,
    companyName,
    aiScore,
    addedAgo,
    isNew,
} from "../shared/helpers";
import { getStageDisplayWithExpired, getAIScoreBadgeColor } from "../shared/status-color";
import { DetailLoader } from "../shared/application-detail";
import ActionsToolbar from "@/app/portal/applications/components/shared/actions-toolbar";

export function TableRow({
    application,
    idx,
    isSelected,
    colSpan,
    onSelect,
    onRefresh,
}: {
    application: Application;
    idx: number;
    isSelected: boolean;
    colSpan: number;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const name = candidateName(application);
    const stage = getStageDisplayWithExpired(application.stage, (application as any).expired_at);
    const score = aiScore(application);

    const rowBase = isSelected
        ? "bg-primary/5 border-l-4 border-l-primary"
        : `border-l-4 border-l-transparent ${idx % 2 === 0 ? "bg-base-100" : "bg-base-200/30"}`;

    return (
        <Fragment>
            {/* Main row */}
            <tr
                onClick={onSelect}
                className={`cursor-pointer border-b border-base-200 hover:bg-base-200/50 transition-colors ${rowBase}`}
            >
                {/* Chevron */}
                <td className="pl-4 pr-1 py-2 w-6">
                    <i
                        className={`fa-duotone fa-regular ${isSelected ? "fa-chevron-down" : "fa-chevron-right"} text-xs transition-transform ${isSelected ? "text-primary" : "text-base-content/30"}`}
                    />
                </td>

                {/* Candidate */}
                <td className="px-4 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-sm tracking-tight text-base-content truncate">
                            {name}
                        </span>
                        {isNew(application) && (
                            <BaselBadge color="info" size="xs" variant="soft">
                                New
                            </BaselBadge>
                        )}
                    </div>
                </td>

                {/* Role */}
                <td className="px-4 py-2">
                    <p className="text-sm font-semibold truncate">
                        {roleTitle(application)}
                        {companyName(application) && (
                            <span className="text-base-content/40 font-normal ml-2">
                                {companyName(application)}
                            </span>
                        )}
                    </p>
                </td>

                {/* Stage */}
                <td className="px-4 py-2">
                    <BaselBadge color={stage.color} size="xs" variant="soft">
                        <i className={`fa-duotone fa-regular ${stage.icon} text-sm`} />
                        {stage.label}
                    </BaselBadge>
                </td>

                {/* AI Score */}
                <td className="px-4 py-2">
                    {score !== null ? (
                        <BaselBadge color={getAIScoreBadgeColor(score)} size="xs" variant="soft">
                            {score}%
                        </BaselBadge>
                    ) : (
                        <span className="text-sm text-base-content/30">
                            &mdash;
                        </span>
                    )}
                </td>

                {/* Added */}
                <td className="px-4 py-2 text-sm text-base-content/50">
                    {addedAgo(application)}
                </td>

                {/* Actions */}
                <td
                    className="px-4 py-2 text-right"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ActionsToolbar
                        application={application}
                        variant="icon-only"
                        size="xs"
                        onRefresh={onRefresh}
                        showActions={{
                            viewDetails: false,
                        }}
                    />
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
                            applicationId={application.id}
                            onClose={onSelect}
                            onRefresh={onRefresh}
                        />
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
