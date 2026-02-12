"use client";

import { daysSince, formatDate } from "@/lib/utils";
import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
    ExpandedDetailSection,
} from "@/components/ui/tables";
import { Application, getDisplayStatus } from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";
import { daysBetween } from "@/lib/utils/date-formatting";

interface RowProps {
    item: Application;
    onViewDetails: () => void;
    onMessage?: (
        conversationId: string,
        candidateName: string,
        candidateUserId: string,
        context?: any,
    ) => void;
}

function getStageTextColor(badgeClass: string): string {
    if (badgeClass.includes("badge-success")) return "text-success";
    if (badgeClass.includes("badge-error")) return "text-error";
    if (badgeClass.includes("badge-warning")) return "text-warning";
    if (badgeClass.includes("badge-info")) return "text-info";
    if (badgeClass.includes("badge-primary")) return "text-primary";
    if (badgeClass.includes("badge-neutral")) return "text-base-content/70";
    return "text-base-content/60";
}

export default function Row({ item, onViewDetails, onMessage }: RowProps) {
    const status = getDisplayStatus(item);

    const cells = (
        <>
            {/* Candidate */}
            <td className="py-4 overflow-hidden">
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-base-content/70 w-10 rounded-full flex items-center justify-center text-sm font-semibold">
                            {(item.candidate?.full_name ||
                                "C")[0].toUpperCase()}
                        </div>
                    </div>
                    <div className="text-sm min-w-0">
                        <span
                            className="font-semibold block truncate"
                            title={item.candidate?.full_name ?? undefined}
                        >
                            {item.candidate?.full_name || "Unknown"}
                        </span>
                        <div
                            className="text-sm text-base-content/60 truncate"
                            title={item.candidate?.email ?? undefined}
                        >
                            {item.candidate?.email}
                        </div>
                    </div>
                </div>
            </td>
            {/* Job */}
            <td className="overflow-hidden">
                <div className="flex flex-col justify-start min-w-0">
                    <span
                        className="text-sm font-medium truncate"
                        title={item.job?.title ?? undefined}
                    >
                        {item.job?.title || "Unknown"}
                    </span>
                    <span
                        className="text-sm text-base-content/60 truncate"
                        title={item.job?.company?.name ?? undefined}
                    >
                        {item.job?.company?.name || "N/A"}
                    </span>
                </div>
            </td>
            {/* AI Score */}
            <td>
                {item.ai_review?.fit_score != null ? (
                    <span
                        className={`text-xs font-bold ${
                            item.ai_review.fit_score >= 70
                                ? "text-success"
                                : item.ai_review.fit_score >= 40
                                  ? "text-warning"
                                  : "text-error"
                        }`}
                    >
                        {Math.round(item.ai_review.fit_score)}%
                    </span>
                ) : (
                    <span className="text-xs text-base-content/40">N/A</span>
                )}
            </td>
            {/* Stage */}
            <td className="overflow-hidden">
                <span
                    className={`text-xs font-semibold truncate block ${getStageTextColor(status.badgeClass)}`}
                    title={status.label}
                >
                    <i
                        className={`fa-duotone fa-regular ${status.icon} mr-1.5`}
                    />
                    {status.label}
                </span>
            </td>
            {/* Submitted */}
            <td>
                <span className="text-xs text-base-content/60 whitespace-nowrap">
                    {item.created_at ? formatDate(item.created_at) : "N/A"}
                </span>
            </td>
            {/* Actions */}
            <td onClick={(e) => e.stopPropagation()} className="text-right">
                <ActionsToolbar
                    application={item}
                    variant="icon-only"
                    size="xs"
                    showActions={{
                        viewDetails: true,
                        message: true,
                        addNote: true,
                        advanceStage: true,
                        reject: true,
                    }}
                    onViewDetails={onViewDetails}
                    onMessage={onMessage}
                    className="justify-end"
                />
            </td>
        </>
    );

    const expandedContent = (
        <div className="space-y-4">
            <ExpandedDetailSection title="Application Details">
                <div className="space-y-2">
                    {item.accepted_by_company && (
                        <div className="flex">
                            <div className="text-sm text-success">
                                <i className="fa-duotone fa-regular fa-circle-check mr-2" />
                                Accepted by company
                            </div>
                            {item.accepted_at && (
                                <span className="text-base-content/60 ml-2">
                                    ({daysBetween(item.accepted_at, new Date())}{" "}
                                    days ago)
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </ExpandedDetailSection>

            <ExpandedDetailGrid cols={3}>
                <ExpandedDetailItem
                    icon="fa-user"
                    label="Candidate"
                    value={item.candidate?.full_name}
                />
                <ExpandedDetailItem
                    icon="fa-envelope"
                    label="Email"
                    value={item.candidate?.email}
                />
                <ExpandedDetailItem
                    icon="fa-robot"
                    label="AI Score"
                    value={
                        item.ai_review?.fit_score != null
                            ? `${Math.round(item.ai_review.fit_score)}%`
                            : "Not reviewed"
                    }
                />
            </ExpandedDetailGrid>

            <ExpandedDetailGrid cols={3}>
                <ExpandedDetailItem
                    icon="fa-briefcase"
                    label="Job"
                    value={item.job?.title}
                />
                <ExpandedDetailItem
                    icon="fa-building"
                    label="Company"
                    value={item.job?.company?.name || "N/A"}
                />
            </ExpandedDetailGrid>

            {/* Action Buttons */}
            <div className="flex items-center pt-2 border-t border-base-300">
                <ActionsToolbar
                    application={item}
                    variant="descriptive"
                    size="sm"
                    showActions={{
                        viewDetails: true,
                        message: true,
                        addNote: true,
                        advanceStage: true,
                        reject: true,
                    }}
                    onViewDetails={onViewDetails}
                    onMessage={onMessage}
                />
            </div>
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`application-${item.id}`}
            cells={cells}
            expandedContent={expandedContent}
            showToggle={true}
        />
    );
}
