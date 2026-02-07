"use client";

import { DataRow, DataList, MetricCard } from "@/components/ui/cards";
import { formatDate } from "@/lib/utils";
import { Invitation, getDisplayStatus, canResendInvitation } from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";

interface ItemProps {
    item: Invitation;
    onViewDetails: () => void;
}

export default function Item({ item, onViewDetails }: ItemProps) {
    const status = getDisplayStatus(item);

    return (
        <MetricCard className="group hover:shadow-lg transition-all duration-200">
            <MetricCard.Header>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="avatar avatar-placeholder shrink-0">
                            <div className="bg-primary/10 text-primary w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold">
                                {(item.candidate?.full_name ||
                                    "U")[0].toUpperCase()}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors truncate">
                                {item.candidate?.full_name || "Unknown"}
                            </h3>
                            <p className="text-sm text-base-content/60 truncate">
                                {item.candidate?.email || "N/A"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        <span
                            className={`badge ${status.badgeClass} badge-sm gap-1.5`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${status.icon}`}
                            />
                            {status.label}
                        </span>
                    </div>
                </div>
            </MetricCard.Header>

            <MetricCard.Body>
                <DataList compact>
                    <DataRow
                        icon="fa-paper-plane"
                        label="Invited"
                        value={
                            item.invited_at
                                ? formatDate(item.invited_at)
                                : "N/A"
                        }
                    />
                    <DataRow
                        icon="fa-clock"
                        label="Expires"
                        value={
                            item.invitation_expires_at
                                ? formatDate(item.invitation_expires_at)
                                : "N/A"
                        }
                    />
                    {item.consent_given_at && (
                        <DataRow
                            icon="fa-check"
                            label="Accepted"
                            value={formatDate(item.consent_given_at)}
                        />
                    )}
                    {item.declined_at && (
                        <DataRow
                            icon="fa-xmark"
                            label="Declined"
                            value={formatDate(item.declined_at)}
                        />
                    )}
                    {item.candidate?.phone && (
                        <DataRow
                            icon="fa-phone"
                            label="Phone"
                            value={item.candidate.phone}
                        />
                    )}
                </DataList>
            </MetricCard.Body>

            <MetricCard.Footer>
                <div className="flex items-center justify-between w-full gap-2">
                    <ActionsToolbar
                        invitation={item}
                        variant="icon-only"
                        size="sm"
                        showActions={{
                            viewCandidate: true,
                            resend: true,
                            cancel: true,
                            viewDeclineReason: true,
                        }}
                    />
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm gap-2"
                        onClick={onViewDetails}
                        title="View details"
                    >
                        <i className="fa-duotone fa-regular fa-eye" />
                        Details
                    </button>
                </div>
            </MetricCard.Footer>
        </MetricCard>
    );
}
