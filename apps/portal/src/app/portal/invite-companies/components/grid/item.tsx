"use client";

import {
    MetricCard,
    KeyMetric,
    DataList,
    DataRow,
} from "@/components/ui/cards";
import {
    CompanyInvitation,
    getStatusBadgeClass,
    formatInvitationDate,
    getDaysUntilExpiry,
} from "../../types";
import InvitationActionsToolbar from "../shared/actions-toolbar";
import { useInvitationFilter } from "../../contexts/filter-context";

interface ItemProps {
    invitation: CompanyInvitation;
    onViewDetails: (id: string) => void;
}

export default function Item({ invitation, onViewDetails }: ItemProps) {
    const { refresh } = useInvitationFilter();

    const daysUntilExpiry = getDaysUntilExpiry(invitation.expires_at);
    const isExpiringSoon =
        daysUntilExpiry <= 7 &&
        daysUntilExpiry > 0 &&
        invitation.status === "pending";

    const getKeyMetricValue = () => {
        switch (invitation.status) {
            case "pending":
                if (daysUntilExpiry <= 0) return "Expired";
                return `${daysUntilExpiry}d left`;
            case "accepted":
                return "Accepted";
            case "expired":
                return "Expired";
            case "revoked":
                return "Revoked";
            default:
                return invitation.status;
        }
    };

    const getKeyMetricColor = () => {
        switch (invitation.status) {
            case "pending":
                return isExpiringSoon ? "text-warning" : "text-info";
            case "accepted":
                return "text-success";
            case "expired":
            case "revoked":
                return "text-base-content/50";
            default:
                return "";
        }
    };

    return (
        <MetricCard className="group hover:shadow-lg transition-all">
            <MetricCard.Header>
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder">
                        <div className="bg-base-200 w-10 h-10 rounded-lg">
                            <span className="text-base-content/60 text-lg">
                                <i className="fa-duotone fa-regular fa-building" />
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm group-hover:text-primary line-clamp-1">
                            {invitation.company_name_hint ||
                                "Company Invitation"}
                        </h3>
                        {invitation.invited_email && (
                            <p className="text-xs text-base-content/60 line-clamp-1">
                                {invitation.invited_email}
                            </p>
                        )}
                    </div>
                    <span
                        className={`badge badge-sm ${getStatusBadgeClass(invitation.status)}`}
                    >
                        {invitation.status}
                    </span>
                </div>
            </MetricCard.Header>

            <MetricCard.Body>
                <KeyMetric
                    label="Status"
                    value={getKeyMetricValue()}
                    valueColor={getKeyMetricColor()}
                />

                <DataList compact>
                    <DataRow
                        icon="fa-duotone fa-regular fa-hashtag"
                        label="Code"
                        value={invitation.invite_code}
                    />
                    <DataRow
                        icon="fa-duotone fa-regular fa-calendar"
                        label="Created"
                        value={formatInvitationDate(invitation.created_at)}
                    />
                    <DataRow
                        icon="fa-duotone fa-regular fa-hourglass"
                        label="Expires"
                        value={formatInvitationDate(invitation.expires_at)}
                    />
                    {invitation.email_sent_at && (
                        <DataRow
                            icon="fa-duotone fa-regular fa-envelope-circle-check"
                            label="Email Sent"
                            value="Yes"
                        />
                    )}
                </DataList>
            </MetricCard.Body>

            <MetricCard.Footer>
                <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-base-content/50">
                        {formatInvitationDate(invitation.created_at)}
                    </span>
                    <InvitationActionsToolbar
                        invitation={invitation}
                        variant="icon-only"
                        layout="horizontal"
                        size="xs"
                        onViewDetails={onViewDetails}
                        onRefresh={refresh}
                        showActions={{
                            copyCode: true,
                            copyLink: true,
                            share: true,
                            resend: true,
                            revoke: false,
                        }}
                    />
                </div>
            </MetricCard.Footer>
        </MetricCard>
    );
}
