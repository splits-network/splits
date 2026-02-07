"use client";

import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
} from "@/components/ui/tables";
import {
    CompanyInvitation,
    getStatusBadgeClass,
    formatInvitationDate,
    getDaysUntilExpiry,
    getInviteLink,
} from "../../types";
import InvitationActionsToolbar from "../shared/actions-toolbar";
import { useInvitationFilter } from "../../contexts/filter-context";

interface RowProps {
    invitation: CompanyInvitation;
    onViewDetails: (id: string) => void;
}

export default function Row({ invitation, onViewDetails }: RowProps) {
    const { refresh } = useInvitationFilter();

    const daysUntilExpiry = getDaysUntilExpiry(invitation.expires_at);
    const isExpiringSoon =
        daysUntilExpiry <= 7 &&
        daysUntilExpiry > 0 &&
        invitation.status === "pending";

    const cells = (
        <>
            <td className="py-4">
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder">
                        <div className="bg-base-200 w-10 h-10 rounded-lg">
                            <span className="text-base-content/60 text-lg">
                                <i className="fa-duotone fa-regular fa-building" />
                            </span>
                        </div>
                    </div>
                    <div>
                        <span className="font-semibold">
                            {invitation.company_name_hint || (
                                <span className="text-base-content/50">
                                    Not specified
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </td>
            <td className="hidden md:table-cell">
                {invitation.invited_email || (
                    <span className="text-base-content/50">No email</span>
                )}
            </td>
            <td>
                <code className="bg-base-200 px-2 py-1 rounded text-sm font-mono">
                    {invitation.invite_code}
                </code>
            </td>
            <td>
                <span
                    className={`badge badge-sm ${getStatusBadgeClass(invitation.status)}`}
                >
                    {invitation.status}
                </span>
            </td>
            <td className="hidden md:table-cell">
                {formatInvitationDate(invitation.created_at)}
            </td>
            <td className="hidden md:table-cell">
                <span
                    className={isExpiringSoon ? "text-warning font-medium" : ""}
                >
                    {formatInvitationDate(invitation.expires_at)}
                    {isExpiringSoon && (
                        <span className="text-xs ml-1">
                            ({daysUntilExpiry}d)
                        </span>
                    )}
                </span>
            </td>
            <td onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 justify-end">
                    <InvitationActionsToolbar
                        invitation={invitation}
                        variant="icon-only"
                        layout="horizontal"
                        size="sm"
                        onViewDetails={onViewDetails}
                        onRefresh={refresh}
                        showActions={{
                            copyCode: true,
                            copyLink: true,
                            share: false,
                            resend: true,
                            revoke: true,
                        }}
                    />
                </div>
            </td>
        </>
    );

    const expandedContent = (
        <div className="space-y-4">
            <ExpandedDetailGrid cols={3}>
                <ExpandedDetailItem
                    icon="fa-duotone fa-regular fa-building"
                    label="Company"
                    value={invitation.company_name_hint || "Not specified"}
                />
                <ExpandedDetailItem
                    icon="fa-duotone fa-regular fa-envelope"
                    label="Email"
                    value={invitation.invited_email || "No email"}
                />
                <ExpandedDetailItem
                    icon="fa-duotone fa-regular fa-link"
                    label="Invite Link"
                    value={getInviteLink(invitation)}
                />
            </ExpandedDetailGrid>

            {invitation.personal_message && (
                <div className="bg-base-200 rounded-lg p-3 text-sm">
                    <span className="font-medium text-base-content/60 block mb-1">
                        Personal Message
                    </span>
                    <span className="whitespace-pre-wrap">
                        {invitation.personal_message}
                    </span>
                </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-base-300">
                <InvitationActionsToolbar
                    invitation={invitation}
                    variant="descriptive"
                    layout="horizontal"
                    size="sm"
                    onViewDetails={onViewDetails}
                    onRefresh={refresh}
                />
            </div>
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`invitation-${invitation.id}`}
            cells={cells}
            expandedContent={expandedContent}
        />
    );
}
