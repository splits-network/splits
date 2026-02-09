"use client";

import { formatDate } from "@/lib/utils";
import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
    ExpandedDetailSection,
} from "@/components/ui/tables";
import { Application, getDisplayStatus } from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";

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

export default function Row({ item, onViewDetails, onMessage }: RowProps) {
    const status = getDisplayStatus(item);

    const cells = (
        <>
            {/* Candidate */}
            <td className="py-4">
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-base-content/70 w-10 rounded-full flex items-center justify-center text-sm font-semibold">
                            {(item.candidate?.full_name || "C")[0].toUpperCase()}
                        </div>
                    </div>
                    <div className="text-sm min-w-0">
                        <span
                            className="font-semibold"
                            title={item.candidate?.full_name ?? undefined}
                        >
                            {item.candidate?.full_name || "Unknown"}
                        </span>
                        <div className="text-sm text-base-content/60">
                            {item.candidate?.email}
                        </div>
                    </div>
                </div>
            </td>
            {/* Job */}
            <td>
                <span className="text-sm font-medium">
                    {item.job?.title || "Unknown"}
                </span>
            </td>
            {/* Company */}
            <td>
                <span className="text-sm text-base-content/60">
                    {item.job?.company?.name || "N/A"}
                </span>
            </td>
            {/* AI Score */}
            <td>
                {item.ai_review?.fit_score != null ? (
                    <div className="flex items-center gap-2">
                        <progress
                            className="progress progress-accent w-12"
                            value={item.ai_review.fit_score}
                            max="100"
                        />
                        <span className="text-xs font-bold">
                            {Math.round(item.ai_review.fit_score)}%
                        </span>
                    </div>
                ) : (
                    <span className="text-xs text-base-content/40">N/A</span>
                )}
            </td>
            {/* Stage */}
            <td>
                <span
                    className={`badge ${status.badgeClass} badge-sm gap-1.5`}
                >
                    <i className={`fa-duotone fa-regular ${status.icon}`} />
                    {status.label}
                </span>
            </td>
            {/* Submitted */}
            <td>
                <span className="text-sm text-base-content/60">
                    {item.created_at ? formatDate(item.created_at) : "N/A"}
                </span>
            </td>
            {/* Actions */}
            <td onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 justify-end">
                    <button
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={onViewDetails}
                        title="View details"
                    >
                        <i className="fa-duotone fa-regular fa-eye fa-fw" />
                    </button>
                </div>
            </td>
        </>
    );

    const expandedContent = (
        <div className="space-y-4">
            <ExpandedDetailSection title="Application Details">
                <div className="space-y-2">
                    {item.accepted_by_company && (
                        <div className="text-sm text-success">
                            <i className="fa-duotone fa-regular fa-circle-check mr-2" />
                            Accepted by company
                        </div>
                    )}
                </div>
            </ExpandedDetailSection>

            <ExpandedDetailGrid cols={2}>
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

            {/* Action Buttons */}
            <div className="flex items-center pt-2 border-t border-base-300">
                <ActionsToolbar
                    application={item}
                    variant="descriptive"
                    size="sm"
                    showActions={{ viewDetails: false, message: true }}
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
