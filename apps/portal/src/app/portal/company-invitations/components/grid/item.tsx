"use client";

import { useUserProfile } from "@/contexts";
import {
    MetricCard,
    KeyMetric,
    DataList,
    DataRow,
} from "@/components/ui/cards";
import {
    RecruiterCompanyRelationship,
    getStatusBadgeClass,
    getStatusLabel,
    formatDate,
    getCounterpartyName,
    getCounterpartySubtext,
    getInitials,
} from "../../types";
import ConnectionActionsToolbar from "../shared/actions-toolbar";
import { useConnectionFilter } from "../../contexts/filter-context";

interface ItemProps {
    invitation: RecruiterCompanyRelationship;
    onViewDetails: (id: string) => void;
}

export default function Item({ invitation, onViewDetails }: ItemProps) {
    const { refresh } = useConnectionFilter();
    const { isCompanyUser } = useUserProfile();

    const counterpartyName = getCounterpartyName(invitation, isCompanyUser);
    const counterpartySubtext = getCounterpartySubtext(invitation, isCompanyUser);

    return (
        <MetricCard className="group hover:shadow-lg transition-all">
            <MetricCard.Header>
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder">
                        <div className="bg-secondary text-secondary-content w-10 h-10 rounded-lg">
                            <span className="text-sm">
                                {getInitials(counterpartyName)}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm group-hover:text-primary line-clamp-1">
                            {counterpartyName}
                        </h3>
                        {counterpartySubtext && (
                            <p className="text-xs text-base-content/60 line-clamp-1">
                                {counterpartySubtext}
                            </p>
                        )}
                    </div>
                    <span
                        className={`badge badge-sm ${getStatusBadgeClass(invitation.status)}`}
                    >
                        {getStatusLabel(invitation.status)}
                    </span>
                </div>
            </MetricCard.Header>

            <MetricCard.Body>
                <KeyMetric
                    label="Status"
                    value={getStatusLabel(invitation.status)}
                    valueColor={
                        invitation.status === "active"
                            ? "text-success"
                            : invitation.status === "pending"
                              ? "text-info"
                              : "text-base-content/50"
                    }
                />

                <DataList compact>
                    <DataRow
                        icon="fa-duotone fa-regular fa-tag"
                        label="Type"
                        value={invitation.relationship_type}
                    />
                    <DataRow
                        icon="fa-duotone fa-regular fa-calendar"
                        label="Received"
                        value={formatDate(invitation.created_at)}
                    />
                    {invitation.can_manage_company_jobs && (
                        <DataRow
                            icon="fa-duotone fa-regular fa-briefcase"
                            label="Permissions"
                            value="Can manage jobs"
                        />
                    )}
                </DataList>
            </MetricCard.Body>

            <MetricCard.Footer>
                <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-base-content/50">
                        {formatDate(invitation.created_at)}
                    </span>
                    <ConnectionActionsToolbar
                        invitation={invitation}
                        variant="icon-only"
                        layout="horizontal"
                        size="xs"
                        onViewDetails={onViewDetails}
                        onRefresh={refresh}
                    />
                </div>
            </MetricCard.Footer>
        </MetricCard>
    );
}
