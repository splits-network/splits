"use client";

import { formatDate } from "@/lib/utils";
import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
    ExpandedDetailSection,
} from "@/components/ui/tables";
import { Invitation, getDisplayStatus, canResendInvitation } from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";

interface RowProps {
    item: Invitation;
    onViewDetails: () => void;
}

export default function Row({ item, onViewDetails }: RowProps) {
    const status = getDisplayStatus(item);

    const cells = (
        <>
            <td className="py-4">
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-base-content/70 w-10 rounded-full flex items-center justify-center text-sm font-semibold">
                            {item.candidate?.profile_picture ? (
                                <img
                                    src={item.candidate.profile_picture}
                                    alt={item.candidate.full_name}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : (
                                (item.candidate?.full_name ||
                                    "C")[0].toUpperCase()
                            )}
                        </div>
                    </div>
                    <div className="text-sm min-w-0">
                        <span
                            className="font-semibold"
                            title={item.candidate?.full_name}
                        >
                            {item.candidate?.full_name}
                        </span>
                        <div className="text-sm text-base-content/60">
                            {item.candidate?.email}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <span className="text-sm text-base-content/60">
                    {formatDate(item.invited_at)}
                </span>
            </td>
            <td>
                <span className="text-sm text-base-content/60">
                    {item.invitation_expires_at
                        ? formatDate(item.invitation_expires_at)
                        : "N/A"}
                </span>
            </td>
            <td>
                <span className={`badge ${status.badgeClass} badge-sm gap-1.5`}>
                    <i className={`fa-duotone fa-regular ${status.icon}`} />
                    {status.label}
                </span>
            </td>
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
            {/* Status Details */}
            <ExpandedDetailSection title="Invitation Details">
                <div className="space-y-2">
                    {item.status === "pending" &&
                        item.invitation_expires_at && (
                            <div className="text-sm">
                                {new Date(item.invitation_expires_at) <
                                new Date() ? (
                                    <span className="text-error">
                                        <i className="fa-duotone fa-regular fa-clock mr-2" />
                                        Invitation expired on{" "}
                                        {formatDate(item.invitation_expires_at)}
                                    </span>
                                ) : (
                                    <span className="text-warning">
                                        <i className="fa-duotone fa-regular fa-clock mr-2" />
                                        Expires on{" "}
                                        {formatDate(item.invitation_expires_at)}
                                    </span>
                                )}
                            </div>
                        )}
                    {item.declined_reason && (
                        <div className="alert alert-error alert-sm">
                            <i className="fa-duotone fa-regular fa-circle-exclamation" />
                            <div>
                                <div className="font-semibold">
                                    Decline Reason:
                                </div>
                                <div>{item.declined_reason}</div>
                            </div>
                        </div>
                    )}
                </div>
            </ExpandedDetailSection>

            {/* Details Grid */}
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
                    icon="fa-location-dot"
                    label="Location"
                    value={item.candidate?.location || "Not specified"}
                />
                <ExpandedDetailItem
                    icon="fa-building"
                    label="Current Company"
                    value={item.candidate?.current_company || "Not specified"}
                />
                <ExpandedDetailItem
                    icon="fa-briefcase"
                    label="Current Role"
                    value={item.candidate?.current_title || "Not specified"}
                />
            </ExpandedDetailGrid>

            {/* Action Buttons */}
            <div className="flex items-center pt-2 border-t border-base-300">
                <ActionsToolbar
                    invitation={item}
                    variant="descriptive"
                    size="sm"
                />
            </div>
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`invitation-${item.id}`}
            cells={cells}
            expandedContent={expandedContent}
            showToggle={true}
        />
    );
}
